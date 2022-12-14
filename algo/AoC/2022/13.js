const { indexOf } = require('lodash');

$ = require('../in.js');
_ = require('lodash');
t = $('IN/13').textContent.trim().split('\n\n').map(p => p.split('\n').map(JSON.parse))

function compare(a, b) {
    const [ORDERED, EQUAL, UNORDERED] = [-1, 0, 1];
    if (a === undefined && b === undefined) return EQUAL;
    if (a === undefined) return ORDERED;
    if (b === undefined) return UNORDERED;
    let [aArr, bArr] = [a, b].map(Array.isArray);
    if (!aArr && !bArr) return a - b;
    if (!aArr && bArr) return compare([a], b);
    if (aArr && !bArr) return compare(a, [b]);
    if (a.length === 0 && b.length === 0) return EQUAL;
    let cmp = compare(a[0], b[0]);
    if (cmp != 0) return cmp;
    return compare(a.slice(1), b.slice(1));
}

const ordered = t.map((packets, i) => compare(...packets) < 0 ? i + 1 : 0);
let dividers = [[[2]], [[6]]];
const sorted = [...dividers, ...t.flat()].sort(compare);
console.log(_.sum(ordered), _(dividers).map(d => sorted.indexOf(d) + 1).reduce(_.multiply));