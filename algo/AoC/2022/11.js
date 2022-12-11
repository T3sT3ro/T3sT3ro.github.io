$ = require('../in.js');
_ = require('lodash');
t = $('IN/11').textContent.trim().split('\n\n').map(x => x.split('\n').slice(1).map(x => x.trim())).map(([items, op, test, ifTrue, ifFalse]) => ({
    items: [...items.matchAll(/\d+/g)].map(x => +x[0]),
    inspect: eval(`old => ${op.split('= ')[1]}`),
    nextMonkey: eval(`(val) => val % ${test.match(/\d+/)[0]} == 0 ? ${ifTrue.match(/\d/)[0]} : ${ifFalse.match(/\d/)[0]}`),
    mod: +test.match(/\d+/)[0],
}))

const M = _(t).map(({mod}) => mod).reduce(_.multiply);

function round(monkeys, inspections, relief) { // mutates monkeys and inspections
    for (const [i, { items, inspect, nextMonkey }] of monkeys.entries()) {
        while (items.length > 0) {
            let item = items.shift() % M;
            let newWorry = inspect(item) % M;
            inspections[i]++;
            let reliefWorry = relief(newWorry) % M;
            let targetMonkey = nextMonkey(reliefWorry);
            monkeys[targetMonkey].items.push(reliefWorry);
        }
    }
}

function getMonkeyBusiness(initialMonkeys, rounds, relief) {
    let M = _.cloneDeep(initialMonkeys);
    let inspections = t.map(m => 0);
    for (let i = 0; i < rounds; i++)
        round(M, inspections, relief);
    return _(inspections).orderBy(Number, ['desc']).take(2).reduce(_.multiply);
} 


console.log(
    getMonkeyBusiness(t, 20, worry => Math.floor(worry / 3)),
    getMonkeyBusiness(t, 10_000, worry => worry),
);