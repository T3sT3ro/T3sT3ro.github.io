$ = require('../in.js');

const t = $('IN/01').textContent.trim()
    .split('\n\n')
    .map(x => x.split('\n').reduce((a, x) => +a + +x, 0));

console.log(
    Math.max(...t),
    t.sort((a,b) => b-a).slice(0, 3).reduce((a, x) => +a + +x)
);