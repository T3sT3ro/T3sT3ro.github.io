const $ = require('../in');
t = $('IN/03').textContent.split('\n');
bits = []; for(let i in [...new Array(t[0].length)]) bits.push(t.map(x => x[i]).filter(x => x==='1').length);
MSB = parseInt(bits.map(x => x >= t.length/2 ? 1 : 0).join(''), 2);
LSB = parseInt(bits.map(x => x <= t.length/2 ? 1 : 0).join(''), 2);

function filterBits(t, i, msb){ // by i-th bit
    [M, m] = [t.filter(x => x[i]==='1'), t.filter(x => x[i]==='0')];
    if (M.length == m.length) return msb ? M : m;
    if (M.length < m.length) [M, m] = [m, M];
    return msb ? M : m;
}

function find(t, msb) {
    k = t; it = -1;
    while(k.length > 1) k = filterBits(k, ++it, msb);
    return parseInt(k[0], 2);
}

console.log(MSB*LSB, find(t, true)*find(t, false));