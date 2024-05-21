const path = require("node:path");
const childprocess = require("child_process")
const fs = require("node:fs/promises");
const fse = require("fs-extra");
const babel = require("@babel/parser");
const generator = require("@babel/generator");
const types = require("@babel/types");
const { isIdentifier, isFunctionDeclaration } = types;
const { walk } = require("./utils/index.cjs")

const OUTPUT_FILE = "BEND";

const FUNCTIONS = new Map();
let FUNCTIONS_META = new Map();
const MODELS = new Map();
const BEND_AST = [];
const MIDDLEWARES = new Set();
const PLUGINS = new Set();

bend();

async function bend() {
    try {
        await __bootstrap__();

        await bendit();
    } catch (error) {
        console.log(error)
    }
}

async function bendit() {
    const [ast] = BEND_AST;
    const modules = new Map();

    // get modules.
    walk(ast, {
        prenode: {
            Module: (ast) => {
                modules.set(ast.path, ast);
                return true;
            }
        },
    });

    // setup root module.
    await setupModule("app", ast);

    // setup branch modules.
    for (let [, ast] of modules.entries()) {
        await setupModule(ast.name, ast);
        console.log("--------------------------------------------------------");
        console.log();
    }

    await setupGeneralMiddlewares();
    await setupPlugins()
}

async function __bootstrap__() {
    try {
        // make sure output folder is created.
        await ensureFolder(OUTPUT_FILE);

        await setupBendAst();
        await setupFunctions();
        await setupModels();
        await setupConfigFiles();
    } catch (error) {
        console.log(error)
    }
}

async function setupModels() {
    console.log("---")
    console.log('fetching and parsing models.json...')
    console.log("---")
    const models_meta = await fs.readFile("./src/data/models.json");
    const parsed = JSON.parse(models_meta.toString());
    console.log('done.')

    console.log("generating the schema. (prisma)")
    let content = [];
    content.push(`generator client {`)
    content.push(`\tprovider = "${parsed.generator.provider ?? 'prisma-client-js'}"`)
    content.push("}\n")

    if (parsed.datasource) {
        content.push(`datasource db {`)
        content.push(`\tprovider = "${parsed.datasource.provider}"`)
        content.push(`\turl = ${parsed.datasource.url.type == "env" ? `env("${parsed.datasource.url.value}")` : `"${parsed.datasource.url.value}"`}`)
        content.push('}\n')
    }

    for (let entity of parsed.entities) {
        switch (entity.type) {
            case "model":
                MODELS.set(entity.name.toLowerCase(), entity);
                content.push(`model ${entity.name} {`)
                for (let field of entity.fields) {
                    let type = field.type.toLowerCase() == "relation" ? field.model : field.type;
                    let str = `\t${field.title} ${type}${field.optional ? "?" : ""} `

                    if (field.modifiers) {
                        for (let modifier of field.modifiers) {
                            let local = ` ${modifier.modifier}`;
                            local += `${modifier.arguments == null ? '' : `(${modifier.arguments.join(",")})`}`
                            str += local
                        }
                    }

                    content.push(str)
                }
                content.push('}\n')
                break;

            case "enum": {
                content.push(`enum ${entity.name} {`)
                content.push(...entity.enums.map(e => `\t${e}`))
                content.push('}\n')
                break;
            }

            case "type": {
                content.push(`type ${entity.name} {`)
                content.push(...entity.fields.map(e => `\t${e.title} ${e.type}${e.optional ? "?" : ""}`))
                content.push('}\n')
                break;
            }

            default:
                break;
        }
    }

    console.log("ensuring database output folder")
    const url = OUTPUT_FILE + "/prisma";
    await ensureFolder(url)
    console.log("done.")

    console.log("writing to file")
    await fs.writeFile(url + "/schema.prisma", content.join("\n"));
    console.log("done.")
}

async function setupFunctions() {
    try {
        const _functions_meta = await fs.readFile("./src/data/functions.json");
        const parsed = JSON.parse(_functions_meta.toString());
        FUNCTIONS_META = new Map(Object.entries(parsed));

        const functions = await fs.readFile("./src/data/functions.js");
        const functions_ast = babel.parse(functions.toString());

        for (let fn of functions_ast.program.body) {
            if (isFunctionDeclaration(fn)) {
                const fnname = fn.id.name;
                let [type, module, _] = fnname.split("__");

                switch (type) {
                    case "mw":
                    case "ctrl":
                        type = "MiddlewareFunction";
                        break;

                    case "fn":
                        type = "Function";
                    default:
                        break;
                }

                const meta = FUNCTIONS_META.get(fn.id.name);
                FUNCTIONS.set(fn.id.name, {
                    name: fn.id.name,
                    type,
                    module,
                    ast: fn,
                    meta,
                });
            }
        }
    } catch (error) { }
}

async function setupPlugins() {
    for (let plugin of PLUGINS) {
        await ensureFolder(OUTPUT_FILE + "/plugins/" + plugin)
        fse.copySync("src/data/plugins/" + plugin, OUTPUT_FILE + "/plugins/" + plugin)
    }
}

