const fs = require('fs');
const YAML = require('yaml');

function toMiliseconds(durationString) {
    let milis = durationString.match(/^((?:\d*\.)?\d+)\s*(?:ms|milis|milisecs?|miliseconds?)?$/i);
    let seconds = durationString.match(/^((?:\d*\.)?\d+)\s*(?:s|secs?|seconds?)$/i);
    if (milis) return +milis[1];
    if (seconds) return +seconds[1] * 1000.0;
    return false;
}

const TIME_LIMIT_REGEX = /((?:\d*\.)?\d+)\s*(m?s)/i;
const MEMORY_LIMIT_REGEX = /((?:\d*\.)?\d+)\s*([kmg]{1}b?)/i;

// this could be done with avj or some other advanced schema validator... but it's just too simple to bother

// TODO: remove below
let configPath = "tests/config.yaml";

// returns [matchedKey, match] in object where keys are RegExps 
function getFuzzyKey(object, key) {
    let matchings = Object.keys(object).map(k => [k, key.match(RegExp(k, 'i'))?.[0]]);
    let bestLen = Math.max(...matchings.map(it => it[1]?.length ?? 0));
    return matchings.reverse().find(e => e[1]?.length == bestLen);
}

if (fs.existsSync(configPath)) {
    try {
        var config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

        console.log(config);
    } catch (e) {
        console.error(`Error while reading ${configPath}:\n${e}`);
        process.exit(1);
    }
}

console.log(getFuzzyKey(config.timeouts, "OTHE"))
