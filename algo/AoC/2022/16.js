$ = require('../in.js');
_ = require('lodash');
T = $('IN/16').textContent.trim().split('\n');

tunnels = _(T).map(r =>
    r.match(/Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.*)/))
    .map(([, tunnel, flow, to]) => [tunnel, { flow: +flow, to: to.split(', ') }])
    .fromPairs()
    .value();

function withDefault(obj, defaultVal) {
    return new Proxy(obj, { get(target, key) { return target[key] ?? defaultVal } })
}

const START = 'AA';
function contractPaths(tunnels) { // mutates by appending 'shortcuts' field

    function dfsShortcut(v, p, d) {
        let shortcuts = {};
        for(const u of tunnels[v].to.filter(u => u!=p)) {
            if(tunnels[u].flow > 0) 
                _.mergeWith(shortcuts, {[u]: d+1}, (a, b) => Math.min(a || Infinity, b));
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
let valves = _.mapValues(tunnels, v => v.flow);

// dfs over time;
function solveDfs(v, valveProcessed, timeLeft, flowRate) {
    let maxReleased = flowRate * timeLeft;
}

console.log(solveDfs('AA', true, 30, 0));