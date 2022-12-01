const $ = require('../in');
const t = $('IN/01').textContent.trim();
_ = require('lodash');

x1 = t.split('\n').map(x => +x);
x2 = x1.slice(1);
x3 = x1.slice(2);

ans1 = x1.map((e, i) => e - x2[i]).filter(x => x < 0).length;

w1 = x1.map((e, i) => e + x2[i] + x3[i]);
w2 = w1.slice(1);

ans2 = w1.map((e, i) => e - w2[i]).filter(x => x < 0).length;

console.log(ans1, ans2)