$ = require('../in.js');
// t = [[13,25,18,6,42,8,37,27,44,38,10,28,50,5,16,47,30,29,39,21,2,4,12,35,32],[20,14,46,34,7,26,15,43,36,49,11,23,31,48,1,19,45,22,24,40,41,17,33,9,3]];
// t = $('pre').textContent.split('\n\n').map(ts => ts.split('\n').filter(ts => ts.length>0)).map(ts => ts.slice(1)).map(ts => ts.map(ti => parseInt(ti)))
[d1, d2] = [[13,25,18,6,42,8,37,27,44,38,10,28,50,5,16,47,30,29,39,21,2,4,12,35,32],[20,14,46,34,7,26,15,43,36,49,11,23,31,48,1,19,45,22,24,40,41,17,33,9,3]]

function encodeDeck(deck) {    return deck.map(c => String.fromCodePoint(c+65)).join('')    }

gameCntr = 0;

function play(p1, p2, lim = -1, log = false){ 
    let encoded = {};
    let [r, g] = [0, ++gameCntr];
    while(p1.length*p2.length > 0 && lim != r){
        ++r;
        if(log) console.log(`# Round ${r} (Game ${g}) #`, p1, p2);
        let [e1, e2] = [encodeDeck(p1), encodeDeck(p2)];

        if(encoded[`${e1}|${e2}`]) return true; // 1. first rule
        
        let [c1, c2] = [...p1.splice(0, 1), ...p2.splice(0, 1)]; // 2. draw

        let p1won;
        if(p1.length >= c1 && p2.length >= c2)
            p1won = play(p1.slice(0,c1), p2.slice(0,c2), lim, log);
        else
            p1won = c1 > c2; // 3. deck size < value of card => winner with bigger card
        
        if (p1won) // p1 won
            [p1, p2] = [p1.concat(c1, c2), p2];
        else                // p2 won
            [p1, p2] = [p1, p2.concat(c2, c1)];
        
        encoded[`${e1}|${e2}`] = true;
        
    }
    return p1.length != 0;
}

// console.log(play([9,2,6,3,1], [5,8,4,7,10], 260, false));

[r1, r2] = play(d1, d2);
console.log(r1);
console.log(r1.reverse().reduce((score, val, i) => score + val * (1+i), 0));