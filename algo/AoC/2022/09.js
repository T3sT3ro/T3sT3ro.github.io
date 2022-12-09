$ = require('../in.js');
_ = require('lodash');
t = $('IN/09').textContent.trim().split('\n').map(l => l.split(' '));
instr = t.map(([dir, n]) => dir.repeat(+n)).join('');

const deltas = { R: [0, +1], D: [+1, 0], U: [-1, 0], L: [0, -1] };

// const DBG_PLANE = [-503, 16, -225, 7]; //[-4, 0, 0, 5]; // [xmin, xmax, hmin, hmax]

function printPlane(dir) {
    let [xmin, xmax, ymin, ymax] = DBG_PLANE;
    console.log(`=== ${dir} ===`);
    for (let x = xmin; x <= xmax; x++) {
        let s = "";
        for (let y = ymin; y <= ymax; y++) {
            let H = ("" + [x, y] == "" + [hx, hy]) ? 2 : 0;
            let T = ("" + [x, y] == "" + [tx, ty]) ? 1 : 0;
            s += ".TH%"[H + T];
        } console.log(`${s}`);
    }
}

function move(dir, [hx, hy], [tx, ty]) {
    let [tdx, tdy] = [hx - tx, hy - ty];
    if (Math.max(Math.abs(tdx), Math.abs(tdy)) > 1)
        [tx, ty] = [tx + _.clamp(tdx, -1, 1), ty + _.clamp(tdy, -1, 1)];
    return [tx, ty];
}

function simulate(knots) {

    let positions = new Set();
    positions.add("" + _.last(knots));

    // var [hxmin, hxmax, hymin, hymax] = [0, 0, 0, 0]; // DBG

    for (const dir of instr) {
        let [dx, dy] = deltas[dir];
        knots[0] = [knots[0][0] + dx, knots[0][1] + dy]; // move head
        
        for (let i = 1; i < knots.length; i++) // move rest of knots
        knots[i] = move(dir, knots[i-1], knots[i]);
        positions.add("" + _.last(knots));
    }
    return positions.size;
}

console.log(simulate([...new Array(2)].map(x => [0, 0])));
console.log(simulate([...new Array(10)].map(x => [0, 0])));