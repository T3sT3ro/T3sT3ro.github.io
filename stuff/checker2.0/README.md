---
lastmod: '2021-09-02T22:32:37.773Z'
---
# Checker2.0

This is a tool to help in competitive programming and various programming tasks. It runs a compiled program, pipes the contents of `*.in` files to it's standard input and compares the output with the `*.out` files.

## Installation - TODO using npx

## Config

Check out [this example config file](./test/tests/config.yaml)

## Version

This package is WIP and build upon my prior tool: checker. This is a de-facto third version, but considering that I never finished and made ver. 2.0 fully work I crown this one a 2.0.

Why 2.0? because some duc-taped things have been/are going to be properly implemented this time, namely:

- make the checker a package with build in npm system for checking updates and upgrading
- use proper CLI argument parsing library
- use self contained ansi-coloring, without depending on my 'formatter'
- use async and better, interactive status logging
- partition the project into logical files
- add proper tests
- add more fine-grained control and status logging over tests using the `config.yaml`
- reduce mental effort to 0 when using the checker
- add proper installation instructions
- maybe add proper-lockfile or async test detection

## Immeddiate TODO - what to do NOW, ordered

- [x] Use existing argument parsing library instead of writing my own
- [X] test detection
- [ ] globbing expressions in profiles instead of regex (use minimatch library)
- [ ] config loading
- [ ] config apply

## Intended config schema

```yaml
version: <schemaVersion>

timeouts:
    3ms: [/.*SMALL/, /.*MEDIUM/]
    10ms: /.*/

order:
    
```

## TODO

There are still things to do:

- [ ] Add automatic matching of multiple programs to their corresponding tests: so that programs `{a,b,c}` can be matched to `tests/{a,b,c}/<tests>`
- [ ] Use existing colors library instead of piping to formatter
- [ ] Use some interactive CLI printing, maybe `listr` package
- [ ] Make use of `execa` and `async` packages to decouple cli printing and test running
- [ ] Add proper time counting for a process
- [ ] Add `--no-timeout` option to suppress killing process on timeout
- [ ] Add schema check for the config file
- [ ] [Add regex schema to yaml](https://github.com/nodeca/js-yaml-js-types)
- [ ] Add config profiles - any `<profile>.yaml` file in tests subdirectory is a profile to run tests with
- [ ] Add support for validator/arbiter - an interactive program that talks with program to be checked
- [ ] Add more diffing options - comparing float values with epsilon, whitespace-sensitive matching and others on demand

More distant goals:

- [ ] Integrate with VSCode as a plugin
- [ ] Automagically fetch the contest with sample data and prepare the project structure
- [ ] "0-meta-overhead" goal -- reduce the need of performing meta-tasks like creating new files, copy-pasting in/out tests from the contest's page and others