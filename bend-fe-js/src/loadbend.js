import * as esprima from "esprima"
// import { walk } from "./utils";
// import * as acorn from "acorn"
// import * as walk from "acorn-walk"
import * as parser from "@babel/parser"
import traverse from "@babel/traverse"
// import * as jsdoc from "comment-parser"
// import fs from "node:fs"
// import fsp from "node:fs/promises"

import pluginlist from "./data.json"

export function loadbend() {
    const state = {
        functions_meta: {},
        plugins: []
    }

    const bendast = JSON.parse(`
  {
    "type": "Program",
    "authentication_schemes": [
        {
            "type": "AuthenticationScheme",
            "name": "jwt",
            "module": "jwt-auth",
            "validator": "home"
        }
    ],
    "cache_schemes": {},
    "authentication": null,
    "middlewares": [],
    "modules": [
        {
            "type": "Module",
            "name": "cats",
            "path": "/cats",
            "authentication": [{
                "name": "jwt",
                "mode": "required"
            }],
            "middlewares": [
                {
                    "type": "MiddlewareFunction",
                    "value": "mw__auth__authmiddleware"
                }
            ],
            "endpoints": [
                {
                    "type": "Endpoint",
                    "path": "/something",
                    "method": "get",
                    "cors": false,
                    "authentication": [{
                        "name": "jwt",
                        "mode": "required"
                    }],
                    "inputs": [
                        {
                            "type": "HeaderInput",
                            "key": "token",
                            "value": {
                                "type": "string",
                                "value": "nadihnoacj"
                            }
                        },
                        {
                            "type": "BodyInput",
                            "key": "token",
                            "value": {
                                "type": "object",
                                "value": { "me": "nadihnoacj" }
                            }
                        }
                    ],
                    "middlewares": [],
                    "body": {
                        "type": "ControllerMiddlewareFunction",
                        "value": "ctrl__dog__get__getsingledog"
                    }
                },
                {
                    "type": "Endpoint",
                    "path": "/something",
                    "method": "post",
                    "description": "",
                    "cors": {
                        "origin": [],
                        "maxAge": "",
                        "headers": [],
                        "additionalHeaders": [],
                        "exposedHeaders": [],
                        "additionalExposedHeaders": [],
                        "credentials": true,
                        "preflightStatusCode": "200"
                    },
                    "inputs": [
                        {
                            "type": "HeaderInput",
                            "key": "token",
                            "value": {
                                "type": "string",
                                "value": "nadihnoacj"
                            }
                        },
                        {
                            "type": "BodyInput",
                            "key": "token",
                            "value": {
                                "type": "object",
                                "value": { "me": "nadihnoacj" }
                            }
                        }
                    ],
                    "authentication": [],
                    "middlewares": [],
                    "body": {
                        "type": "ControllerMiddlewareFunction",
                        "value": "ctrl__dog__get__getsingledog"
                    }
                }
            ]
        },
        {
            "type": "Module",
            "name": "dogs",
            "authentication": [],
            "path": "/dogs",
            "middlewares": [
                {
                    "type": "MiddlewareFunction",
                    "value": "mw_auth_authmiddleware2"
                }
            ],
            "endpoints": [
                {
                    "type": "Endpoint",
                    "path": "/something",
                    "authentication": [],
                    "method": "get",
                    "payload": {},
                    "cache": {
                        "privacy": "",
                        "expiresIn": "",
                        "statuses": ["200"],
                        "otherwise": ""
                    },
                    "description": "",
                    "cors": false,
                    "inputs": [
                        {
                            "type": "HeaderInput",
                            "key": "token",
                            "value": {
                                "type": "string",
                                "value": "nadihnoacj"
                            }
                        },
                        {
                            "type": "BodyInput",
                            "key": "token",
                            "value": {
                                "type": "object",
                                "value": { "me": "nadihnoacj" }
                            }
                        }
                    ],
                    "middlewares": [
                        {
                            "type": "MiddlewareFunction",
                            "value": "mw_auth_authmiddleware2"
                        }
                    ],
                    "body": {
                        "type": "ControllerMiddlewareFunction",
                        "value": "ctrl__cat__get__getsinglecat"
                    }
                }
            ]
        }
    ],
    "cron": [
        {
            "type": "CronJob",
            "time": "* * * * * *",
            "name": "unique_id",
            "body": {
                "type": "Function",
                "name": "fn__utils__getrandomNumber"
            },
            "arguments": []
        }
    ]
}
  `);
    const functions_ast = JSON.parse(`
   { 
    "fn__utils__getrandomNumber": {
        "type": "Function",
        "name": "fn__utils__getrandomNumber",
        "module": "bend__utils",
        "imports": [
            { "type": "module", "module": "maths" }
        ],
        "arguments": []
    },
    "mw__auth__authmiddleware2": {
        "type": "MiddlewareFunction",
        "name": "mw__auth__authmiddleware2",
        "imports": [
            { "type": "auth_scheme", "module": "auth", "scheme": "local" }
        ],
        "arguments": []
    },
    "ctrl__dog__get__getsingledog": {
        "type": "MiddlewareFunction",
        "name": "ctrl__dog__get__getsingledog",
        "imports": [],
        "arguments": []
    },
    "ctrl__cat__get__getsinglecat": {
        "type": "MiddlewareFunction",
        "name": "ctrl__cat__get__getsinglecat",
        "imports": [
            { "type": "module", "module": "maths" },
            { "type": "module", "module": "models" }
        ],
        "arguments": []
    },
    "mw__auth__authmiddleware": {
        "type": "MiddlewareFunction",
        "name": "mw__auth__authmiddleware",
        "imports": [
            { "type": "module", "module": "utils" }
        ],
        "arguments": []
    },
    "home": {
        "type": "MiddlewareFunction",
        "cache": {

        },
        "name": "mw__auth__authmiddleware",
        "imports": [],
        "arguments": []       
    }
  }
  `)
    const functions_repo = `
    async function mw__auth__authmiddleware2() {
        return localScheme.authenticate()
    }

    async function mw__auth__authmiddleware(context, next) {
        const number = utils.add(2, 4)
        console.log(context.req)
        await next()
    }

    async function fn__utils__getrandomNumber() {
        return maths.random(10)
    }

    async function ctrl__cat__get__getsinglecat(context) {
        const rand = maths.random(10)
        const dog = await models.default.create("dog", { data: {}, options: {} })

        return {
            "name": "siamese fucking cat",
            "specie": "siamese"
        };
    }

    async function ctrl__dog__get__getsingledog(context) {
        return {
            "name": "boerbel",
            "specie": "boerbel"
        };
    }

    async function ctrl__dog__post__createdog(context) {
        return {
            "status": "created",
            "message": "created dog"
        };
    }

    async function home() {
        console.log("dsfadsf")
    }
  `
    const plugins = pluginlist
    // const plugins = JSON.parse(pluginlist)
    const models = JSON.parse(`{}`)

    let middlewares = [];
    let controllers = [];
    let functions = []

    traverse(parser.parse(functions_repo, { sourceType: "module" }), {
        FunctionDeclaration(node) {
            functions.push(node)
        }
    });

    functions = functions.map(e => {
        const [_type, module, _] = e.node.id.name.split("__")
        const fn = functions_ast[e.node.id.name]

        let type = null
        switch (_type) {
            case "mw":
                type = "MiddlewareFunction"
                break;

            case "fn":
                type = "Function"
                break

            case "ctrl":
                type = "ControllerFunction"
                break

            default:
                break;
        }

        return ({
            type: type,
            name: e.node.id.name,
            module,
            imports: fn?.imports,
            arguments: fn?.arguments
        })
    })
    // console.log(functions)
    middlewares = functions.filter(e => e.type == "MiddlewareFunction")
    functions = functions.filter(e => e.type == "Function")

    // modules -> endpoints.
    return {
        modules: bendast,
        middlewares,
        functions,
        plugins,
        state
    }
}
