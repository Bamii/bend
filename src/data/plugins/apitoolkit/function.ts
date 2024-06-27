// import { APIToolkit } from "apitoolkit-express";
import { me } from "./test.mjs"

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
    // return app.use(apitoolkitClient.expressMiddleware)    
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
    // return app.use(apitoolkitClient.errorHandler)
}

export class Clap {
    constructor(p: string) {

    }
} 

/**
 * 
 * initialise
 *
 * @param {number} x - number to be subtracted from
 * @param {number} y - number to subtract
 * @return {number} the difference of the numbers
 * 
 */
export { initialise, errorHandler, me }
// export { me } from "./"

/**
 * initialise
 *
 * @param {number} j - number to be subtracted from
 * @param {number} y - number to subtract
 * @return {number} the difference of the numbers
 * 
 */
function x(j: string, y: string) {
    console.log(j)
}

export default x;