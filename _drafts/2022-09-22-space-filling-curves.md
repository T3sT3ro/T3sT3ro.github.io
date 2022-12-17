---
title: Space filling curves
description: About space filling curves, several simple implementations and usages.
date: 2022-09-22T16:14:58.448Z
lastmod: 2022-12-16T23:41:07.409Z
latex: true
---

Z-curves are given by:

\\[ 
    \alpha
\\]

```txt
Z(n, x, y)              -> "explode" and interleave x and y bit representations
Z(n, t)                 -> inverse of above - (x, y) where x is made from every odd bit and y from every even bit 
rot(n, x, y, rx, ry)    -> rotate/flip the quadrant
n parameter determines curve degree
```

implemented in js (based on [Wikipedia](https://en.wikipedia.org/wiki/Hilbert_curve)):

```js
function t2xy(n, t) {
    let [x, y, rx, ry] = [0, 0, 0, 0];
    for (let s=1; s<n; s*=2) {
        [rx, ry] = [1 & (t/2), 1 & (t ^ rx)];
        [x, y] = rot(s, x, y, rx, ry);
        [x, y] = [x + s * rx, s * ry];
        t /= 4;
    }
    return [x, y]
}

function xy2t(n, x, y) {
    let d=0;
    for (let s=n/2; s>0; s/=2) {
        let [rx, ry] = [(x & s) > 0, (y & s) > 0];
        d += s * s * ((3 * rx) ^ ry);
        [x, y] = rot(n, x, y, rx, ry);
    }
    return d;
}

function rot(n, x, y, rx, ry) {
    if (ry == 1) return [x, y];
    if (rx == 1) [x, y] = [n-1 - x, n-1 - y];
    return [y, x];
}
```
