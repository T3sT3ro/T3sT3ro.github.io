$ = require('../in.js');
t = $('IN/15').textContent.trim().split(',');

at = Array(30_000_001); // mapping of number to seen at position
t.forEach((e, i)=> {at[e] = i+1;});
let [last, i] = [3, 6];
for (; i <= 30000000; ++i) {
    //     d = [...d, last]
    if(i == 2020 || i == 30_000_000)
        console.log(last);
    // console.log([i, last]);
    let seenAt = at[last];
    at[last] = i;
    last = seenAt ? i - seenAt : 0;
}

