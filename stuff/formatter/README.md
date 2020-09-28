# Markdown-like formatter for terminal by Tooster

This tool is a simple stream processor, that parses text with simple markup-like tags to text formatted using ANSI ansi escapes. This text can be further nicely displayed in terminal. Formatting codes use easy to remember mnemonics

At any point remember : `./formatter -h` to display help.

## Modus Operandi

Formatter can operate in two modes: either reading from standard input, or from passed arguments. When reading from standard input, it reads until EOF (`<CTRL>+D`) and prints text with proper ANSI sequences to the standard output. It processes characters on the fly, so it doesn't need to read the whole file first. It only has to store styles stack and some small memory for parsing brackets, or leading whitespace padding of textblock.

Active styles are kept on a stack. To push new style onto stack we introduce special sequence: `{<format>--`, where each operator occurss at most once  (aside from color operator - of which we can have at most 2 - 1st for foreground color, second for background color). We use `--}` to pop the formatting. Being a stream editor, we don't find balanced brackets in the stream - we greadily match the bracket at push an ANSI escape as soon as it matches. If we for example try to pop more styles than there are on the stack, we will simply print `--}` AKA fail silently.

This program should never fail if input is supplied. It works on best-effort basis - if it can be parsed, it is parsed, but if it cannot be, it is simply printed as-is.

Styles propagate through the stack (with few exceptions), so we stack formattings. Everything should be explained in the programs legend - simply use `./formatter -l` to display legend and learn what it can do.

It also supports standard `./formatter -h` option for getting help, so better check it first. The legend is in the top part of the source code.

## Preparation/installation

C++ compilator and make is needed.

1. copy `Makefile`, `formatter.cpp` and `demo.txt` to one directory
2. `make` to build the `formatter` executable
3. `sudo make install` to copy the executable to `/usr/local/bin`
4. at this point you can run `make demo` to see examples and clean with `make clean`

## Available styles

run `./formatter -l` after building or look inside the source code of `formatter.cpp`.

## example usage

```
{#--

^trim leading whitespace

{*yR--
    this will be bold, yellow text on bright red background

    {%/-- this will also be italic and in reversed video - yellow background and bright red foreground --}

    this will again be bold, yellow foreground and red background

    {*_--this will have bold turned off and undeerline on--}
    {0--here all the formatting is reset {g--and this is green--}--}
--}

trim trailing whitespace

--}

```
