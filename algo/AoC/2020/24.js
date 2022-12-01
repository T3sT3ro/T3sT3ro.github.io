$ = require('../in.js');
t = $('IN/24').textContent.trim().split('\n');

/*
    a B a B a B   x->
   a B a B a B
  a B a B a B   Y=0
*/
function move([x, y], m) {
    let [dx, dy] = ({
        e:  [1, 0],
        w:  [-1, 0],
        ne: [0, 1],
        se: [1, -1],
        nw: [-1, 1],
        sw: [0, -1],
    })[m];
    return [x+dx, y+dy];
}

function instructionWalk(instr, cord = [0, 0]) {
    while (instr.length > 0) {
        let m = ["e", "w", "ne", "nw", "se", "sw"].find(m => instr.indexOf(m) == 0);
        instr = instr.substr(m.length);
        cord = move(cord, m);
    }
    return cord;
}
tiles = t.map(instr => instructionWalk(instr));
console.log(Object.values(tiles.reduce((o, cords) => Object.assign(o, { [cords]: !o[cords] }), {})).filter(v => v).length); // part 1

life = Object.entries(tiles.reduce((o, cords) => Object.assign(o, { [cords]: !o[cords] }), {})).filter(([k, v]) => v).map(a => a[0].split(',').map(x => +x));
startPopulation = life.reduce((o, c) => Object.assign(o, { [c]: true }), {});
function relax(life) {
    let toCords = (c => c.split(',').map(x => +x));
    let cords = Object.keys(life).map(toCords).map(c => [c, ...['e', 'w', 'ne', 'nw', 'se', 'sw'].map(dd => instructionWalk(dd, c))]).flat().reduce((o, c) => Object.assign(o, { [c]: true }), {});
    return Object.keys(cords).map(toCords).filter(c => {
        let neigh = ['e', 'w', 'ne', 'nw', 'se', 'sw'].map(dd => instructionWalk(dd, c)).filter(v => life[v]).length; // count neighbors
        return neigh == 2 || life[c] && neigh == 1;
    }).reduce((o, c) => Object.assign(o, { [c]: true }), {});
}
let p = startPopulation;
for (let i = 0; i < 100; ++i)
    p = relax(p);
console.log(Object.values(p).length);
