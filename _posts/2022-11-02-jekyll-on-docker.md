---
title: Local, offline jekyll blogging without ruby installation.
tags:
  - docker
  - jekyll
date: 2022-11-02T09:15:23.457Z
lastmod: 2023-05-11T16:38:56.175Z
type: default
slug: self-contained-jekyll-with-docker
description: How to set up easy jekyll environment using docker, docker-compose and VScode without manual ruby installation.
---

Jekyll can be finnicky. This post is a guide on how to set up jekyll locally, without manual ruby installation, managing gems and configurations and polluting system. After following this guide you will get a unified, **reproducible** environment for managing Jekyll blog.

## Why?

I tried setting up Jekyll several times from official guides but there was always something broken:

- I required Live preview that worked offline and was simple to run...
- I Didn't want to install Ruby, `jekyll` and other tools globally on my system just for one blog[^1]...
- It didn't "just work" — broke randomly while updating gems or system, slowed down `.bashrc` startup...
- I Didn't want to learn even more tools: `ruby`, `bundler`, `rubyGems`, `RVM`, `rbenv` and decide on the best one...
- I Tried to keep everything neatly in one directory rather than scattering files all over my system...
- I Wanted to have a one-click solution to start/stop a preview...

The solution to my problems was to use Docker.

This guide uses Docker and Docker Compose to provide a simple control over the environment. No prior knowledge is necessary.

<details markdown=block>

<summary>Why docker?</summary>

- Helps you keep your global scope clean — it uses self-contained docker images.
- You can YEET everything later with only a few simple clicks.
- You have reproducible environment that you can setup on any machine.
- It's just a great tool that helps with a general development (I use it to run Sonarqube, CUDA, Jekyll and others).

Okay, it can be a bit slow to start, but It's bearable for me.

</details>

## Guide

