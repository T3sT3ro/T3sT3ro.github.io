$ = require('../in.js');
_ = require('lodash');
t = $('IN/14').textContent.trim().split('\n').map(r => r.split(' -> ').map(c => c.split(',').map(x => +x)));

const O = [500,0];
let cave = {[O]: '+'};

t.forEach(path => {
    path.reduce(([x, y], [nx, ny]) => {
        let [dx, dy] = [nx-x, ny-y].map(d => _.clamp(d, -1, 1));
        cave[[x,y]] = '#';
        do {
            [x, y] = [x+dx, y+dy];
            cave[[x,y]] = '#';
        } while(nx != x || ny != y);
        return [x, y];
    })
});

let [xmin, ymin] = _.zip(..._(cave).keys().map(x => x.split(',').map(x=>+x)).value()).map(_.min)
let [xmax, ymax] = _.zip(..._(cave).keys().map(x => x.split(',').map(x=>+x)).value()).map(_.max)

function debug() {
    for (let y=ymin; y<=ymax; y++) {    let s = "";
    for (let x=xmin; x<=xmax; x++) {
        s+= cave[[x, y]] ?? '.' ;
    } console.error(s); }
    console.error();
}

function *move([Ox, Oy], debug = () => {}) {
    let [x, y] = [Ox, Oy]; // particle

    while(true) {
        if (y > ymax) return;
        else if(!cave[[x, y+1]]) [x, y] = [x, y+1];
        else if(!cave[[x-1, y+1]]) [x, y] = [x-1, y+1];
        else if(!cave[[x+1, y+1]]) [x, y] = [x+1, y+1];
        else {
            if(x == Ox && y == Oy) {return yield 1;};
            cave[[x, y]] = 'o';
            [x, y] = [Ox, Oy];
            debug();
            yield 1;
        }
    }
}


// PT 1
let total = 0;
for(cnt of move(O)) total += cnt;
debug();
console.log(total);

// PT 2
ymax += 2;
xmin = 500 - ymax; xmax = 500 + ymax;
for(let i = xmin; i <= xmax; i++) cave[[i, ymax]] = '#';
for(cnt of move(O)) total += cnt;
debug();
console.log(total);