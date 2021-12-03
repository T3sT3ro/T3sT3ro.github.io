$ = require('./in.js');
const _ = require('lodash');

const T = $('IN/14').textContent.trim().split('\n');
const P = T[0];
const R = Object.fromEntries(T.slice(2).map(x => x.split(' -> ')).map(([p, i]) => [p, [p[0] + i, i + p[1]]]));
const pairs = _(P).keys().slice(1).map(i => P.substr(i - 1, 2)).countBy().value();

let polymer = _.cloneDeep(pairs);
for (let it = 1; it <= 40; it++) {
    let nextPoly = {};
    _(polymer).entries().forEach(([p, n]) => R[p].forEach(prod => nextPoly[prod] = (nextPoly[prod] || 0) + n));
    polymer = nextPoly;

    let counts = {};
    _(polymer).entries().map(([p, n]) => [[p[0], n], [p[1], n]])
        .flatten()
        .forEach(c => counts[c[0]] = (counts[c[0]] || 0) + c[1]);
    
    // each number is counted twice
    counts[P[0]]++; 
    counts[P[P.length-1]]++;
    counts = _(counts).mapValues(x => x/2).value();
    
    let min = _(counts).entries().minBy(([p, x]) => x);
    let max = _(counts).entries().maxBy(([p, x]) => x);

    console.log(it, min, max, max[1] - min[1]);
}