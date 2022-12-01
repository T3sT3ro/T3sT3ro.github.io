$ = require('../in.js');
const _ = require('lodash');

const t = $('IN/22').textContent.trim().split('\n')
    .map(r => r.match(/(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/).slice(1))
    .map(r => [r[0], ...r.slice(1).map(x => +x)]);

space = {};
f1 = t.filter(([state, xmin, xmax, ymin, ymax, zmin, zmax]) => xmin >= -50 && xmax <= 50 && ymin >= -50 && ymax <= 50 && zmin >= -50 && zmax <= 50);
f1.forEach(([state, xmin, xmax, ymin, ymax, zmin, zmax]) => {
    for (let x = xmin; x <= xmax; ++x)
    for (let y = ymin; y <= ymax; ++y)
    for (let z = zmin; z <= zmax; ++z)
        space[[x, y, z]] = state;
})
let ans1 = Object.values(space).filter(x => x === 'on').length;



let POIs = t.flatMap(
    ([state, xmin, xmax, ymin, ymax, zmin, zmax], i) =>
        [[xmin, 'begin', i], [xmax, 'end', i]])
    .sort((p1, p2) => p1[0] - p2[0] || p1[1] < p2[1]);
// ^ fact that begin<end in strcmp to hack ends before starts

let sweep = new Set();
let total = 0;
let lastX = undefined;
let lastSz = 0;
// x----x--x-----x----x

console.log(_(POIs).groupBy(x => x[0]).value());

for (let [x, type, i] of POIs) { // sorted by x for events

    total += lastSz * (x - (lastX || x + 1) - 1) // trace the volume

    if (type == 'begin') sweep.add(i); // sweepline as simple add/delete set
    else sweep.delete(i);

    // gets layer's size
    let space = {}; // primitive set all locations cuz I have time and resources :I
    for (const idx of sweep) {
        let [state, xmin, xmax, ymin, ymax, zmin, zmax] = t[idx];
        for (let y = ymin; y <= ymax; ++y)
        for (let z = zmin; z <= zmax; ++z)
            space[[y, z]] = state;
    }
    let layerOn = Object.values(space).filter(x => x === 'on').length;
    lastX = x;
}



let ans2 = 0; // !! <<<<< TODO
console.log(ans1, ans2);