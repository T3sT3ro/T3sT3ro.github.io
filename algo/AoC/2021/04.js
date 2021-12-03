const $ = require('./in');
t = $('IN/04').textContent.trim().split('\n\n');
h = t[0].split(',');
f = t.slice(1).map(x => x.split(/[\s\n]+/).map(x => +x));
f2 = t.slice(1).map(x => x.split(/\n+/).map(r => r.trim().split(/\s+/).map(x => +x)));
// trim is important!

b = f2; won = false;
ans = [0, 0, null];
all:
for (let num of h) {
    ans[0]++;
    b = b.map(cmb => cmb.map(r => r.map(x => x === num ? false : x)));
    ans[1] = 0;
    for(let B of b){
        for(let i=0; i<5; ++i){
            if(B[i][0]==false && B[i][1]==false && B[i][2]==false && B[i][3]==false && B[i][4]==false) { ans[2] = num; won = B; break all; };
            if(B[0][i]==false && B[1][i]==false && B[2][i]==false && B[3][i]==false && B[4][i]==false) { ans[2] = num; won = B; break all; };
        }
        ans[1]++;
    }
}
console.log(won.flat().filter(x => x).reduce((a,x)=>a+x)*ans[2]);


b = f2; won = null;
ans = null;

all:
for (let num of h) {
    b = b.map(cmb => cmb.map(r => r.map(x => x === num ? false : x)));
    if(b.length == 1) won = b[0];
    b = b.filter(B => {
        for(let i=0; i<5; ++i){
            if(!B[i][0] && !B[i][1] && !B[i][2] && !B[i][3] && !B[i][4]) { return false; };
            if(!B[0][i] && !B[1][i] && !B[2][i] && !B[3][i] && !B[4][i]) { return false; };
        }
        return true;
    });
//     console.log(b.length);
    if(b.length == 0) {ans=num; break all};
}
console.log(won.flat().filter(x => x).reduce((a,x)=>a+x)*ans);