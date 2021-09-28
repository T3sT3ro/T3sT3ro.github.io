import { readFile } from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import _ from 'lodash';
import c from 'ansi-colors';
import mm from 'micromatch';
import R from './R.js';
import { Test } from './testing.js';

const ajv = new Ajv({ allowUnionTypes: true });
const schema = JSON.parse(await readFile(R('resources/schema-1.0.0.json'), 'utf-8'));
const validate = ajv.compile(schema);

export class Config {
    /** @type {Object.<string,Profile>} */
    profiles = {};

    /**
     * Creates new normalized Config from given string.
     * @param {string} yamlString YAML string describing the config
     * @throws YAML or AJV error if config has invalid format or doesn't conform to schema
     */
    constructor(yamlString) {
        // validate the YAML and string
        let cfg;
        try {
            cfg = yaml.load(yamlString);
        } catch (e) {
            throw `Config YAML file has some errors\n` + e;
        }
        if (!validate(cfg)) throw `Config doesn't conform to schema\n` + validate.error;

        // unroll the root list to default profile
        if (Array.isArray(cfg))
            cfg = { 'default': cfg };

        // parse filters
        for (const [pName, rawFilters] of Object.entries(cfg)) {
            let filters = _.flattenDeep(rawFilters).map(f => new Filter(f));
            this.profiles[pName] = new Profile(...filters);
        }
    }
}

/**
 * @extends {Array<Filter>}
 */
export class Profile extends Array {
    /**
     * @param {Test[]} tests tests to order
     * @returns {Array<Test>}
     */
    orderTests(tests) {
        return _.chain(tests)
            .map(test => test.split(path.sep))
            // orders lexicographically but /0072/ would be after /namedTest/
            .sort((ax, bx) => {
                for (const [a, b] of _.zip(ax, bx)) {
                    if (a === undefined) return -1;
                    if (b === undefined) return 1;
                    const a_lex_b = a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
                    if (a_lex_b == 0) continue;
                    // numbers will eval to +1 and others to 0 (cuz +null === 0)
                    const [an, bn] = [a, b].map(x => +!!x.match(/^\d+$/));
                    return (an === bn) ? a_lex_b : bn - an; // numerics after strings
                }
            })
            .map(nx => path.join(...nx))
            .map(test => new Test(test, this.find(f => f.match(test))))
            .filter(t => t.rule) // only tests that matched rules 
            .groupBy(t => this.findIndex(f => f.match(t))) // partition to buckets
            .sortBy((bucket, order) => order) // order buckets
            .flatten() // create an ordered list
            .value()
    }
}

export class Filter {
    /**@type Rule[] */
    rules = [];

    /** @param {string|number|object} set unordered set of rules for this filter */
    constructor(set) {
        if (['string', 'number'].includes(typeof set))
            set = { [set]: null };

        this.rules = Object.entries(set).map(e => new Rule(...e));
    }

    /**
     * @param {string} test 
     * @returns rule that matched test
     */
    match(test) { return this.rules.find(f => f.isMatch(test)); }
}

/**
 * One rule matching a filter
 */
export class Rule {
    /** @type string */
    pattern = undefined;
    /** @type {{time: number, memory: string}} */
    limits = {};

    static UNITS = {
        ms: 1,
        s: 1000,
        min: 1000 * 60,
        h: 1000 * 60 * 60,
        b: 1,
        kb: 10 ** 3,
        mb: 10 ** 6,
        gb: 10 ** 9,
    };

    constructor(pattern, limit) {
        this.pattern = pattern;
        if (!limit) return;
        const toBaseUnit = ([s, d, u]) => {
            return +d * Rule.UNITS[u.toLowerCase()];
        };
        this.limits.time = toBaseUnit(limit.match(/((?:\d*\.)?\d+)(ms|s|min|h)/i) || []);
        this.limits.memory = toBaseUnit(limit.match(/((?:\d*\.)?\d+)(b|kb|mb|gb)/i) || []);
    }

    /**
     * @param {string} test 
     * @returns true if rule glob pattern matches the test
     */
    isMatch(test) {
        let matchResult = mm.isMatch(test, this.pattern);
        console.log(c.cyan(`matching ${test} against ${this.pattern}`), matchResult ? c.green("YES") : c.red("NO"));
        return matchResult;
    }
}

export const DEFAULT_CONFIG = new Config(
    await readFile(R('resources/defaultConfig.yaml'), 'utf-8')
);