$ = require('../in.js');
_ = require('lodash');
t = $('IN/06').textContent.trim();


let i=0;
for(; i<t.length && new Set(t.slice(i, i+4)).size !=4; i++);
console.log(i);

i=0;
for(; i<t.length && new Set(t.slice(i, i+14)).size != 14; i++);
console.log(i);



