$ = require('../in.js');
_ = require('lodash');
T = $('IN/16-test').textContent.trim().split('\n');

/** 
 * @type {*: {flow: number, to: []}}
*/
var tunnels = _(T).map(r =>
    r.match(/Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.*)/))
    .map(([, tunnel, flow, to]) => [tunnel, { flow: +flow, to: to.split(', ') }])
    .fromPairs()
    .value();

const START = 'AA';
function contractPaths(tunnels) { // mutates by appending 'shortcuts' field

    function dfsShortcut(v, p, d) {
        let shortcuts = {};
        for(const u of tunnels[v].to.filter(u => u!=p)) {
            if(tunnels[u].flow > 0)  // +2 cuz +1 to reach and +1 to open
                _.mergeWith(shortcuts, {[u]: d+2}, (a, b) => Math.min(a || Infinity, b));
            else 
                _.mergeWith(shortcuts, dfsShortcut(u, v, d+1));
        }
        return shortcuts;
    }
    for(const v in tunnels) tunnels[v].shortcuts = dfsShortcut(v, null, 0);
}

contractPaths(tunnels);

// _(tunnels).forEach((tun, from) => console.log(from, tun.to.toString()));

let contracted = _(tunnels).pickBy(t => t.flow > 0 || t == 'AA').mapValues(v => v.shortcuts).value();
let rates = _.mapValues(tunnels, v => v.flow);
let masks = _(rates).pickBy((v, k) => k=='AA' || v > 0).keys()
    .map((k, i) => [k, 1 << i]).fromPairs().value();


    // DP[time][v][mask]
let DP = new Array()

// dfs over time;
function solveDfs(v, valvesDone, timeLeft, flowRate, pathSoFar = []) {
    // const cached = _.get(DP, [timeLeft, v, valvesDone]);
    // if(cached != undefined) 
        // return cached;
    let bestReleased = flowRate * timeLeft; // if nothing else is done then this is the max
    let bestMoves = [ `stay (flow:${flowRate}, release:${timeLeft}*${flowRate}=${timeLeft*flowRate})` ];
    if(~valvesDone & masks[v] && timeLeft > 1) { // unlock the valve 
        let [released, moves] = solveDfs(v, valvesDone | masks[v], timeLeft-1, flowRate + rates[v], [...pathSoFar, `open ${v}`]);
        released += 1*flowRate;
        if (released > bestReleased) {
            [bestReleased, bestMoves] = [released, [`unlock ${v} (1, flow:${flowRate}, release:${1}*${flowRate}=${1*flowRate})`, ...moves]];
        }
    } 
    for(const [u, d] of Object.entries(tunnels[v].shortcuts)) {
        if(d < timeLeft && (~valvesDone & masks[u])){
            let [released, moves] = solveDfs(u, valvesDone, timeLeft-d, flowRate, [...pathSoFar, `move to ${u}`]);
            released += d*flowRate;
            if(released > bestReleased) {
                bestReleased = released;
                bestMoves = [`go to ${u} (${d}, flow:${flowRate}, release:${d}*${flowRate}=${d*flowRate}))`, ...moves];
            }
        }
    }
    // _.set(DP, [timeLeft, v, valvesDone], [bestReleased, bestMoves]);
    return [bestReleased, bestMoves];
}


let [best, moves] = solveDfs('AA', masks['AA'], 30, 0);
console.log(best);
console.log(moves.join('\n'));