async function setupGeneralMiddlewares() {
    const import_statements = [];
    const body_statements = [];

    for (let middleware of MIDDLEWARES) {
        const mw = FUNCTIONS.get(middleware);

        if (mw.meta.type == "MiddlewareFunction") {
            // let imports_set = new Set(mw.meta.imports.map(e => e.module));
            let sset = new Set();

            for (let _import of mw.meta.imports) {
                if (!sset.has(_import.module)) {
                    switch (_import.type) {
                        case "auth_scheme":
                            import_statements.push(
                                babel.parse(
                                    `import * as ${_import.scheme}Scheme from "~/plugins/${_import.module}/function.mjs";`,
                                    { sourceType: "module" }
                                ).program.body[0]
                            );
                            break;

                        case "module": {
                            import_statements.push(
                                babel.parse(
                                    `import * as ${_import.module} from "~/plugins/${_import.module}/function.mjs";`,
                                    { sourceType: "module" }
                                ).program.body[0]
                            );
                            break;
                        }
                        default:
                            break;
                    }
                    sset.add(_import.module)
                    PLUGINS.add(_import.module);
                }
            }

            body_statements.push(types.exportNamedDeclaration(mw.ast))
        }
    }

    const url = OUTPUT_FILE + "/middlewares";
    await ensureFolder(url);

    let statements = [...import_statements, ...body_statements];
    let code = generator.default(types.program(statements)).code;
    await fs.writeFile(url + "/index.mjs", code);
}

async function loadPlugin() {
    try {
        const functions_ = await fs.readFile("./src/data/module/functions.mjs");
        const _functions_ast = babel.parse(functions_.toString(), {
            sourceType: "module",
        });

        for (let exported of _functions_ast.program.body) {
            if (
                types.isExportDefaultDeclaration(exported) ||
                types.isExportNamedDeclaration(exported)
            ) {
            }
        }
        console.log(_functions_ast.program.body);
        // console.log(functions_ast)
    } catch (error) {
        console.log(error);
    }
}

async function setupBendAst() {
    const bend_ast = await fs.readFile("./src/data/bendast.json");
    BEND_AST.push(JSON.parse(bend_ast.toString()));
}

