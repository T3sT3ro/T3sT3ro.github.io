---
title: Templating languages
description: A small comparison of templating languages
tags:
  - templates
published: 2022-09-23T09:15:14.392Z
modified: 2024-01-25T14:30:53.861Z
last-table-update: 2022-11-02T11:40:14.174Z
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
- no IDE support
- can't write logic without assigning to new variables
- comparisons sometimes don't work (try to compare `post.content | number_of_words` with a number...)

### Handlebars

### Pug

### Scriban
