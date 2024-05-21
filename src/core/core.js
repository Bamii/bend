
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