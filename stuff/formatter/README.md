# Markdown-like formatter for terminal by Tooster

This tool is a simple stream processor, that parses text with simple markup-like tags `{--` and `--}` to text formatted using ANSI ansi escapes. This text can be further nicely displayed in terminal. Formatting codes use easy to remember mnemonics

At any point remember : `./formatter -h` to display help.

## Modus Operandi

Formatter can operate in two modes: either reading from standard input, or from passed arguments. When reading from standard input, it reads until EOF (`<CTRL>+D`) and prints text with proper ANSI sequences to the standard output. It processes characters on the fly, so it doesn't need to read the whole file first. It only has to store styles stack and some small memory for parsing brackets, or leading whitespace padding of textblock.

Active styles are kept on a stack. To push new style onto stack write `{<format>--` sequence, where each operator occurs at most once  (aside from selection operator - at most 2 can occur - 1st for foreground color, 2nd for background color). Use `--}` to pop the formatting. Being a stream editor, it doesn't find balanced brackets - it greadily matchex the bracket and pushes an ANSI escapes.

Popping more states than stack has results in `--}` being written to output AKA fail silently. This program should never fail if input is supplied. It works on best-effort principle - if a sequence can be parse, it is parsed, but if it can't, it is simply printed as-is.

Styles propagate through the stack (with few exceptions like RESET=`0` and TRIM=`#`), so we stack formattings. Everything is explained in the legend - simply use `./formatter -l` to display see and learn what it can do. You can also examine the source code of `formatter.cpp` to see minimal manual.

## Preparation/installation

C++ compilator and make is needed.

1. copy `Makefile`, `formatter.cpp` and `demo.txt` to one directory
2. `make` to build the `formatter` executable
3. `sudo make install` to copy the executable to `/usr/local/bin`
4. at this point you can run `make demo` to see examples and clean with `make clean`

## Available styles

run `./formatter -l` after building or look inside the source code of `formatter.cpp`. Remember - not all styles may be supported in your terminal. It's best to run `make demo` first to see what works and what doesn't work for you.

## example usage

{% raw %}

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

{% endraw %}