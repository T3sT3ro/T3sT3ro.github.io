---
title: Snippets for Javascript in vanilla, lodash and others
description: A collection of snippets, shims, utility functions etc. for javascript for quick hacking and scripting. Useful during things like Advent of Code
tags:
  - JS
slug: snippets-javascript-vanilla-lodash
draft: true
published: 2022-12-13T15:16:04.721Z
modified: 2024-01-25T14:29:57.892Z
---


## Lodash

- merge two objects and return minimum/maximum for keys:
  ```js
  /*recursively */ _.mergeWith ({a:5,b:10}, {a:2,b:15}, (v1,v2) => Math.min(v1, v2));
  /*flat        */ _.assignWith({a:5,b:10}, {a:2,b:15}, (v1,v2) => Math.min(v1, v2));
  // mutates first argument and returns it
  ```