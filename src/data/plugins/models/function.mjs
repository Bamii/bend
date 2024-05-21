import { PrismaClient } from "@prisma/client"

class Model {
    #client;

    constructor() {
        this.#client = new PrismaClient();
        console.log("instantiated")
    }

    create(model, { data, options }) {
        return this.#client[model].create({
            data,
            ...options
        })
    }
}

let instance;
export default (function() {
    if(!instance)
        instance = new Model();
    return instance;
})()