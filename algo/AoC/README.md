# [Advent of Code](https://adventofcode.com/)

This is a collection of my solutions, helper scripts and inputs for Advent of Code.

There are some missing solutions, for example for 2015, because I've been using browser's debug console to write my solutions :)

There is a common idiom in all of my `.js` scripts, namely:

```js
$ = require('../in.js');
_ = require('lodash');
t = $('IN/0x').textContent.trim();
```

It is so, because I use JQuery on AoC input site to extract the text of input via `$('pre').textContent`, so this makes it easy to copy-paste code from/to browser and change only 2 lines in very simple way.