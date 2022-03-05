$ = require('./in.js');
const t = $('IN/06').textContent.split(',').map(x => +x);
const _ = require('lodash');

f = t;
for(let i = 0; i < 80; i++) {
    f = f.map(x => x-1).map(x => x == -1 ? [6, 8] : x).flat();
}

let e = _(t).countBy().value();
e = Object.assign([0,0,0,0,0,0,0,0,0], e);
console.error(_.countBy(t));
for(let i = 0; i < 256; i++) {
    e = ({
        0: e[1], 1: e[2], 2:e[3], 3:e[4], 4:e[5], 5:e[6], 6:e[0]+(e[7] || 0), 7:(e[8] || 0), 8:e[0]
    });
}


console.log(f.length, _(f).values().sum());