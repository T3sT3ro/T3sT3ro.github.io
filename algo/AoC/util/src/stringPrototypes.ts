
/**
 * 
 * @param {string} s extract arrays from string
 * @returns array of arrays of ints
 */
export function extractNumbers(s) {
    return s.match(/(?:[+-]?\d(?:\.\d+)+[,\s]*)+/g).map(x => x.trim().split(/[,\s]+/).map(x => +x));
}