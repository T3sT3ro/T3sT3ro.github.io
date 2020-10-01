# Markdown-like formatter for terminal

I like colors. I like markdown. I like mnemonics. I love how modern terminals support colors and formatting. But I hate writing cryptic `^[[1;31mSTUFF^[[0m` everytime I want something to render in bold red. Sooo... I created a tool to do that for me.

It's a simple stream processor, that parses simple liquid-like tags (`{--` and `--}`) to insert ANSI escapes into code. It makes printf-debugging a lot easier, and makes fancy bash scripts even fancier.

At any point remember : `./formatter -h` to become a sage.

## Modus Operandi

Formatter can operate in two modes: either reading from standard input until EOF (`<CTRL>+D`) or from passed arguments. It processes characters on the fly, so it doesn't need to read the whole file first*.

Styles are added to the stack with `{<style>--` and popped with `--}`. Style mnemonics may occur only once in the bracket, and color at most twice (1st for foreground, 2nd for background). Being a stream editor, it doesn't find balanced brackets - it greadily matches the bracket and pushes an ANSI escapes. The main adventage is that we can pipe an interactive process to it and it will work.

Pushing unbalanced `--}` fails visibly by rendering on screen. This program should never fail, only don't parse the brackets in case of error.

Styles (aside from RESET=`0` and TRIM=`#`) propagate through the stack - they are active until disabled. To enable a style, lets say BOLD, write `{*--`. To disable bold when it currently active write `{*--` again. Everything is briefly explained in the legend - simply use `./formatter -l` to become a wizard. You can also examine the source code of `formatter.cpp` to see manual.

----
\*  memory size is proportional to the number of pushed formattings on a stack and the length of the longest whitespace sequence in text in TRIM block (because we have to store whitespace padding and either print it or discard if it's, in fact, the leading padding)

## Installation

C++ compiler and make is required.

1. untar `formatter-*.tar.gz` and cd into the directory
2. `make` to build the `formatter` executable
3. `sudo make install` to copy the executable to `/usr/local/bin`

At this point you can run `make demo` to see examples and clean with `make clean`

## Available styles

run `./formatter -l` after building or [check the source code of `formatter.cpp`](formatter.cpp). Remember - not all styles may be supported in your terminal. It's best to run `make demo` first to see what works and what doesn't work in your terminal.

## example usage

```
{#--

^trim leading whitespace

{*yR--
    this will be bold, yellow text on bright red background

    {/%-- this will also be italic and in reversed video - yellow background and bright red foreground --}

    this will again be bold, yellow foreground and red background

    {*_--this will have bold turned off and undeerline on--}
    {0--here all the formatting is reset {g--and this is green--}--}
--}

trim trailing whitespace

--}
```
