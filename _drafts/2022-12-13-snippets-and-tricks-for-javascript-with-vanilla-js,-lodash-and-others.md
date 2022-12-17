---
title: Snippets for Javascript in vanilla, lodash and others
description: A collection of snippets, shims, utility functions etc. for javascript for
  quick hacking and scripting. Useful during things like Advent of Code
date: 2022-12-13T15:16:04.721Z
preview: ""
tags:
  - JS
categories: ""
lastmod: 2022-12-16T16:15:11.522Z
slug: snippets-javascript-vanilla-lodash
---


## Lodash

- merge two objects and return minimum/maximum for keys:
  ```js
  /*recursively */ _.mergeWith ({a:5,b:10}, {a:2,b:15}, (v1,v2) => Math.min(v1, v2));
  /*flat        */ _.assignWith({a:5,b:10}, {a:2,b:15}, (v1,v2) => Math.min(v1, v2));
  // mutates first argument and returns it
  ```