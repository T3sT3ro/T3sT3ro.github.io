use itertools::Itertools;

const T: std::str::Split<'_, char> = include_str!("./../../IN/02").split('\n');

fn main(){

    let dd = T.map(|x| x.split(' ').collect()).map::<[str] -> [[str], i32]>(|[dir, x]| [match dir {
        "forward" => [x.parse::<i32>().unwrap(), 0],
        "up" => [0, -x.parse::<i32>().unwrap()],
        "down" => [0, x.parse::<i32>().unwrap()],
    }, x ]);
    let pos = [0, 0]; for (let [dx, dy] of dd) {pos = [pos[0] + dx, pos[1] + dy];}

    a = t.map(x=> x.split(' ')).map(([dir, x])=> ({'forward':[+x, +x, 0], 'up':[0, 0, -x], 'down':[0, 0, +x]})[dir])
    let p = [0, 0, 0]; for (let [dx, _, da] of a) {p = [p[0] + dx, p[1] + p[2]*dx, p[2]+da];}
    console.log(pos[0]*pos[1], p[0]*p[1]);

}

/*

f = t.map(x=> x.split(' ')).map(([dir, x])=> [({'forward':[1, 0], 'up':[0, -1], 'down':[0, +1]})[dir], +x])
dd = f.map(([[dx, dy], m]) => [dx*m, dy*m]);
let pos = [0, 0]; for (let [dx, dy] of dd) {pos = [pos[0] + dx, pos[1] + dy];}

a = t.map(x=> x.split(' ')).map(([dir, x])=> ({'forward':[+x, +x, 0], 'up':[0, 0, -x], 'down':[0, 0, +x]})[dir])
let p = [0, 0, 0]; for (let [dx, _, da] of a) {p = [p[0] + dx, p[1] + p[2]*dx, p[2]+da];}
console.log(pos[0]*pos[1], p[0]*p[1]);

*/