async function setupModule(modulename, ast) {
    if (!types.isValidIdentifier(modulename))
        return;

    const isnotroot = modulename !== "app" && modulename !== "name";
    const import_statements = [];
    const export_statements = [];
    const body_statements = [];

    if (isnotroot) {
        await ensureFolder(`${OUTPUT_FILE}/modules/${modulename}`);
        let import_statement = babel.parse(
            `import Router from "@koa/router";`,
            { sourceType: "module" }
        );
        const router_statement = babel.parse(
            `
            const router = new Router({
                prefix: "/${modulename}"
            });
            `,
            { sourceType: "module" }
        );

        import_statements.push(import_statement.program.body[0]);
        body_statements.push(router_statement.program.body[0]);

        const used_middlewares = new Set();
        const controller_mw = new Set();
        const general_mw = new Set();
        const mws = ast.middlewares.map(e => {
            general_mw.add(e.value);
            MIDDLEWARES.add(e.value)
            return e.value
        });

        if (mws.length > 0) {
            body_statements.push(
                babel.parse(`router.use(${mws.join(", ")})`).program.body[0]
            );
        }

        walk(ast, {
            prenode: {
                Endpoint: (ast) => {
                    const mw_list = ast.middlewares
                        .map((e) => e.value)
                        .join(", ");

                    const endpoint_statement = babel.parse(`
                        router.${ast.method}('${ast.path}', ${mw_list ? `${mw_list},` : ""} ${ast.body.value});
                    `);

                    for (let mw of [...ast.middlewares, ast.body]) {
                        if (mw.type == "ControllerMiddlewareFunction") {
                            controller_mw.add(mw.value);
                        } else {
                            general_mw.add(mw.value);
                            MIDDLEWARES.add(mw.value)
                        }

                        // const middleware = FUNCTIONS_META.get(mw.value)
                        // IMPORTS.add(...(middleware?.imports ?? []))
                        used_middlewares.add(mw.value);
                    }

                    // MIDDLEWARES.add(ast.body.value)
                    used_middlewares.add(ast.body.value);
                    controller_mw.add(ast.body.value)
                    body_statements.push(endpoint_statement.program.body[0]);
                    return true;
                },
            },
        });

        if (controller_mw.size > 0) {
            import_statement = babel.parse(
                `import { ${[...controller_mw].join(", ")} } from "./${modulename}.service.mjs";`,
                { sourceType: "module" }
            );
            import_statements.push(import_statement.program.body[0]);
        }

        if (general_mw.size > 0) {
            import_statement = babel.parse(
                `import { ${[...general_mw].join(", ")} } from "~/middlewares";`,
                { sourceType: "module" }
            );
            import_statements.push(import_statement.program.body[0]);
        }

        // ensure module folder.
        const url = "./" + OUTPUT_FILE + "/modules/" + modulename;
        await ensureFolder(url);


        // sort the service file,
        const service_imports = [];
        let service_body = new Set();

        const imports = new Set(ast.endpoints.flatMap(e => FUNCTIONS_META.get(e.body.value).imports))
        for (let _import of imports) {
            PLUGINS.add(_import.module)
            let statement = babel.parse(
                `import * as ${_import.module} from "~/plugins/${_import.module}/function.mjs";`,
                { sourceType: "module" }
            )
            service_imports.push(statement.program.body[0])
        }
        for (let mw of ast.endpoints) {
            service_body.add(mw.body.value)
        }
        service_body = [...service_body].map(e => types.exportNamedDeclaration(FUNCTIONS.get(e).ast))
        let statements = [...service_imports, ...service_body];
        let code = generator.default(types.program(statements)).code;
        await fs.writeFile(url + "/" + modulename + ".service.mjs", code);

        // sort the controller file,
        statements = [
            ...import_statements,
            ...body_statements,
            ...export_statements,
        ];
        statements.push(types.exportDefaultDeclaration(
            types.identifier("router")
        ))
        code = generator.default(types.program(statements)).code;
        await fs.writeFile(url + "/" + modulename + ".controller.mjs", code);
    } else {
        await ensureFolder(`${OUTPUT_FILE}/modules/`);

        import_statements.push(
            babel.parse(
                `import Koa from "koa";`,
                { sourceType: "module" }
            ).program.body[0]
        );
        import_statements.push(
            babel.parse(
                `import passport from "passport";`,
                { sourceType: "module" }
            ).program.body[0]
        );
        body_statements.push(
            babel.parse(`
            const app = new Koa();
            `).program.body[0]
        );

        for (let scheme of ast.authentication_schemes) {
            import_statements.push(
                babel.parse(
                    `import * as ${scheme.name}Scheme from "~/plugins/${scheme.module}/function.mjs";`, 
                    { sourceType: "module" }
                ).program.body[0]
            );
            body_statements.push(
                babel.parse(
                    `app.use(${scheme.name}Scheme.register("${scheme.name}"))`
                ).program.body[0]
            );
        }

        let mws = ast.middlewares.map(e => {
            MIDDLEWARES.add(e.value)
            return e.value
        })
        if (ast.middlewares.length > 0) {
            import_statements.push(
                babel.parse(`import { ${mws.join(", ")} } from "~/middlewares"`, { sourceType: "module" }).program.body[0]
            )
        }

        // mws = mws.concat(ast.authentication.map(e => `passport.authenticate("${e}")`))
        if (ast.authentication.length > 0) {
            body_statements.push(
                babel.parse(`app.use(passport.authenticate(${ast.authentication.map(e => `"${e}"`).join(", ")}))`).program.body[0]
            );            
        }
        if (mws.length > 0) {
            body_statements.push(
                babel.parse(`app.use(${mws.join(", ")})`).program.body[0]
            );
        }

        for (let _module of ast.modules) {
            let routerName = `${_module.name}Router`
            const import_statement = babel.parse(
                `import ${routerName} from "./modules/${_module.name}/${_module.name}.controller.mjs";`,
                { sourceType: "module" }
            )
            const routes = babel.parse(`app.use(${routerName}.routes(), ${routerName}.allowedMethods());`)

            import_statements.push(import_statement.program.body[0]);
            body_statements.push(routes.program.body[0])
        }

        body_statements.push(babel.parse(`app.listen(3000)`).program.body[0])
        const statements = [
            ...import_statements,
            ...body_statements,
            ...export_statements,
        ];

        const code = generator.default(types.program(statements)).code;
        const url = "./" + OUTPUT_FILE;
        await ensureFolder(url);
        await fs.writeFile(
            url + "/" + "app.mjs",
            code
        );
    }
}

async function ensureFolder(path) {
    try {
        await fs.mkdir(path, { recursive: true });
    } catch (error) { }
}

// { project_name, description }
async function setupConfigFiles() {
    const package_string = JSON.stringify({
        "name": "data",
        "version": "1.0.0",
        "description": "",
        "main": "functions.js",
        "scripts": {
            "start": "bun run setup:prisma && bun ./app.mjs",
            "setup:prisma": "bun prisma format && bun prisma generate",
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "dependencies": {
            "@koa/router": "^12.0.1",
            "@prisma/client": "5.14.0",
            "prisma": "latest",
            "passport": "latest",
            "koa": "^2.15.3"
        },
        "keywords": [],
        "author": "",
        "license": "ISC"
    })

    const url = OUTPUT_FILE;
    await ensureFolder(url)
    console.log("writing package.json to file")
    await fs.writeFile(url + "/package.json", package_string);
    console.log("done.")

    fse.copySync("src/data/tsconfig.json", OUTPUT_FILE + "/tsconfig.json")
    fse.copySync("src/data/autogen.ts", OUTPUT_FILE + "/autogen.ts")
}
