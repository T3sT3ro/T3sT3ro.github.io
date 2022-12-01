
$ = require('../in.js');
const _ = require('lodash');
t = $('IN/09').textContent.trim().split('\n').map(x => x.split('').map(x => +x));

let points = 0;
let deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
function getcord(r, c, t, def = 666.666) { let ret = (t[r] || [])[c]; return ret === undefined ? def : ret; }
for (let r = 0; r < t.length; r++) {
    for (let c = 0; c < t[r].length; c++) {
        let low = true;
        for (let [dr, dc] of deltas) {
            low = low && getcord(r + dr, c + dc, t) > getcord(r, c, t);
        }
        if (low) points += getcord(r, c, t)+1;
    };
}

console.error(t.map(r => r.map(h => `{${"KBcCgGYyRr"[h]}--${h}--}`).join('')).join('\n'));

let d = _.cloneDeep(t);
function basinFind(r, c, d) {
    if(getcord(r,c,d) >= 9) return 0;
    d[r][c] = 9;
    let p = 1;
    for (let [dr, dc] of deltas) p += basinFind(r + dr, c + dc, d);
    return p;
}

let basins = [];
for (let r = 0; r < t.length; r++){
    for (let c = 0; c < t[r].length; c++){
        let basin = basinFind(r, c, d);
        if (basin > 0) basins.push(basin);
    }
}
console.log(points, basins.sort((a, b) => b-a).slice(0, 3).reduce((a,b) => a*b));