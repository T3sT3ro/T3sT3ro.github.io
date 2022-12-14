$ = require('../in.js');
_ = require('lodash');
const FastPriorityQueue = require('fastpriorityqueue');
const { defaultTo } = require('lodash');
t = $('IN/12').textContent.trim().split('\n').map(r => r.split(''));


function findNested(c) {
    r = t.findIndex(r => r.includes(c));
    c = t[r].indexOf(c);
    return [r, c];
}

S = findNested('S');
t[S[0]][S[1]] = 'a';
E = findNested('E');
t[E[0]][E[1]] = 'z';

function Dijkstra(S, E, canPass = (h, nh) => nh >= h - 1) {
    let d = { [S]: 0 };
    let Q = new FastPriorityQueue((p1, p2) => (d[p1] ?? Infinity) - (d[p2] ?? Infinity));

    Q.add(S);
    function* neighbors([x, y]) {
        let deltas = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        let h = t[x][y].charCodeAt();
        for (const [dx, dy] of deltas) {
            let [nx, ny] = [x + dx, y + dy];
            let nh = t[nx]?.[ny]?.charCodeAt();
            if (nh !== undefined && canPass(h, nh))
                yield [nx, ny];
        }
    }

    while (!Q.isEmpty()) {
        let p = Q.poll();
        for (const n of neighbors(p)) {
            if (d[p] + 1 < (d[n] || Infinity)) {
                d[n] = d[p] + 1;
                Q.add(n);
            }
        }
    }
    return d;
}

// From End to Start calculates all starting points at once
min = _(fromE).pickBy((v, k) => k.match(/,0/)).values().min();
let D = Dijkstra(S, E);
console.log(D[E], );

let fromE = Dijkstra(E, S);

console.log(min);

/* // DEBUG
function toSymbol(num) { 
    return isNaN(d[num]) ? '_' : d[num] % 10 
}
console.log(t.map((r, ri) => r.map((c, ci) => toSymbol([ri, ci])).join('')).join('\n'));
 */