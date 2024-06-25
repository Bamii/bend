// import { APIToolkit } from "apitoolkit-express";

const apitoolkitClient = {}

/**
 * initialise
 *
 * @param {number} x - number to be subtracted from
 * @param {number} y - number to subtract
 * @return {number} the difference of the numbers
 * 
 */
function initialise({ app, route }) {
    return app.use(apitoolkitClient.expressMiddleware)    
}

/**
 * initialise
 *
 * @param {number} x - number to be subtracted from
 * @param {number} y - number to subtract
 * @return {number} the difference of the numbers
 * 
 */
function errorHandler({ app }) {
    return app.use(apitoolkitClient.errorHandler)
}

export { initialise, errorHandler }

/**
 * initialise
 *
 * @param {number} x - number to be subtracted from
 * @param {number} y - number to subtract
 * @return {number} the difference of the numbers
 * 
 */
export default function (j) {
    console.log(j)
}
