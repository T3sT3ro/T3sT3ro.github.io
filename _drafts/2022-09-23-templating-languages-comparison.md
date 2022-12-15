---
title: Templating languages
date: 2022-09-23T09:15:14.392Z
tags:
  - templates
lastmod: 2022-12-15T22:02:35.197Z
last-table-update: 2022-11-02T11:40:14.174Z
layout: post
draft: true
---

This post serves as a reference for templating languages, comparison of their respective features and what I've learned about them so far.

Ejs, Liquid, Mustache, Handlebars, Scriban... ugh... so many and so similar, yet so different!

> Q: Which one to choose though?
> : A: Liquid


Just kidding.

## Comparison table

The table was last updated at {{ page.last-table-update | date: "%d-%m-%Y"}}

|feature| EJS| Liquid| Mustache| Handlebars| Pug | Scriban |
|---|---|---|---|---|---|---|
|scripting language| JS embedded with `<% ... %>` tags on site | liquid language | mustache language | handlebars, but also compatible with mustache | JS, Pug | Scriban language |

## detailed comparisons

### Ejs

### Mustache

### Liquid

- all included variables are bound to `include` object
- missing advanced conditional logic and `not` operator \[!!\]
- includes in jekyll don't expose bound variables - you have to skim through the code
- missing intellisense in tools (to support variables)
- missing some way to debug values of variables (when is `nil`, when is not set etc.)

### Handlebars

### Pug

### Scriban
