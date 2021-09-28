import glob from 'glob';
import path from 'path';
import util from 'util';
import { Config, Profile } from './configuration.js';

/** A test class that holds all of it's runtime information */
export class Test {

    /** Test's name 
     * @type string 
     */
    name;

    /** Test's io files  
     * @type {in: string, out: string} 
     */
    io = {};

    /**
     * Matched rule
     * @type {Rule} 
     */
    rule;

    /**
     * Results of the test
     * @type {errno: number, time: number, memory:number, error: string} 
     */
    results = { errno: 1, error: `Test not executed`, time: 0, memory: 0 };

    /**
     * @param {string} name test name
     */
    constructor(name) { this.name = name; }
}

export class TestDispatcher {

    /** Name of the program
     * @type {string} */
    program

    /** Root directory of tests 
     * @type {string} */
    root

    /** Config file <root>/config.yaml 
     * @type {Config}*/
    config

    /** Map of test base name to test object 
     * @type {Object.<string, Test>} */
    tests

    /** 
     * @param {string} program 
     * @param {string} root 
     * @param {Config} config 
     */
    constructor(program, root, config) {
        this.program = program;
        this.root = root;
        this.config = config;
        this.tests = {};


        try {
            this.loadTests();
        } catch (e) {
            throw `Couldn't load tests from '${this.root}'\n` + e;
        }
    }


    loadTests() {
        // Assume that any test files won't be modified while checker works.
        // I know that this can race with system-initiated file operations,
        // unfortunately tests must be ordered somehow, and this is good enough.
        const ioFiles = glob.sync(path.join(this.root, '**', '*.{in,out}'));
        if (ioFiles.length == 0)
            throw `There are no valid test files in '${this.root}'`;


        // detect tests 
        for (const ioFile of ioFiles) {
            let parsed = path.parse(path.relative(this.root, ioFile));
            let name = path.join(parsed.dir, parsed.name);
            let test = this.tests[name] || new Test(name);
            test.io[parsed.ext] = ioFile;
            this.tests[name] = test;
        }
    }

    /**
     * Dispatches the tests
     * @param {Profile} profile profile to run
     */
    dispatch(profile) {
    }
}