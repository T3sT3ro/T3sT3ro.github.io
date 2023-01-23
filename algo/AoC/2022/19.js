$ = require('../in.js');
_ = require('lodash');
const t = $('IN/19').textContent.trim().split('\n')
    .map(r => [...r.match(/\d+/g)])
    .map(([
        ID,
        orebot_ore,
        claybot_ore,
        obsidianbot_ore, obsidianbot_clay,
        geodebot_ore, geodebot_obsidian
    ]) => ({
        ID: +ID,
        oreBot: { ore: +orebot_ore, clay: 0, obsidian: 0 },
        clayBot: { ore: +claybot_ore, clay: 0, obsidian: 0 },
        obsidianBot: { ore: +obsidianbot_ore, clay: +obsidianbot_clay, obsidian: 0 },
        geodeBot: { ore: +geodebot_ore, clay: 0, obsidian: +geodebot_obsidian },
    }));

    /**
     * @typedef Cost 
     * @type {object}
     * @property {number} ore
     * @property {number} clay
     * @property {number} obsidian
     */
/**
 * 
 * @param {{ID: number, oreBot: Cost, clayBot: Cost, obsidianBot: Cost, geodeBot: Cost}} B 
 * @returns 
 */
function quality(B) {
    let mostGeodes = 0;

    let DP = new Array[24];

    return B.ID * mostGeodes;
}

let total = _(t).map(quality).sum();
console.log(total);
