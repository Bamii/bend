// import bun from "bun"
import fs from "node:fs/promises";
import babel from "@babel/parser";
import types from "@babel/types";
import * as generator from "@babel/generator";
import { isIdentifier } from "@babel/types";
import { isFunctionDeclaration } from "@babel/types";


const OUTPUT = "BEND";

const FUNCTIONS = new Map();
const BEND_AST = [];

bend();

async function bend() {
    await __bootstrap__();

    const state = {};
    const MODELS = [
        { type: "model", name: "Dogs", fields: [] },
        { type: "model", name: "Cats", fields: [] },
    ];
    const FUNCTIONS = new Map();

    console.log(BEND_AST)
    // debugger
    const [bendast] = BEND_AST;
    setupModels(state, MODELS);
    setupBend(state, { ast: bendast, functions: FUNCTIONS });
}

async function setupBend(state, { ast, functions }) {
    // const fns_state = state.functions;
    // const fns_state = new Map();
    const endpoints = new Map();
    const modules = new Map();
    console.log(functions);
    console.log(ast)
    // get modules.
    walk(ast, {
        prenode: {
            Module: (ast) => {
                modules.set(ast.path, ast);
                // modules.set(ast.path, new Module(ast));
                console.log(ast);
                return true;
            },
            MiddlewareFunction: (ast) => {
                console.log(ast);
            },
        },
    });

    for (let [module_name, ast] of modules.entries()) {
        await setupModule(module_name, ast);
    }
}

function setupModels(state, models) {}

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
        await ensureFolder(OUTPUT);
        // const FUNCTIONS = [];
        const bend_ast = await fs.readFile("./src/data/bendast.json")
        BEND_AST.push(JSON.parse(bend_ast.toString()))
        const functions = await fs.readFile("./src/data/functions.js");
        const functions_ast = babel.parse(functions.toString());
        // console.log(ast.program.body)
    
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
    
                FUNCTIONS.set(fn.id.name, {
                    name: fn.id.name,
                    type,
                    module,
                    ast: fn,
                });
            }
        }
    
        // console.log(FUNCTIONS)
        
    } catch (error) {
        // debugger
    }
}

async function setupModule(modulename, ast) {
    // const modulename = module.name;
    const isroot = modulename == "app" || modulename == "name";
    const import_statements = [];
    const export_statements = [];
    const body_statements = [];

    if (!isroot) {
        await ensureFolder(`${OUTPUT}/modules/${modulename}`);
        const router_statement = babel.parse(`
            const router = new HapiRouter({
                path: "${modulename}"
            });
        `);

        body_statements.push(router_statement.program.body[0]);
    }

    const used_middlewares = new Set();
    walk(ast, {
        prenode: {
            Endpoint: (ast) => {
                const endpoint_statement = babel.parse(`
                    router.use('${ast.path}', ${ast.body.value});
                `);

                used_middlewares.add(ast.body.value);
                body_statements.push(endpoint_statement.program.body[0]);
                // console.log(ast);
                return true;
            },
        },
    });

    const statements = [
        ...import_statements,
        ...body_statements,
        ...export_statements,
    ];

    console.log(generator.default(types.program(statements)));
    console.log(used_middlewares);
    // sort the service file,

    // sort the controller file,
    //
}

async function ensureFolder(path) {
    try {
        await fs.mkdir(OUTPUT);
    } catch (error) {}
}
