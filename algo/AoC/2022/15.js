$ = require('../in.js');
_ = require('lodash');
const FILE = 'IN/15';
t = $(FILE).textContent.trim().split('\n').map(r => r.match(/[+-]?\d+/g)).map(([sx, sy, bx, by])=>[[+sx, +sy], [+bx,+by]]);

const ROW = FILE.endsWith('test') ? 10 : 2_000_000;

let noBeacon = new Set(); // Xs
t.map(([[sx, sy], [bx, by]]) => {
    let R = Math.abs(sx-bx) + Math.abs(sy-by);
    let reach = R - Math.abs(sy - ROW);
    for(let x = sx-reach; x<=sx+reach; x++){
        noBeacon.add(x);
    }
})

_(t).map(1).forEach(([bx, by]) => {if(by == ROW) noBeacon.delete(bx)});

console.log(noBeacon.size);