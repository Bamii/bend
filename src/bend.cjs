const path = require("node:path");
const childprocess = require("child_process")
const fs = require("node:fs/promises");
const fse = require("fs-extra");
const babel = require("@babel/parser");
const generator = require("@babel/generator");
const types = require("@babel/types");
const { isIdentifier, isFunctionDeclaration } = types;

const OUTPUT_FILE = "BEND";

const FUNCTIONS = new Map();
const MODELS = new Map();
let FUNCTIONS_META = new Map();
const BEND_AST = [];
const MIDDLEWARES = new Set();

bend();

async function bend() {
    // try {
        const state = {};
        await __bootstrap__();
    
        // const MODELS = [
        //     { type: "model", name: "Dogs", fields: [] },
        //     { type: "model", name: "Cats", fields: [] },
        // ];
        await setupModels(state);
        
        // console.log(BEND_AST)
        // debugger
        console.log('yay')
        const [ast] = BEND_AST;
        await setupBend(state, { ast });
    // } catch (error) {
    //     console.log(error)
    // }
}

async function setupBend(state, { ast }) {
    // const fns_state = state.functions;
    // const fns_state = new Map();
    const endpoints = new Map();
    const modules = new Map();
    // console.log(functions);
    // console.log(ast)

    // get modules.
    walk(ast, {
        prenode: {
            Module: (ast) => {
                modules.set(ast.name, ast);
                return true;
            }
        },
    });

    await setupModule("app", ast)
    for (let [module_name, ast] of modules.entries()) {
        await setupModule(module_name, ast);
        console.log("--------------------------------------------------------");
        console.log();
    }

    await setupGeneralMiddlewares();
}

