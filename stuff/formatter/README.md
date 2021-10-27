# Markdown-like formatter for terminal

> source: https://t3st3ro.github.io/packages/formatter/

I like colors. I like markdown. I like mnemonics. But I hate writing cryptic `^[[1;31mSTUFF^[[0m` every time I want something to render in bold red in my terminal. So... I created a tool to do that translation for me!

It's a simple stream processor, that parses liquid-like formatting tags (`{--` and `--}`) to insert ANSI escapes into stream. It makes printf-debugging a lot easier, and makes fancy bash scripts even fancier.

At any point remember: `formatter -h` to become a sage.

![demo](https://i.imgur.com/mc4RorK.png)

## How does it work ???

Formatter can operate in two modes: either reading from standard input until EOF (`<CTRL>+D`) or from passed arguments. It processes characters on the fly, so it doesn't need to read the whole file first\*.

Styles are added to the stack with `{<style>--` and popped with `--}`. Style mnemonics may occur only once in the bracket, and color at most twice (1st for foreground, 2nd for background). Being a stream editor, it doesn't find balanced brackets — it greedily matches the bracket and pushes ANSI escapes. The main advantage is that we can pipe an interactive process to it and it will work without visible hangups (assuming you handle pipe buffering correctly with `stdbuf`).

Pushing unbalanced marker `--}` fails visibly by rendering it on screen. This program should never throw an error, only fail to parse the brackets in case of error, thus printing them verbatim.

Styles (aside from RESET=`0` and TRIM=`#`) propagate through the stack — they are active until disabled. To enable a style, lets say BOLD, write `{*--`. To temporarily disable bold inside bolded text write `{*--` again i.e. active style is toggled (XOR-ed). Everything is briefly explained in the legend — simply use `formatter -l` to become a sorcerer. You can also examine the source code of `formatter.cpp` to see the same manual and DEMO source.

Strip mode (option `-s`) strips valid formatting off the input (valid, meaning any formatting that would normally parse). It's useful when we want both neat formatting inside terminal but raw text written to file. It can be easily achieved with the `tee` command and process substitution as `cat file.in | tee >(f -s >file.out) | f` in bash. The same effect can probably be achieved by piping through formatter first, then teeing with additional ANSI stripping, but when using `formatter -s` you can be sure that it works only on intended escapes.

----
\* memory size is proportional to the number of formattings pushed onto the stack (negligible, as they are stored in bitsmasks) and the length of the longest whitespace sequence in text in TRIM block (because we have to store whitespace padding and either print it or discard if it's, in fact, the trailing padding inside trim block).

## Installation

C++ compiler and make is required.

1. untar `formatter-*.tar.gz` and cd into the directory
2. `make install clean` to build, copy the executable to `/usr/local/bin` and clean build dir

At this point you can run `formatter --demo` to see examples

## Available styles

Run `formatter --legend` after building or check the source code of `formatter.cpp`. Remember — not all styles may be supported by your terminal. Tmux, for example, has problems with italics, blink, overline or double underline. 

It would be for the best if you run `formatter --demo` to see your terminal capabilities first.

## TODO

- [ ] option to use custom tags, because sometimes `{*--` and `--}` combinations may exist in input
- [ ] maybe refactor to decouple machine from character sets

## Example usage

```
{#--

^ trim leading whitespace

{*yR--
    this will be a bold, yellow text on bright red background

    {/%-- this will also be italic and in reversed video - yellow background and bright red foreground --}

    this will again be bold, yellow foreground and red background

    {*_--this will have bold turned off and underline on--}
    {0--here all the formatting is reset {g--and this is green--}--}
--}

trim trailing whitespace v

--}
```

![alt](https://i.imgur.com/XCjkfuT.png)

## Known issues

Sometimes terminal can "lag" and not color the lines correctly - I discovered, that when you redirect a file with content above to the formatter, the terminal won't color blank lines until you filled at least a one terminal window worth of lines. After that all lines will be colored correctly. This seems like a terminal's bug, so I'm not investigating it further. Maybe it's something wrong with my bash startup scripts and fancy prompt, idk.

![laggy terminal](https://i.imgur.com/3W8XCJh.png)