$ = require('../in.js');
_ = require('lodash');
t = $('IN/05').textContent.trimEnd();


crates = t.split('\n\n')[0].split('\n').map(r => '['+r.replaceAll(/.(.)..?/g, '\'$1\',')+']').map(r => eval(r)).slice(0, -1);
instr = t.split('\n\n')[1].split('\n').map(i => i.match(/move (\d+) from (\d+) to (\d+)/).slice(1,4).map(i => +i));
stacks1 = crates[0].map(r => []);
stacks2 = crates[0].map(r => []);
for(let r=0; r<crates.length; r++){
    for(let c=0; c<crates[r].length; c++){
        stacks1[c].push(crates[r][c]);
        stacks2[c].push(crates[r][c]);
    }
}
stacks1 = stacks1.map(r => r.join('').trim().split(''));
stacks2 = stacks2.map(r => r.join('').trim().split(''));

for(let [n, from, to] of instr) {
    let part1 = stacks1[from-1].splice(0, n).reverse();
    let part2 = stacks2[from-1].splice(0, n);
    stacks1[to-1].splice(0,0,...part1);
    stacks2[to-1].splice(0,0,...part2);

}

console.log(stacks1.map(r => r[0]).join(''), stacks2.map(r => r[0]).join(''));