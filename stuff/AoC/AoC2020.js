// advent of code 2020 day 11 - cellular automata

function day11() {
    function pad(c) {
        t = $('pre').textContent.split("\n").filter(ts => ts.length > 0);
        t = [Array(t[0].length + 2).fill(c).join(''), ...t.map(ts => `${c}${ts}${c}`), Array(t[0].length + 2).fill(c).join('')];
        $('pre').textContent = t.join('\n');
    }
    pad('@');

    function step() {
        let changed = false;
        let t = $('pre').textContent.split('\n');
        let d = Array(t.length)

        function raycast([r, c], [dr, dc]) {
            do {
                [r, c] = [r + dr, c + dc];
            } while (t[r][c] == '.');
            return t[r][c] == '#' ? 1 : 0;
        }

        for (let r = 0; r < t.length; ++r) {
            let ds = t[r].split('');
            for (let c = 0; c < t[r].length; ++c) {
                if (t[r][c] == '.' || t[r][c] == '@') continue;

                let cnt = raycast([r, c], [-1, -1]) + raycast([r, c], [-1, 0]) + raycast([r, c], [-1, +1]) +
                    raycast([r, c], [0, -1]) + raycast([r, c], [0, +1]) +
                    raycast([r, c], [+1, -1]) + raycast([r, c], [+1, 0]) + raycast([r, c], [+1, +1]);

                if (t[r][c] == 'L' && cnt == 0) { ds[c] = '#'; changed = true; }
                else if (t[r][c] == '#' && cnt >= 5) { ds[c] = 'L'; changed = true; }
            }
            d[r] = ds.join('');
        }
        $('pre').textContent = d.join('\n');
        return changed;
    }

    // spam till returns false
    while (step()) { };

    $('pre').textContent.split('').filter(c => c == '#').length;
}

function day12() {
    t = $('pre').textContent.split('\n', 755).map(ts => [ts[0], parseInt(ts.slice(1))])

    function rotate([x, y], dir, angle) {
        rad = (dir == 'L' ? +1 : -1) * Math.PI * (angle / 180);
        [sina, cosa] = [Math.round(Math.sin(rad)), Math.round(Math.cos(rad))];
        return [cosa * x - sina * y, sina * x + cosa * y];
    }

    function translate([x, y], [dx, dy]) {
        return [x + dx, y + dy];
    }

    function step([dir, n], [[wx, wy], [x, y]]) {

        if (dir == 'R' || dir == 'L') return [rotate([wx, wy], dir, n), [x, y]];
        if (dir == 'F') return [[wx, wy], translate([x, y], [n * wx, n * wy])];

        [dx, dy] = { W: [-1, 0], E: [1, 0], S: [0, -1], N: [0, 1] }[dir];

        return [[wx + dx * n, wy + dy * n], [x, y]];
    }

    function ss([dir, n], [[wx, wy], [x, y]]) {
        s2 = step([dir, n], [[wx, wy], [x, y]]);
        console.log(dir, n, [wx, wy], [x, y], `-->`, s2[0], s2[1]);
        return s2;
    }

    state = [[10, 1], [0, 0]]
    for (let i = 0; i < t.length; ++i) state = step(t[i], state);
}

function day13() {
    // 1. modulo each and minimum 
    // 2. chinese remainder theorem + wolfram: 
}

function day15() {
    t = [2, 0, 6, 12, 1, 3];
    at = { 2: 1, 0: 2, 6: 3, 12: 4, 1: 5 };
    let [last, i] = [3, 6]
    // d = t.slice(0, -1);
    for (; i < 30000000; ++i) {
        //     d = [...d, last]
        let seenAt = at[last];
        at[last] = i;
        last = seenAt ? i - seenAt : 0;
    }
    // d
    [i, last]
}

function day23() {

    t = [1, 5, 7, 6, 2, 3, 9, 8, 4]

    function buildChain(t) {
        let d = t.map((v, i) => Object.assign({}, { v: v }));
        let f = d[0];
        d.forEach((o, i) => o.n = (d[i + 1] || d[0])); // assign place successor
        d.sort((o1, o2) => o2.v - o1.v);
        d.forEach((o, i) => o.vn = (d[i + 1] || d[0])); // assign value successor
        for (const i in t) [d[i], f] = [f, f.n];
        return d;
    }

    function turn(cur) { // current is at last idx
        let three = [cur.n, cur.n.n, cur.n.n.n];
        let [x, y, z] = three;
        cur.n = z.n; // cut the 3 out the chain
        let dst = cur;
        do { dst = dst.vn; } while (three.includes(dst)); // find next value-wise not in picked up
        z.n = dst.n;
        dst.n = x;
        return cur.n;
    }

    function printChain(start) {
        let s = '';
        let cur = start;
        do { s += cur.v; cur = cur.n; } while (cur != start);
        return s;
    }

    function sim(t, lim=100) {
        let d = buildChain(t);
        let one = d.find(o => o.v == 1);
        let cur = one;
        for (let i = 0; i < lim; ++i) cur = turn(cur);
        // console.log(printChain(one));
        return one;
    }

    // part 1.
    let p1 = sim(t); // gotta take what is AFTER number 1 only (8 digits)
    console.log(printChain(p1).substr(1));

    // part 2.
    let p2 = sim([...t, ...Array.from(new Array(1000000),(_,i)=>i+1).splice(9)], 10000000) 
    console.log(p2.n.v * p2.n.n.v);
}

day23();