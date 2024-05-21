// import { APIToolkit } from "apitoolkit-express";

const apitoolkitClient = {}

function initialise({ app, route }) {
    return app.use(apitoolkitClient.expressMiddleware)    
}

function errorHandler({ app }) {
    return app.use(apitoolkitClient.errorHandler)
}

export { initialise, errorHandler }

export default function (j) {
    console.log(j)
}
