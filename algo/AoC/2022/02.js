$ = require('../in.js');
const t = $('IN/02').textContent.trim().split('\n');

console.log(
    t.reduce((score, r) => {
        return score + ({
            'A Y': 6 + 2,
            'B Z': 6 + 3,
            'C X': 6 + 1, 
            'A X': 3 + 1,
            'B Y': 3 + 2,
            'C Z': 3 + 3,
            'A Z': 0 + 3,
            'B X': 0 + 1,
            'C Y': 0 + 2
        })[r];
    }, 0),
    
    t.reduce((score, r) => { // X lose Y draw Z win
        return score + ({
            'A Z': 6 + 2,
            'B Z': 6 + 3,
            'C Z': 6 + 1, 
            'A Y': 3 + 1,
            'B Y': 3 + 2,
            'C Y': 3 + 3,
            'A X': 0 + 3,
            'B X': 0 + 1,
            'C X': 0 + 2
        })[r];
    }, 0)
);