function walk(ast, actions) {
    const { pre, post, prenode, postnode } = actions;
    let res;
    switch (ast.type) {
        case "Program": {
            pre?.(ast);
            res = prenode?.["Program"]?.(ast);
            if (res) return;
            for (let _module of ast.modules) {
                walk(_module, actions);
            }
            postnode?.["Program"]?.(ast);
            post?.(ast);
            break;
        }

        case "Module": {
            pre?.(ast);
            res = prenode?.["Module"]?.(ast);
            if (res) return;
            for (let middleware of ast.middlewares) {
                walk(middleware, actions);
            }
            for (let endpoint of ast.endpoints) {
                walk(endpoint, actions);
            }
            post?.(ast);
            postnode?.["Module"]?.(ast);
            break;
        }
        case "Endpoint": {
            pre?.(ast);
            res = prenode?.["Endpoint"]?.(ast);
            if (res) return;
            for (let input of ast.inputs) {
                walk(input, actions);
            }
            for (let middleware of ast.middlewares) {
                walk(middleware, actions);
            }
            walk(ast.body, actions);
            post?.(ast);
            postnode?.["Endpoint"]?.(ast);
            break;
        }

        case "ControllerMiddlewareFunction": {
            pre?.(ast);
            res = prenode?.["ControllerMiddlewareFunction"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["ControllerMiddlewareFunction"]?.(ast);
            break;
        }

        case "MiddlewareFunction": {
            pre?.(ast);
            res = prenode?.["MiddlewareFunction"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["MiddlewareFunction"]?.(ast);
            break;
        }

        case "Function": {
            pre?.(ast);
            res = prenode?.["Function"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["Function"]?.(ast);
            break;
        }

        case "HeaderInput": {
            pre?.(ast);
            res = prenode?.["HeaderInput"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["HeaderInput"]?.(ast);
            break;
        }

        case "BodyInput": {
            pre?.(ast);
            res = prenode?.["BodyInput"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["BodyInput"]?.(ast);
            break;
        }
        case "CronJob": {
            pre?.(ast);
            res = prenode?.["CronJob"]?.(ast);
            if (res) return;
            walk(ast.body, actions);
            post?.(ast);
            postnode?.["CronJob"]?.(ast);
            break;
        }

        case "Entity": {
            pre?.(ast);
            res = prenode?.["Entity"]?.(ast);
            if (res) return;
            post?.(ast);
            postnode?.["Entity"]?.(ast);
            break;
        }

        default:
            break;
    }
}

async function __bootstrap__() {
    try {
        // make sure output folder is created.
        // debugger
        await ensureFolder(OUTPUT_FILE);
        await setupBendAst();
        await setupFunctions();
        await createPackageJson();
    } catch (error) {
        console.log(error)
    }
}

async function setupModels(state, models) {
    console.log('fetching and parsing models.json...')
    const models_meta = await fs.readFile("./src/data/models.json");
    const parsed = JSON.parse(models_meta.toString());
    console.log('done.')
    let content = [];

    console.log("generating the schema. (prisma)")
    content.push(`generator client {`)
    content.push(`\tprovider = "${parsed.generator.provider ?? 'prisma-client-js'}"`)
    content.push("}\n")

    if(parsed.datasource) {
        content.push(`datasource db {`)
        content.push(`\tprovider = "${parsed.datasource.provider}"`)
        content.push(`\turl = "${parsed.datasource.url.type == "env" ? `env(${parsed.datasource.url.value})` : parsed.datasource.url.value}"`)
        content.push('}\n')
    }

    for(let entity of parsed.entities) {
        switch (entity.type) {
            case "model":
                MODELS.set(entity.name.toLowerCase(), entity);
                content.push(`model ${entity.name} {`)
                for (let field of entity.fields) {
                    let type = field.type.toLowerCase() == "relation" ? field.model : field.type;
                    let str = `\t${field.title} ${type}${field.optional ? "?" : ""} `

                    if(field.modifiers) {
                        for (let modifier of field.modifiers) {
                            let local = ` ${modifier.modifier}`;
                            local+=`${modifier.arguments == null ? '' : `(${modifier.arguments.join(",")})`}`
                            str+=local
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
                content.push(...entity.fields.map(e => `\t${e.title} ${e.type}${e.optional?"?":""}`))
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
                    imports: [],
                });
            }
        }
    } catch (error) {
        const e = error;
    }
}

async function setupGeneralMiddlewares() {
    const import_statements = [];
    const body_statements = [];
    const export_statements = []; // ight not use.

    const url = OUTPUT_FILE + "/middlewares";
    await ensureFolder(url);

    let imports = new Set();
    for(let middleware of MIDDLEWARES) {
        const mw_meta = FUNCTIONS_META.get(middleware);
        const me = FUNCTIONS.get(middleware);
        for(let _import of new Set(mw_meta.imports.map(e => e.module))) {
            imports.add(_import);
            import_statements.push(
                babel.parse(
                    `import ${_import} from "~/plugins/${_import}/functions.mjs";`,
                    { sourceType: "module" }
                ).program.body[0]
            );
        }
        body_statements.push(types.exportNamedDeclaration(me.ast))
    }

    for(let plugin of imports) {
        await ensureFolder(OUTPUT_FILE+"/plugins/"+plugin)
        fse.copySync("src/data/plugins/"+plugin, OUTPUT_FILE+"/plugins/"+plugin)
    }

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
    if(!types.isValidIdentifier(modulename))
        return;

    const isnotroot = modulename !== "app" && modulename !== "name";
    const import_statements = [];
    const export_statements = [];
    const body_statements = [];

    if (isnotroot) {
        await ensureFolder(`${OUTPUT_FILE}/modules/${modulename}`);
        let import_statement = babel.parse(
            `import Router from "npm:@koa/router";`,
            { sourceType: "module" }
        );
        const router_statement = babel.parse(
            `
            export const router = new Router({
                prefix: "${modulename}"
            });
            `,
            { sourceType: "module" }
        );

        import_statements.push(import_statement.program.body[0]);
        body_statements.push(router_statement.program.body[0]);

        const used_middlewares = new Set();
        const controller_mw = new Set();
        const general_mw = new Set();
        walk(ast, {
            prenode: {
                Endpoint: (ast) => {
                    const mw_list = ast.middlewares
                        .map((e) => e.value)
                        .join(", ");

                    const endpoint_statement = babel.parse(`
                        router.${ast.method}('${ast.path}', ${mw_list}, ${ast.body.value});
                    `);

                    for (let mw of ast.middlewares) {
                        if (mw.type == "ControllerMiddlewareFunction") {
                            controller_mw.add(mw.value);
                        } else {
                            general_mw.add(mw.value);
                            MIDDLEWARES.add(mw.value)
                        }

                        used_middlewares.add(mw.value);
                    }

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
        for(let _import of imports) {
            let statement = babel.parse(
                `import ${_import.module} from "~/plugins/${_import.module}/functions.mjs";`,
                { sourceType: "module" }
            )
            service_imports.push(statement.program.body[0])
        }
        for (let mw of ast.endpoints) {
            service_body.add(mw.body.value)
            // service_body.push(
            //     types.exportNamedDeclaration(
            //         FUNCTIONS.get(mw.body.value).ast
            //     )
            // );
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
        code = generator.default(types.program(statements)).code;
        await fs.writeFile(url + "/" + modulename + ".controller.mjs", code);
    } else {
        await ensureFolder(`${OUTPUT_FILE}/modules/`);
        const import_statement = babel.parse(
            `import Koa from "npm:koa";`,
            { sourceType: "module" }
        );
        const router_statement = babel.parse(`
            const app = new Koa();
        `);

        import_statements.push(import_statement.program.body[0]);
        body_statements.push(router_statement.program.body[0]);

        // let command = 
        for(let _module of ast.modules) {
            let routerName = `${_module.name}Router`
            const import_statement = babel.parse(
                `import ${routerName} from "./modules/${_module.name}/${_module.name}.controller.mjs";`, 
                { sourceType: "module" }
            )
            const routes = babel.parse(`app.use(${routerName}.routes());`)
            const allowedRoutes = babel.parse(`app.use(${routerName}.allowedRoutes());`)

            import_statements.push(import_statement.program.body[0]);
            body_statements.push(routes.program.body[0])
            body_statements.push(allowedRoutes.program.body[0])
        }

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
    } catch (error) {}
}

async function createPackageJson() {
    const package_string = JSON.stringify({
        "name": "data",
        "version": "1.0.0",
        "description": "",
        "main": "functions.js",
        "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1"
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

    fse.copySync("src/data/deno.jsonc", OUTPUT_FILE+"/deno.jsonc")
}