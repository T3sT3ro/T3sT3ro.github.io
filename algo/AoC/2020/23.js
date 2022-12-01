$ = require('../in.js');
t = $('IN/23').textContent.trim().split('');

function buildChain(t) {
    let d = t.map((v, i) => Object.assign({}, { v: v }));
    let f = d[0];
    d.forEach((o, i) => o.n = (d[i + 1] || d[0])); // assign place successor
    d.sort((o1, o2) => o2.v - o1.v);
    d.forEach((o, i) => o.vn = (d[i + 1] || d[0])); // assign value successor
    for (const i in t)
        [d[i], f] = [f, f.n];
    return d;
}

function turn(cur) {
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

function sim(t, lim = 100) {
    let d = buildChain(t);
    let one = d.find(o => o.v == 1);
    let cur = one;
    for (let i = 0; i < lim; ++i)
        cur = turn(cur);
    // console.log(printChain(one));
    return one;
}

// part 1.
let p1 = sim(t); // gotta take what is AFTER number 1 only (8 digits)
console.log(printChain(p1).substr(1));

// part 2.
let p2 = sim([...t, ...Array.from(new Array(1000000), (_, i) => i + 1).splice(9)], 10000000);
console.log(p2.n.v * p2.n.n.v);
