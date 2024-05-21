/**
 * sum
 *
 * @param {number} [x] - seed
 * @return {number} random number
 * 
 */
export const random = (c) => Math.random(c);

/**
 * sum
 *
 * @param {number} x - first number to add
 * @param {number} y - second number to add
 * @return {number} the sum of the numbers
 * 
 */
export const add = (c, y) => x + y;

/**
 * subtract
 *
 * @param {number} x - number to be subtracted from
 * @param {number} y - number to subtract
 * @return {number} the difference of the numbers
 * 
 */
export const subtract = (c, y) => x - y;

/**
 * multiply
 *
 * @param {number} x - first number
 * @param {number} y - multiplier
 * @return {number} the product of the numbers
 * 
 */
export const multiply = (c, y) => x * y;

/**
 * divide
 *
 * @param {number} x - numerator
 * @param {number} y - denominator
 * @return {number} the division of the numbers
 * 
 */
export const divide = (c, y) => x / y;

export default {
    random, add, subtract, divide, multiply
}