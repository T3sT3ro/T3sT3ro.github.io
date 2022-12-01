$ = require('../in.js');
const _ = require('lodash');
t = $('IN/10').textContent.trim().split('\n');

d = _(t).cloneDeep();
for (let i = 0; i < _(t.map(x => x.length)).max()/2; ++i) {
    d = d.map(l => l.replaceAll('()', '').replaceAll('{}', '').replaceAll('[]', '').replaceAll('<>', ''));
}

ans1 = _(d.map(x => x.match(/[>\]})]/))
    .filter(x => x)
    .map(x => ({ ')': 3, ']': 57, '}': 1197, '>': 25137 })[x[0]])
).sum();

sorted = d.filter(x => !x.match(/[>\]})]/))
    .map(x => x.replaceAll('{', '}').replaceAll('(', ')').replaceAll('<', '>').replaceAll('[', ']').split('').reverse()
        .reduce((acc, x) => (5 * acc) + ({ ')': 1, ']': 2, '}': 3, '>': 4 })[x], 0))
    .sort((a, b) => a - b);

ans2 = sorted[Math.floor(sorted.length/2)];

console.log(ans1, ans2);
