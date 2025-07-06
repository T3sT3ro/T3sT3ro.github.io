---
title: On dotfiles management
description: A sample blog post
draft: true
published: 2024-11-08T21:25:47.485Z
modified: 2024-11-08T21:48:12.433Z
fmContentType: blog
---

Dotfiles are inherently messy. There is no denial of that fact. Numerous tools were born just to try to make sense of this chaos. Yadm, home-manager, stow... Countless have tried to contain the chaos. None managed to tame it fully. We are bound by the shackles of legacy decisions impacting the very fabric of the unix world from aeons past and whipped by the merciless goddess of fragmentation, a two faced entity giving us freedom on one hand and burdening us with a lack of coherency on the other.

## Common issues with dotfiles

- Hardcoded paths preventing us from keeping the configs organized
- machine-specific versions of configs
- no easy bootstrap and imperative nature of the configuration files
- poorly known conventions and lacking adherence to existing ones (e.g. XDG specification)
- No ownership trace, preventing clean installs and removals. Do I still need `.something` file I modified last time 4 yeas ago?
- destructive state without if no external versioning tool is used
- lack of standard, unified configuration language
- no out-of-the box solution for overlay configurations and partial overwrites
- handling secrets is problematic