$ = require('./in.js');
const _ = require('lodash');
t = $('IN/11').textContent.trim().split('\n').map(r => r.split('').map(x => +x));

function dbg(t, step) {
    console.error(step+'\n'+t.map(r => r.map(x => `{${"y;;;;;;;;;g"[Math.min(x, 10)]}--${x > 9 ? 'X' : x}--}` ).join('')).join('\n'));
}
function safeget(r, c, t) {return r < 0 || r >= t.length || c < 0 || c >= t[0].length ? 0 : t[r][c];}
function safeset(r, c, t, x) {return r < 0 || r >= t.length || c < 0 || c >= t[0].length ? 0 : t[r][c] = x;}
function increasePotential(r, c, d) {
    if(r < 0 || r >= d.length || c < 0 || c >= d[r].length) return;
    if(d[r][c] > 9) return;
    if(++d[r][c] > 9) {
        for (let [dr, dc] of deltas)
            increasePotential(r+dr, c+dc, d);
    }
}

let deltas = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
let d = _(t).cloneDeep();
dbg(t, 0);

let flashes = 0;
let step = 0;
while(_(d.flat()).uniq().value().length > 1){
    ++step;
    for (let r=0; r<d.length; r++) 
    for (let c=0; c<d[r].length; c++) 
        increasePotential(r, c, d);
    if(step <= 100)
        flashes += d.flat().filter(x => x > 9).length;
    d = d.map(r => r.map(x => x > 9 ? 0 : x));

    dbg(d, step);
}

console.log(flashes, step);