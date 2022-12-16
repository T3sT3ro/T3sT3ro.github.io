$ = require('../in.js');
_ = require('lodash');
const FILE = 'IN/15';
t = $(FILE).textContent.trim().split('\n').map(r => r.match(/[+-]?\d+/g)).map(([sx, sy, bx, by])=>[[+sx, +sy], [+bx,+by]]);

const ROW = FILE.endsWith('test') ? 10 : 2_000_000;
const LIM = FILE.endsWith('test') ? 20 : 4_000_000;


/*

   ----+----   --+--
      ---+---


*/

function intervalCount(ROW, minX=-Infinity, maxX=Infinity) {

    let intervals = [];
    t.forEach(([[sx, sy], [bx, by]], i) => {
        let R = Math.abs(sx-bx) + Math.abs(sy-by);
        let reach = R - Math.abs(sy - ROW);
        if(reach >= 0)
        intervals.push({i:i, x: Math.max(minX, sx-reach), t: -1}, {i:i, x: Math.min(maxX, sx+reach), t: 1});
    });
    intervals.sort((o1, o2) => o1.x-o2.x || o1.t-o2.t); // beginnings first

    let stack = [];
    let lastX = +Infinity;
    let distress = -Infinity;
    let total = 0;
    for(const {x, t, i} of intervals) {
        if(t < 0) {
            if(stack.length == 0 && x - lastX == 2) distress = x-1;
            stack.push(x); // start
        }
        else if(t > 0) { // end
            let xs = stack.pop();
            if(stack.length == 0) {
                total += x - xs + 1;
                lastX = x;
            }
        }
    }
    return [total, distress];
}

let ans1 = intervalCount(ROW)[0] - _(t).map(1).uniqBy(x => x.toString()).filter(b => b[1]==ROW).size()
console.log(ans1);

for (let y = 0; y <= LIM; y++) {
    let [rowCnt, distress] = intervalCount(y, 0, LIM);
    if (rowCnt == LIM) 
        console.log(tuning(distress, y));
}

function tuning (x, y) { return x * 4_000_000 + y };