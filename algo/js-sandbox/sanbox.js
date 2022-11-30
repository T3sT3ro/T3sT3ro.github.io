'use strict';
const {IN, readLine} = require('./in')('./IN');


/*
 * Complete the 'box' function below.
 *
 * The function is expected to return a LONG_INTEGER.
 * The function accepts following parameters:
 *  1. INTEGER n
 *  2. INTEGER m
 *  3. INTEGER_ARRAY h
 *  4. INTEGER_ARRAY v
 */

function box(n, m, h, v) {
    h = h.sort((a, b) => a-b);
    v = v.sort((a, b) => a-b);
    
    function maxMissingWalls(t) { // gap as in continuous walls missing
        let [gap, maxgap] = [1, 1];
        let lastWall = -Infinity;
        for(let wall of t){
            if (wall == lastWall+1) gap++;
            else {
                lastWall = wall;
                gap = 1;
            }
            maxgap = Math.max(gap, maxgap);
        }
        return maxgap;
    }
    let [maxH, maxV] = [h, v].map(arr => BigInt(maxMissingWalls(arr)+1));
    return maxH*maxV;
}

function main() {
    const n = parseInt(readLine().trim(), 10);

    const m = parseInt(readLine().trim(), 10);

    const hCount = parseInt(readLine().trim(), 10);

    let h = [];

    for (let i = 0; i < hCount; i++) {
        const hItem = parseInt(readLine().trim(), 10);
        h.push(hItem);
    }

    const vCount = parseInt(readLine().trim(), 10);

    let v = [];

    for (let i = 0; i < vCount; i++) {
        const vItem = parseInt(readLine().trim(), 10);
        v.push(vItem);
    }

    const result = box(n, m, h, v);

    console.log(result + '\n');
}

main();