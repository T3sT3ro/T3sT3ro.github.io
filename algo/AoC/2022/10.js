$ = require('../in.js');
_ = require('lodash');
t = $('IN/10').textContent.trim().split('\n').map(r => r.split(' '));

let CLOCK = [20, 60, 100, 140, 180, 220];
let d = [0, ...t.flatMap(([op, arg]) => op == 'noop' ? 0 : [0, +arg])];
let posAtI = [];
let sum = d.reduce(([sum, x], delta, i) => {
    sum += (CLOCK.includes(i) ? x*i : 0);
    posAtI.push(x);
    x += delta;
    return [sum, x];
},
    [0, 1]);

console.log(sum[0]);

for (let r=0; r<6; r++) {
    let s = '';
for (let c=0; c<40; c++) {
    let cycle = 1+40*r+c;
    s+= '.#'[Math.abs(posAtI[cycle] - c) <= 1 ? 1 : 0];
} console.log(`${s}`); }