1.  First, prerequisites:
    1. [Install Docker](https://docs.docker.com/engine/install) if you haven't done so already. Here, I use the fundamentals that can be learned in the first 5 minutes of use.
    1. I **strongly** recommended using [VS Code](https://code.visualstudio.com/) as a main site editing tool. For extensions I recommend:
      - [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) extension
      - [Liquid](https://marketplace.visualstudio.com/items?itemName=sissel.shopify-liquid) (for Liquid language support in jekyll)
      - [Markdown All In One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) for autocompletion etc.
      - [Front Matter](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter&ssr=false#review-details) for managing posts and frontmatter in a local dashboard
      - [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) for standard markdown style

2.  Pull jekyll image with `docker pull jekyll/jekyll:4.2.2` (use can use the `:latest` tag, but I recommend using one specific version like `:4.2.2` for reproducibility).
3.  Create new website by [following the respective guide on image's page](https://github.com/envygeeks/jekyll-docker/blob/master/README.md#quick-start-under-windows-cmd), something along the lines:

    ```bash
    docker run --rm \
        --volume="${PWD}:/srv/jekyll" \
        -it jekyll/jekyll \
        sh -c "chown -R jekyll /usr/gem/
            && jekyll new MY_NEW_AWESOME_SITE_NAME
            && bundle config set --local path 'vendor'"
    ```

    The last part with `bundle config...` is particularly useful for gems to cache properly and for you to be able to work offline — otherwise jekyll image will try to download gems not present in the base image each time the container is started (significantly extending launch and disallowing for work offline).

4.  enter newly created `MY_NEW_AWESOME_SITE_NAME` directory
5.  **[Highly recommended]:** Initialize [git](https://git-scm.com/) repository inside this directory:
    1. `git init`
    2.  create `.gitignore` (if missing) and add to it following content:

        ```
        **/_site
        **/.sass-cache
        **/.jekyll-cache
        **/.jekyll-metadata
        **/vendor
        ```
        {: filename=".gitignore"}

6.  Create `vendor/bundle` directory in the website root. This will be used to store cached gems (ruby programs).
7.  Create `docker-compose.yml` file in the website root with content similar to:

    ```yml
    services:
        jekyll-server:
            image: jekyll/jekyll:4.2.2
            volumes:
                - .:/srv/jekyll:Z
                - ./vendor/bundle:/usr/local/bundle:Z # cache for offline work
            ports:
                - "[::1]:4000:4000" # server port
                - "[::1]:35729:35729" # livereload port
            command: jekyll serve # runs jekyll local server
            # ↑ --drafts --livereload --incremental   you can add optional arguments
    ```
    {: filename="docker-compose.yml"}

    The command in the services can be modified to your liking. Using `jekyll serve` command will start the local server at  address <http://localhost:4000> serving your website. `jekyll build` would rebuild site without starting server (compiled site is in the `_site` directory).

8.  Add appropriate entries to the `_config.yml` file (to exclude them from being copied to the static site):

    ```yml
    exclude:
        - .sass-cache/
        - .jekyll-cache/
        - Gemfile
        - Gemfile.lock
        - vendor
        - docker-compose.yml
        - frontmatter.json
        - .frontmatter
    ```
    {: filename="_config.yml"}

    The last two are only needed if you also use the Front Matter addon for VSCode. To apply changes in this file (download gems, etc.) you have to run the `Update gems` task from the next step. If you don't use VSCode you have to run the command from that task manually.

9.  **[Highly recommended]:** Add new **tasks** (in `.vscode/tasks.json`).

    ```json
    {
        "label": "Update gems",
        "type": "shell",
        "command": "docker compose run jekyll-server bash -c 'bundle config unset deployment && bundle update && bundle install --deployment'",
    },
    {
        "label": "compose up jekyll",
        "type": "docker-compose",
        "dockerCompose": {
            "up": {
                "detached": true,
                "build": true,
                "services": ["jekyll-server"]
            },
            "files": [
                "${workspaceFolder}/docker-compose.yml"
            ]
        }
    }
    ```
    {: filename=".vscode/tasks.json"}

    Those tasks will be available in the VSCode's Run and Debug drawer. The first task is used to update gems. [The second one](https://code.visualstudio.com/docs/containers/reference#_docker-compose-task) is used to start a jekyll server in compose when launching and attaching to Chrome with VSCode debugger (via `F5` i.e. Run and Debug tab).

    I'm not certainly sure about the `bundle` parts in the `Update gems` task, but in my case gems didn't cache properly without it. This made it work (but also some other bloat was pulled from container into the `vendor/` directory).

10. **[Highly recommended]:** Create a vscode **launch configuration** (in `vscode/launch.json`) for debugging your site in the browser with vscode:

    ```json
    {
        "type": "chrome",
        "name": "Debug jekyll _site",
        "request": "launch",
        "url": "http://localhost:4000",
        "webRoot": "${workspaceFolder}/_site",
        "preLaunchTask": "compose up jekyll"
    }
    ```
    {: filename=".vscode/launch.json"}

    This enables you to launch Chrome in debugger mode and set breakpoints directly in VSCode. Here the `preLaunchTask` points to the corresponding task in the previous step.

    **IMPORTANT NOTES:**
    - Be patient. Docker has to start, jekyll has to start, jekyll has to generate files, and Chrome has to start. Don't expect immediate results.
    - You can't debug sources in the main directory. Place breakpoints in the corresponding files inside `_site`, **NOT** your main sources. You'd have to include some JS sourcemaps if you wanted to (Jekyll doesn't generate them, but iirc [Jekyll assets gem] (https://github.com/envygeeks/jekyll-assets) does; I'm not adding it because I hope to move away from Jekyll in the future).

**And that's it!** Now you can:

- Run your local Jekyll installation from the terminal with `docker compose up jekyll-server`...
- ...you can ALSO use <kbd>F5</kbd> in VSCode to start debugging...
- ...and if you have docker-containers extension for VS Code you can also run <kbd>Ctrl-Shift-P</kbd> `>Docker: Compose Up` from the command palette...
- ...or press <kbd>Ctrl-Shift-P</kbd> `>Run Task > compose up jekyll` in the VSCode command palette to run a task.
- Attach to logs with `docker compose logs` when running compose in the background (`--detached` flag for background).
- Launch debugger chrome instance via task in VSCode using <kbd>F5</kbd> (or via bash script) and to update gems from step 9. (by running tasks).
- Stop containers with `docker compose down`.
- Use `docker compose ps` or the VS Code Docker tab to see if containers are running.

As a bonus, I could recommend using the [Frontmatter extension for VSCode](https://frontmatter.codes/) as a local CMS for the site. It works wonderfully well.

## How to revert and clean your environment

1. Stop respective containers (check with `docker [compose] ps`) using `docker compose down`.
2. Optionally clean your downloaded docker images with `docker rm <image>` or `docker prune` to delete all unused images.
3. ...
4. Profit!

---

[^1]: You will have to install Docker though, but it would be a sin not to have it and know it as a developer.
