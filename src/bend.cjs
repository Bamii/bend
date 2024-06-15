const path = require("node:path");
const childprocess = require("child_process")
const fs = require("node:fs/promises");
const fse = require("fs-extra");
const babel = require("@babel/parser");
const generator = require("@babel/generator");
const types = require("@babel/types");
const { isIdentifier, isFunctionDeclaration } = types;
const { walk, ensureFolder } = require("./utils/index.cjs")

const OUTPUT_FILE = "BEND";

const FUNCTIONS = new Map();
let FUNCTIONS_META = new Map();
const MODELS = new Map();
const BEND_AST = [];
const GENERAL_MIDDLEWARES = new Set();
const SHARED_MIDDLEWARES = new Set();
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
        modules.set(ast.name, ast);
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

  await generateGeneralMiddlewares();
  await generateBaseFiles()
}

async function __bootstrap__() {
  try {
    console.log("- started bootstrap")
    await ensureFolder(OUTPUT_FILE);

    await setupBendAst();
    await setupFunctions();
    await setupModels();
  } catch (error) {
    console.log(error)
  }
}

async function setupModels() {
  console.log("---")
  console.log('- fetching and parsing models.json...')
  const models_meta = await fs.readFile("./src/data/models.json");
  const parsed = JSON.parse(models_meta.toString());
  console.log('done.')
  console.log("---")
  console.log()

  console.log("---")
  console.log("- generating the schema. (prisma)")
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

  console.log("- ensuring database output folder")
  const url = OUTPUT_FILE + "/prisma";
  await ensureFolder(url)
  console.log("done.")

  console.log("- writing to file")
  await fs.writeFile(url + "/schema.prisma", content.join("\n"));
  console.log("done.")
  console.log("---")
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

async function generateBaseFiles() {
  let dependencies = {}

  for (let plugin of PLUGINS) {
    await ensureFolder(OUTPUT_FILE + "/plugins/" + plugin)
    fse.copySync("src/data/plugins/" + plugin, OUTPUT_FILE + "/plugins/" + plugin)

    const pkg = await fs.readFile("./src/data/plugins/" + plugin + "/package.json");
    const _pkg = JSON.parse(pkg.toString())

    if (_pkg.dependencies) {
      dependencies = { ...dependencies, ..._pkg.dependencies }
    }
  }

  await setupConfigFiles(dependencies);
}

async function generateGeneralMiddlewares() {
  const import_statements = [];
  const body_statements = [];

  for (let middleware of GENERAL_MIDDLEWARES) {
    const mw = FUNCTIONS.get(middleware);

    if (mw.meta.type == "MiddlewareFunction") {
      let sset = new Set();

      for (let _import of mw.meta.imports) {
        if (!sset.has(_import.module)) {
          let statement = ""
          switch (_import.type) {
            case "auth_scheme":
              statement = `import * as ${_import.scheme}Scheme from "~/plugins/${_import.module}/function.mjs";`
              break;

            case "module": {
              statement = `import * as ${_import.module} from "~/plugins/${_import.module}/function.mjs";`;
              break;
            }
            default:
              break;
          }

          sset.add(_import.module)
          PLUGINS.add(_import.module);

          import_statements
            .push(babel.parse(statement, { sourceType: "module" }).program.body[0]);
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

async function setupBendAst() {
  const bend_ast = await fs.readFile("./src/data/bendast.json");
  BEND_AST.push(JSON.parse(bend_ast.toString()));
}

async function setupModule(modulename, ast) {
  if (!types.isValidIdentifier(modulename))
    throw new Error("invalid module name.");

  const isnotroot = modulename !== "app" && modulename !== "name";
  const import_statements = [];
  const export_statements = [];
  const body_statements = [];

  if (isnotroot) {
    await ensureFolder(`${OUTPUT_FILE}/modules/${modulename}`);

    const used_middlewares = new Set();
    const controller_mw = new Set();
    const general_mw = new Set();
    ast.middlewares.forEach(e => {
      general_mw.add(e.value);
      GENERAL_MIDDLEWARES.add(e.value)
      return e.value
    });

    const endpoints = []
    walk(ast, {
      prenode: {
        Endpoint: (endpoint_ast) => {
          for (let mw of [...endpoint_ast.middlewares, endpoint_ast.body]) {
            if (mw.type == "ControllerMiddlewareFunction") {
              controller_mw.add(mw.value);
            } else {
              general_mw.add(mw.value);
              GENERAL_MIDDLEWARES.add(mw.value)
            }

            // const middleware = FUNCTIONS_META.get(mw.value)
            // IMPORTS.add(...(middleware?.imports ?? []))
            used_middlewares.add(mw.value);
          }

          let options = {}
          let auth = new Set([...ast.authentication, ...endpoint_ast.authentication].map(e => e.name))
          if (auth.size > 0) {
            options.auth = { strategies: [...auth] }
          }

          endpoints.push(`{
            method: ['${endpoint_ast.method.toUpperCase()}'],
            path: '${ast.path}${endpoint_ast.path}',
            handler: ${endpoint_ast.body.value},
            options: ${JSON.stringify(options)},
            pre: [${[...general_mw.keys()].join(", ")}]
          }`);

          return true;
        },
      },
    });

    body_statements.push(
      babel.parse(`const routes = [${endpoints}];`).program.body[0]
    );

    export_statements.push(
      babel.parse(`export default routes;`, { sourceType: "module" }).program.body[0]
    )

    if (controller_mw.size > 0) {
      import_statements.push(
        babel.parse(
          `import { ${[...controller_mw].join(", ")} } from "./${modulename}.service.mjs";`,
          { sourceType: "module" }
        ).program.body[0]
      );
    }

    if (general_mw.size > 0) {
      import_statements.push(
        babel.parse(
          `import { ${[...general_mw].join(", ")} } from "~/middlewares";`,
          { sourceType: "module" }
        ).program.body[0]
      );
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

    // -----------------------------------------------------------------------------------
    // sort the controller file,
    statements = [
      ...import_statements,
      ...body_statements,
      ...export_statements,
    ];

    code = generator.default(types.program(statements)).code;
    await fs.writeFile(url + "/" + modulename + ".controller.mjs", code);
  } else {
    const used_middlewares = new Set()
    await ensureFolder(`${OUTPUT_FILE}/modules/`);

    import_statements.push(
      babel.parse(
        `import * as Hapi from'@hapi/hapi';`,
        { sourceType: "module" }
      ).program.body[0]
    );

    import_statements.push(
      babel.parse(
        `import * as routes from "./modules/index"`,
        { sourceType: "module" }
      ).program.body[0]
    )

    const create_server_options = {
      autoListen: true,
      port: 3000,
      router: { isCaseSensitive: true, stripTrailingSlash: false },
    }

    body_statements.push(
      babel.parse(
        `const server = Hapi.server(${JSON.stringify(create_server_options)});`,
        { sourceType: "module" }
      ).program.body[0]
    );

    body_statements.push(babel.parse(`console.log(routes.default);`).program.body[0])

    const iife_body = []
    for (let scheme of ast.authentication_schemes) {
      PLUGINS.add(scheme.module)

      import_statements.push(
        babel.parse(
          `import * as ${scheme.name}Scheme from "~/plugins/${scheme.module}/function.mjs";`,
          { sourceType: "module" }
        ).program.body[0]
      );

      const validator = scheme.validator ? `validator: ${scheme.validator}` : "";
      if (scheme.validator) {
        GENERAL_MIDDLEWARES.add(scheme.validator)
        used_middlewares.add(scheme.validator)
      }

      iife_body.push(
        babel.parse(
          `await ${scheme.name}Scheme.register(server, { name: "${scheme.name}", ${validator} })`,
          { sourceType: "module" }
        ).program.body[0]
      );
    }

    if (used_middlewares.size > 0) {
      import_statements.push(
        babel.parse(
          `import { ${[...used_middlewares].join(", ")} } from "~/middlewares";`,
          { sourceType: "module" }
        ).program.body[0]
      );
    }

    if (ast.authentication) {
      create_server_options.options = { auth: ast.authentication.name };
      iife_body.push(babel.parse(`server.auth.default('${ast.authentication.name}');`).program.body[0])
    }

    iife_body.push(babel.parse(`server.route(routes.default);`).program.body[0])
    iife_body.push(
      types.expressionStatement(
        types.awaitExpression(
          types.callExpression(
            types.memberExpression(
              types.identifier("server"),
              types.identifier("start")
            ),
            []
          )
        )
      )
    );

    ast.middlewares.forEach(e => {
      GENERAL_MIDDLEWARES.add(e.value)
      SHARED_MIDDLEWARES.add(e.value)
      return e.value
    });

    body_statements.push(
      types.expressionStatement(
        types.callExpression(
          types.functionExpression(
            null,
            [],
            types.blockStatement(iife_body),
            false,
            true
          ),
          []
        )
      )
    );

    export_statements.push(babel.parse(`export default server;`, { sourceType: "module" }).program.body[0])
    const statements = [
      ...import_statements,
      ...body_statements,
      ...export_statements,
    ];

    const code = generator.default(types.program(statements)).code;
    const url = "./" + OUTPUT_FILE;
    await ensureFolder(url);
    await fs.writeFile(url + "/" + "app.mjs", code);
  }
}

async function setupConfigFiles(dependencies) {
  const package_string = {
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
      "@hapi/hapi": "latest",
      ...dependencies,
    },
    "keywords": [],
    "author": "",
    "license": "ISC"
  }

  const url = OUTPUT_FILE;
  await ensureFolder(url)
  console.log()
  console.log("---")
  console.log("- writing package.json to file")
  await fs.writeFile(url + "/package.json", JSON.stringify(package_string));
  console.log("done.")

  console.log("- copying data files to folder.")
  fse.copySync("src/data/tsconfig.json", OUTPUT_FILE + "/tsconfig.json")
  fse.copySync("src/data/autogen.ts", OUTPUT_FILE + "/autogen.ts")
  fse.copySync("src/data/routes-index.ts", OUTPUT_FILE + "/modules/index.ts")
  fse.copySync("src/data/static", OUTPUT_FILE + "/static")
  fse.copySync("src/data/views", OUTPUT_FILE + "/views")
  console.log("done.")
  console.log("---")
}
