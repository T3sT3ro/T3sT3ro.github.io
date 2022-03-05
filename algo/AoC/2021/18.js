$ = require('./in.js');
const _ = require('lodash');

const T = $('IN/18').textContent.trim().split('\n')
    .map(x => eval(x));

function infix(t, xs, d) {
    if(t === undefined) return;
    if(typeof(t) === 'number') xs.push({val: t, d: d});
    infix(t[0], xs, d+1);
    infix(t[1], xs, d+1);
    return xs;
} 

// const I = T.map(x => infix(x, [], 0));
// function upleaft(t, leaf, x) { // ;)
//     if (t === undefined) return;
//     if (typeof(t) == 'number') return t + x;
//     else return t.map((s, i) => leaf == i ? upleaft(s, leaf, x) : s);
// }

// function reduceOnce(t, d = 1) {
//     if (d == 4 && typeof (t) === 'object') return 0;
//     let [l, r] = t.map(s => reduceOnce(s, d+1));
//     if(l == 0) {
//         carry(t, 0, eLeft[0]);
//         carry(t, 1, eLeft[2]);
//     }
// }