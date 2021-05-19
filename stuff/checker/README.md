# Checker

## What's that ?

This small Node.JS script is used to test a program against test cases. Program is supplied by `*.in` files to the `stdin` and it's `stdout` is compared agains `*.out` files. It automates and presents nicely the results of running the tests.

To have even nicer output I recommend using [my formatter](https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/formatter) by piping the checker to interactive formatter process without buffering:

```
check prog test c: | stdbuf -i0 -o0 formatter
```

## Remarks

All RegExps checks should by design be ignoring case. If they don't then file an issue.

## Use cases

1. Learn more about checker and options

   ```
   node check -?
   ```

2. Test program `prog`(default name) for all `*.in` files in directory `tests`(default name) using config `<test_dir>/config.yaml`(default location) and compare outputs with corresponding `*.out` files:

    ```
    node check
    ```

3. Test program `keppler` against tests `A` and `B` in directory `planetes` and show diff for tests that differ

    ```
    node check -d keppler planetes ^A$ ^B$ 
    ```

4. Test program `slow` on all tests in directory `tests` except tests matching `BIG` regex

    ```
    node check slow tests -- !BIG
    ```

5. Test program `prog` against all tests in directory `tests` and store program's stdout to files `tests/*.tee`

    ```
    node check --tee prog tests
    ```

6. Generate `solutions/*.tee` files for each `*.in` file in directory `tests` for program `brute`

    ```
    node check --gen:solutions brute tests
    ```

7. Test program `prog` for `*.in` files against `*.out` in directory `tests` and:
   - show colorful status report in terminal with `--color` and piping to `formatter`
   - store program's stderr stream to `logs/*.log` files with `--log:logs`
   - store program's stdout stream to `trace/*.tee` with `--tee:trace`
   - show mismatched line for differing test in `--diff`
   - fetch config from file `customConfig.yaml`

    ```
    node check --color --tee:trace --log:logs -diff prog tests customConfig | stdbuf -i0 -o0 formatter
    ```

8. Check for update and upgrade checker

   ```
   node check --update:upgrade
   ```

## Config

Check out current config schema in the file [tests/config.yaml](tests/config.yaml)

Currently supported values are:

- `timeouts` as map of RegExp to limit string (number with s/ms suffix) saying how long the process can run (after this timeout `SIGTERM` is sent to process). Effective is the last RegExp which matches the most in length of the text
- `order` as ordered list of RegExp matching tests - they will be run in this particular order. It's useful in cases when alphabetical order gives big and long tests first, but you want to run short tests before them. In this case the first matched RegExp is affective. All tests included in tests are run before other non specified tests.

## TODO

- [ ] Add support for interactive validator program instead of `*.out` files.
- [X] ~~Support timeout to exec function in some `tests.lim` file as map `testName: time limit for timeout` or make each file start with some header specifying test parameters.~~ Config loading and schema validation (primitive by hand, no schema validator).
- [X] Better differentiation of tests ending in runtime error / non zero exit code vs those that just diff differently (RE vs WA) - return error message on crash.
- [ ] Column diff in new Node checker
- [ ] package into one file with easy install
- [ ] depend on some other updater package
- [X] fix line endings diff error
- [X] error on unsupported options ~~and values~~
- [ ] detect why sometimes not all output is written and process crashes with errno 13 without visible cause.
