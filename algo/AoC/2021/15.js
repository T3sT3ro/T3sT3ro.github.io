$ = require('./in.js');
const _ = require('lodash');
const FPQ = require('fastpriorityqueue');
const { map } = require('lodash');

t = $('IN/15').textContent.trim().split('\n').map(r => r.split('').map(x => +x));



// DP = { [[0, 0]]: 0 };
// for (let r = 0; r < t.length; r++)
// for (let c = 0; c < t[0].length; c++) {
//     if (r == 0 && c == 0) continue;
//     let left = DP[[r, c - 1]];
//     let up = DP[[r - 1, c]];

//     DP[[r, c]] = t[r][c] + Math.min(
//         left == undefined ? Infinity : left,
//         up == undefined ? Infinity : up
//     );
// }
// console.log(DP[[t.length-1, t[0].length-1]]);

function safeget(t, r, c) {
    return r < 0 || c < 0 || r >= t.length || c >= t[r].length
        ? Infinity
        : t[r][c];
}

const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function solve(t) {

    let Q = new FPQ((a, b) => a[1] < b[1]);
    let D = t.map(r => new Array(r.length).fill(Infinity));
    D[0][0] = 0;
    Q.add([[0,0], 0]);

    while (!Q.isEmpty()) {
        
        let [[r, c], d] = Q.poll();
        
        if (d > D[r][c]) continue;

        for (let [dr, dc] of deltas) {
            let [nr, nc] = [r + dr, c + dc];
            if (nr < 0 || nr >= t.length || c < 0 || c >= t[0].length || (nr==0 && nc==0)) continue;
            let cost = t[nr][nc] + D[r][c];
            if(cost < D[nr][nc]) {
                D[nr][nc] = cost;
                Q.add([[nr,nc], cost]);
            }
        }
    }
    return D[t.length - 1][t[0].length - 1]
}

function upcycle(r, n) { return r.map(x => ((x - 1 + n) % 9) + 1); }
d = t.map(r => r.concat(upcycle(r, 1)).concat(upcycle(r, 2)).concat(upcycle(r, 3)).concat(upcycle(r, 4)));
e = d.concat( d.map(r => upcycle(r, 1)))
    .concat( d.map(r => upcycle(r, 2)))
    .concat( d.map(r => upcycle(r, 3)))
    .concat( d.map(r => upcycle(r, 4)));
console.log(solve(t), solve(e));
