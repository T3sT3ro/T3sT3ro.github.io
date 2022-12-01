$ = require('../in.js');
_ = require('lodash');
t = $('IN/12').textContent.trim().split('\n').map(ts => [ts[0], parseInt(ts.slice(1))]);

function rotate([x, y], dir, angle) {
    rad = (dir == 'L' ? +1 : -1) * Math.PI * (angle / 180);
    [sina, cosa] = [Math.round(Math.sin(rad)), Math.round(Math.cos(rad))];
    return [cosa * x - sina * y, sina * x + cosa * y];
}

function translate([x, y], [dx, dy]) {
    return [x + dx, y + dy];
}

function step([dir, n], [[wx, wy], [x, y]], advanced) {

    if (dir == 'R' || dir == 'L')
        return [rotate([wx, wy], dir, n), [x, y]];
    if (dir == 'F')
        return [[wx, wy], translate([x, y], [n * wx, n * wy])];

    [dx, dy] = { W: [-1, 0], E: [1, 0], S: [0, -1], N: [0, 1] }[dir];

    return advanced ? 
        [[wx + dx * n, wy + dy * n], [x, y]] : 
        [[wx, wy], [x + dx*n, y + dy*n]];
}

function ss([dir, n], [[wx, wy], [x, y]]) {
    s2 = step([dir, n], [[wx, wy], [x, y]]);
    console.log(dir, n, [wx, wy], [x, y], `-->`, s2[0], s2[1]);
    return s2;
}

state1 = [[1, 0], [0, 0]]; // waypoint in distance 1 emulates absolute movement
state2 = [[10, 1], [0, 0]];
for (let i = 0; i < t.length; ++i){
    state1 = step(t[i], state1, false);
    state2 = step(t[i], state2, true);
}

function manhattan(...pos) { 
    return _.sum(_.zip(...pos).map(([a,b]) => Math.abs(b-a)));
}

console.log(
    manhattan([0, 0], state1[1]),
    manhattan([0, 0], state2[1])
);