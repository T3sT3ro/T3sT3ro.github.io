# Checker

## What's that ?

This small Node.JS script is used to test a program agains test cases. Program is supplied by `*.in` files to the `stdin` and it's `stdout` is compared agains `*.out` files. It automates and presents nicely the results of running the tests.

To have even nicer output I recommend using [my formatter](https://github.com/T3sT3ro/T3sT3ro.github.io/tree/master/stuff/formatter) by piping the checker to interactive formatter process without buffering:

```
check prog test c: | stdbuf -i0 -o0 formatter
```

## Use cases

1. Learn more about checker and options

   ```
   node check ?
   ```

2. Test program `prog` for all `*.in` files in directory `tests` and compare outputs with corresponding `*.out` files:

    ```
    node check prog tests
    ```

3. Test program `prog` agains tests `A` and `B` in directory `tests` and show diff for tests that differ

    ```
    node check showDiff: prog tests A B 
    ```

4. Test program `prog` against all tests in directory `tests` and additionaly store program's output to files `tests/*.out.tee`

    ```
    node check tee: prog tests
    ```

5. Generate `solutions/*.out.tee` files for each `*.in` file in directory `tests` for program `brute`

    ```
    node check gen:solutions brute tests
    ```

6. Test program `prog` for `*.in` files agains `*.out` in directory `tests`, show colorful status report in terminal with `c:` and piping to `formatter`, show command used to launch each test case with `showCmd:`, store outputs from program to `*.out.tee` files in the same directory `tests` with `tee:` and `diff` only with `-b` flag for tests (assuming that my custom `formatter` is installed)

    ```
    node check color: tee: showCmd: diff: diffFlags:b prog tests | stdbuf -i0 -o0 formatter
    ```

## TODO

- [ ] Add support for interactive validator program instead of `*.out` files.
- [ ] ~~Support timeout to exec function in some `tests.lim` file as map `testName: time limit for timeout` or make each file start with some header specifying test parameters.~~ Config loading and schema validation.
- [X] Better differentiation of tests ending in runtime error / non zero exit code vs those that just diff differently (RE vs WA) - return error message on crash.
- [ ] Column diff in new Node checker
