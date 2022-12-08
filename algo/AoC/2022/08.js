$ = require('../in.js');
_ = require('lodash');
t = $('IN/08').textContent.trim().split('\n').map(r => r.split('').map(x => +x));

let mins = Object.fromEntries(['lr', 'rl', 'tb', 'bt'].map(x => [x, new Array(t.length).fill(-1)]));
let visible = new Set();

for (let i = 0; i < t.length; i++) {
    for (let j = 0; j < t.length; j++) {
        
        function forDir(dir) {
            let I = t.length - 1 - i;
            let [r, c] = ({lr: [j, i], rl: [j, I], tb: [i, j], bt: [I, j]})[dir];
            if (mins[dir][j] < t[r][c]) { mins[dir][j] = t[r][c]; visible.add("" + [r, c]); }
        }

        forDir('lr');
        forDir('rl');
        forDir('tb');
        forDir('bt');
    }
}

    
function raycast([r, c], [dr, dc]) {
    let [dist, maxheight] = [0, t[r][c]];
    do {
        [r, c] = [r + dr, c + dc];
    } while (t[r]?.[c] != undefined && ++dist && t[r][c] < maxheight);
    return dist;
}

let maxScore = 0;

for (let r=0; r<t.length; r++) {
for (let c=0; c<t.length; c++) {
    maxScore = Math.max(maxScore, 
        raycast([r, c], [0, +1])*
        raycast([r, c], [0, -1])*
        raycast([r, c], [+1, 0])*
        raycast([r, c], [-1, 0])
    );
}}

console.log(visible.size);
console.log(maxScore);
