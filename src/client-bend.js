// import bun from "bun"
import fs from "node:fs/promises"

const BEND_AST = [
    {
        type: "Program",
        modules: [
            {
                type: "Module",
                path: "admin",
                middlewares: [
                    { type: "MiddlewareFunction", value: "auth_middleware" },
                ],
                endpoints: [
                    {
                        type: "Endpoint",
                        method: "get",
                        path: "something",
                        inputs: [
                            {
                                type: "HeaderInput",
                                key: "token",
                                value: {
                                    type: "string",
                                    value: "nadihnoacj",
                                },
                            },
                            {
                                type: "BodyInput",
                                key: "token",
                                value: {
                                    type: "object",
                                    value: { me: "nadihnoacj" },
                                },
                            },
                        ],
                        middlewares: [
                            {
                                type: "MiddlewareFunction",
                                value: "auth_middleware",
                            },
                        ],
                        body: {
                            type: "MiddlewareFunction",
                            value: "something_service",
                        },
                    },
                ],
            },
            {
                type: "Module",
                path: "user",
                middlewares: [
                    { type: "MiddlewareFunction", value: "auth_middleware" },
                ],
                endpoints: [
                    {
                        type: "Endpoint",
                        method: "get",
                        path: "something",
                        inputs: [
                            {
                                type: "HeaderInput",
                                key: "token",
                                value: {
                                    type: "string",
                                    value: "nadihnoacj",
                                },
                            },
                            {
                                type: "BodyInput",
                                key: "token",
                                value: {
                                    type: "object",
                                    value: { me: "nadihnoacj" },
                                },
                            },
                        ],
                        middlewares: [
                            {
                                type: "MiddlewareFunction",
                                value: "auth_middleware",
                            },
                        ],
                        body: {
                            type: "MiddlewareFunction",
                            value: "something_service",
                        },
                    },
                ],
            },
        ],
        cron: [
            {
                type: "CronJob",
                time: "* * * * * *",
                name: "unique_id",
                body: { type: "Function", name: "dothisnow" },
                arguments: [],
            },
        ],
    },
];

// document.addEventListener("DOMContentLoaded", function () {
//     bend();
// });

bend();

function createStore() {
    const request = indexedDB.open("bend", 3);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create another object store called "names" with the autoIncrement flag set as true.
        const objStore = db.createObjectStore("objects");

        // Because the "names" object store has the key generator, the key for the name value is generated automatically.
        // The added records would be like:
        // key : 1 => value : "Bill"
        // key : 2 => value : "Donna"
        customerData.forEach((customer) => {
            objStore.add(customer.name);
        });
    };
}

function save(filename, object) {}

function bend() {
    __bootstrap__();


    const state = {};
    const MODELS = [{ type: "model", name: "Cats", fields: [] }];
    const FUNCTIONS = new Map([
        ["ctrl__module__get__namething", {
            module: "",
            type: "controller",
            name: "ctrl__module__get__namething",
            arguments: [],
        }],
        ["ctrl__module__post__anothername", {
            module: "",
            type: "controller",
            name: "ctrl__module__post__anothername",
            arguments: [],
        }],
        ["ctrl__module__get__fnname", {
            module: "",
            type: "controller",
            name: "ctrl__module__get__fnname",
            arguments: [],
        }],
        ["mdlw__module__middlewarename", {
            module: "",
            type: "middleware",
            name: "mdlw__module__middlewarename",
            arguments: [],
        }],
        ["func__utils__fnname", {
            module: "",
            type: "function",
            name: "func__utils__fnname",
            arguments: [],
        }],
    ]);

    const [bendast] = BEND_AST;
    setupModels(state, MODELS);
    setupBend(state, { ast: bendast, functions: FUNCTIONS });
}

function setupBend(state, { ast, functions }) {
    // const fns_state = state.functions;
    // const fns_state = new Map();
    const endpoints = new Map();
    const modules = new Map();
    console.log(functions)

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
        walk(ast, {
            prenode: {
                Endpoint: (ast) => {
                    endpoints.set(
                        `${module_name}.${ast.method}.${ast.path}`,
                        ast
                    );
                    // console.log(ast);
                    return true;
                },
            },
        });
    }

    for (let [endpoint_name, ast] of endpoints.entries()) {
        console.log(endpoint_name);
    }
}

class Module {
    #path;
    #middlewares;
    #endpoints;

    constructor({ path, middlewares, endpoints }) {
        this.#endpoints = endpoints;
        this.#path = path;
        this.#middlewares = middlewares;
    }
}

class Endpoint {
    #path;
    #inputs;

    constructor({ path, inputs }) {
        this.#path = path;
        this.#inputs = inputs;
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

const OUTPUT = 'BEND'
async function __bootstrap__() {
    // make sure output folder is created.
    await ensureFolder(OUTPUT)
}

async function setupModule(module) {
    const modulename = module.name   
    if(modulename !== "app" && modulename !== "name")
        await ensureFolder(`${OUTPUT}/modules/${modulename}`)

    // sort the service file,

    // sort the controller file,
    // 
}

async function ensureFolder(path) {
    try {
        await fs.mkdir(OUTPUT);
    } catch (error) {}
}