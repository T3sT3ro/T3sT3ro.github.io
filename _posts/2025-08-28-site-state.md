---
title: State of this website
description: What's the current state of the site and what are the plans?
date: 2025-08-28T18:09:21.372Z
preview: ""
tags:
    - website
    - jekyll
    - astro
categories: []
lastmod: 2025-08-28T19:49:03.250Z
type: ""
---

Currently the site is in a state of permanent migration. What started as an (intended) Jekyll blog turned out to be a dumpster of various experiments and prototypes. I tried to keep it all together in one place, but it became a mess.

As soon as I realized that Jekyll is a dumpster fire itself, I started looking for alternatives. After going through a bunch of attempts with other generators (Hugo, e11y and some others I don't remember) I decided on Astro, however I haven't yet fully migrated everything. I attempted to do it 3 times already, but each time something got in the way.

Nevertheless, what is on the surface of the webpage doesn't fully represent the current state of the site. There is a lot of stuff hidden underneath, simply not exposed to the public eye. Digging through source is the most reliable way to find out what is actually going on. Good stuff is hidden in `stuff`, `permalinks` or in `algo`.

I began migrating the sub-projects to separate repositories, for example my [Advent of Code](https://github.com/T3sT3ro/advent-of-code/)

My current plan includes:
1. splitting existing projects into separate repositories
2. start with fresh astro
    - Also improve my Astro knowledge, in the meantime I was attempting migrations it had like 5 major releases or so.
3. pick libraries and plugins:
    - for markdown: Markdoc (chosen over MDX)
    - for code highlighting: whatever is in Astro, but make sure my codeblock stuff is included (wrap, smarter width)
    - for rendering and interactivity: not sure. I would want to avoid React, as it is heavy, bloated and it's complexity not fitting something simple as this site. At the same time other projects like Solid seem interesting but I am not sure how well they integrate with Astro and how mature their ecosystem is.
    - for styling - well, would be nice to have something functional and simple. I worked with Tailwind but it seems to much for me, and more restrictive than pure CSS. PostCSS has poor DX and is problematic. SCSS is becoming less relevant with native CSS features. For styling something like OpenProps looks like a good fit, but it's design system and tokens are still not up to my standard yet (and mid-migration to 2.0?)
4. Design new page which looks and reads well
5. Implement the site

Currently I feel a blockage in other projects due to this site — I would like to document the progress of them, but I don't want to do it in the current state of the site. But because this site takes so much effort to rebuild, I can't focus on other things.
