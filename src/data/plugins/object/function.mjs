/**
 * loop object keys.
 *
 * @param {object} - object to loop
 * @param {cb} - function to call on each element
 * @return {void} 
 * 
 */
export const keys = (object, cb) => {
    for(let prop of object) {
        cb(prop)
    }
}

/**
 * loop object properties.
 *
 * @param {object} - object to loop
 * @param {cb} - function to call on each element
 * @return {void} 
 * 
 */
export const properties = (object, cb) => {
    for(let prop of object) {
        cb(prop)
    }
}

/**
 * loop object entries.
 *
 * @param {object} - object to loop
 * @param {cb} - function to call on each element
 * @return {void} 
 * 
 */
export const entries = (object, cb) => {
    for(let prop of Object.entries(object)) {
        cb(prop)
    }
}

export default {
    keys, properties, entries
}