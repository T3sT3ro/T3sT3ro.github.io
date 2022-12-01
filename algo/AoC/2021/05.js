const $ = require('../in');
t = $('IN/05').textContent.trim().split('\n');
P = t.map(x => x.split(" -> ").map(c => c.split(',').map(i => +i)));
/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

function solve (part= 1){
    M = {};
    for (let [p1, p2] of P){
        let [dr, dc] = [p2[0]-p1[0], p2[1]-p1[1]];
        
        if (part == 1 && dr != 0 && dc != 0) continue;
        [dr, dc] = [dr.clamp(-1,1), dc.clamp(-1,1)];
        let it = p1;
        M[it] = (M[it] || 0) + 1;
        while (it.toString() != p2.toString() && it[0]>=0 &&it[0]<=999 && it[1]>=0 &&it[1]<=999){
            it = [it[0]+dr, it[1]+dc];
            M[it] = (M[it] || 0) + 1;
        }
    }
    return Object.entries(M).filter(x => x[1] > 1).map(x => x[0]).length;
}
console.log(solve(1), solve(2));