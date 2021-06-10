const fs = require('fs');
const YAML = require('yaml');
const { Validator } = require('jsonschema');

const validator = new Validator();

function toMiliseconds(durationString) {
    let milis = durationString.match(/^((?:\d*\.)?\d+)\s*(?:ms|milis|milisecs?|miliseconds?)?$/i);
    let seconds = durationString.match(/^((?:\d*\.)?\d+)\s*(s|secs?|seconds?)$/i);
    console.log("DUPA");
    if (milis) return +milis[1];
    if (seconds) return +seconds[1] * 1000.0;
    return false;
}

const configSchema = {
    properties: {
        timeout: { required: false , format: toMiliseconds,},
        tests: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    timeout: { required: false, format: toMiliseconds }
                }
            }
        }
    },
};
let configPath = "./tests/config.yaml";

if (fs.existsSync(configPath)) {
    try {
        var config = YAML.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        console.error(`Error while reading ${configPath}:\n${e}`);
        process.exit(1);
    }
}

console.log(config);
console.log(validator.validate(config, configSchema));
