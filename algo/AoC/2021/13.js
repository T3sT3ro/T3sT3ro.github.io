$ = require('./in.js');
const _ = require('lodash');

T = $('IN/13').textContent.trim().split('\n');
t = T.slice(0, 881).map(r => r.split(',').map(x => +x));
f = T.slice(882).map(x => x.match(/fold along (?:x=(\d+))?(?:y=(\d+))?/).slice(1, 3)).map(([a, b]) => [a ? +a : a, b ? +b : b])

folded = f.reduce((p, [xM, yM]) => {
    let ret = p.filter(([x, y]) => x != xM && y != yM)
        .map(([x, y], i) => [(xM && x > xM) ? 2 * xM - x : x, (yM && y > yM) ? 2 * yM - y : y]);
    console.log(_.uniq(ret.map(x => x.toString())).length);
    return ret;
}, t);
points = {};
_(folded).forEach(([x, y]) => _.setWith(points, `[${x}][${y}]`, true, Object));
console.log(_.range(6).map(r => _.range(40).map(c => points[c]?.[r] ? '@' : ' ').join('')).join('\n'));
