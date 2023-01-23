$ = require('../in.js');
_ = require('lodash');
let [map, instr] = $('IN/22').textContent.split('\n\n');
map = map.split('\n');
instr = instr.trim().match(/(\d+|R|L)/g);

function move(instr, [r, c], [dr, dc]) {
    if(instr == 'L') return [[r, c], [-dc, +dr]];
    if(instr == 'R') return [[r, c], [+dc, -dr]];
    
    function findNext(r, c, dr, dc) {
        const [MC, MR] = [map[0].length, map.length];
        if (map[(r+dr + MC) % MC][(c+dc + MR) % MR] == '#') return [r, c]; 
        do {
            [r, c] = [(r+dr +MR) % MR, (c+dc + MC) % MC];
        } while(map[r][c] == ' ');
        return [r, c];
    }

    for(let i=0; i<+instr; i++){
        let [nr, nc] = findNext(r, c, dr, dc);
        if(map[nr][nc] == '#') break;
        [r, c] = [nr, nc];
    }
    return [[r, c], [dr, dc]];
}
let [[r, c], [dr, dc]] = [[0, 0], [0, 1]];
for(const [ix, i] of Object.entries(instr))
    [[r, c], [dr, dc]] = move(i, [r, c], [dr, dc]);
console.log(r, c, dr, dc)
let dirMap = {[[0,1]]:0, [[1,0]]:1, [[0,-1]]:2, [[-1,0]]:3};
console.log((r+1)*1000 + (c+1)*4 + dirMap[[dr, dc]]);