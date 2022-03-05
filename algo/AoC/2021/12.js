$ = require('./in.js');
const _ = require('lodash');
t = $('IN/12').textContent.trim().split('\n').map(r => r.split('-'));
G = {};

for (let [a, b] of t) {
    G[a] = (G[a] || []).concat(b);
    G[b] = (G[b] || []).concat(a);
}
console.error(G);

function countPaths(v = 'start', visited = []) { // set or array hmmmmm???
    if (v == 'end') return 1;
    return G[v]
        .filter(w => !visited.includes(w))
        .reduce((paths, w) => paths + countPaths(w, v.match(/[A-Z]+/) ? visited : [...visited, v]), 0);
}

// console.log(countPaths());

t.flat().filter(x => x.match(/[a-z]/) && !['start', 'end'].includes(x));

function countPaths2(allowTwice = true, v = 'start', visited = []) { // set or array hmmmmm???
    if (v == 'end') return 1;
    return G[v]
        .filter(w => w != 'start')
        .map(w => [w, visited.includes(w)])
        .reduce((paths, [w, seen]) => paths +
            (!allowTwice && seen
                ? 0
                : countPaths2(
                    seen ? false : allowTwice,
                    w,
                    v.match(/[a-z]+/) ? [...visited, v] : visited)),
            0);
}

console.log(countPaths2(false), countPaths2(true))