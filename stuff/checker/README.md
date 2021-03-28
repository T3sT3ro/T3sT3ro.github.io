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

4. Generate outputs `solutions/*.out.tee` for bruteforce program `brute` for all inputs `*.in` in directory `tests`

    ```
    node check noCheck: tee:solutions brute tests
    ```

    or

    ```
    node check gen:solutions brute tests
    ```

5. Test program `prog` for `*.in` files agains `*.out` in directory `tests`, show colorful status report in terminal with `c:` and piping to `formatter`, show command used to launch each test case with `showCmd:`, store outputs from program to `*.out.tee` files in the same directory `tests` with `tee:` and `diff` only with `-b` flag for tests (assuming that my custom `formatter` is installed)

    ```
    node check color: tee: showCmd: diff: diffFlags:b prog tests | stdbuf -i0 -o0 formatter
    ```

## TODO

- [ ] Add support for validator instead of `*.out` files
- [ ] Support timeout to exec function in some `tests.lim` file as map `testName: time limit for timeout` or make each file start with some header specifying test parameters
- [ ] Better differentiation of tests ending in runetime error / non zero exit code vs those that just diff differently (RE vs WA)
