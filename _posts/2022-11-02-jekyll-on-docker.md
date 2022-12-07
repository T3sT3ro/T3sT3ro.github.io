---
title: Jekyll + Docker + Compose + VScode = ♥
date: 2022-11-02T09:15:23.457Z
tags: docker jekyll
lastmod: 2022-12-06T13:12:08.757Z
---

If you:

1. Wanted a website on Github Pages
2. Discovered Jekyll
3. Got clobbered by the install instructions including pulling `ruby`, `gem`, `gcc`, `bundler` and similar
4. Recalled that you know nothing about ruby, gems, bundler and similar and let you are against installing crap
5. Discovered ruby package managers (`RVM`, `rbenv`) and failed miserably installing them, finding later out that suddenly your `.bashrc` is 2 seconds slower to load due to `rbenv` path setup script
6. Withstood the excruciating pain of realizing that your workstation gets messier and messier
7. With blood trickling down from your very eyes you finally start a jekyll only to find you installed gems to global scope, your lockfile got corrupted, your gems didn't update and your Jekyll doesn't want to start

Then I've excelent news!

**You can avoid all of that crap with Docker!**

## Why Docker?

- Keep your global scope clean[^1]
- you can YEET everything later with few simple clicks
- You have everything organized
- You have reproducible environment that you can setup on any machine
- It is Just So Simple™
- If you didn't use Docker already, then it's the perfect time to start learning it. It's a great tool for tinkering and testing tools that you don't know if you will ever use — Want to try ML with PyTorch? GPU programming with CUDA? Ancient programming with Fortran? Play with databases with Redis? Setup local webserver and collect logs with Nginx and Elastic? `docker pull` will get you covered.

## Guide with Docker

1. First, prerequisites:
   1. [Install Docker](https://docs.docker.com/engine/install) if you haven't done so already.
   2. I also recommend using [VS Code](https://code.visualstudio.com/) as a main tool to edit site. For extensions I recommend:
      - Docker extension
      - Liquid (for Liquid language support in jekyll)
      - Markdown All In One
      - Front Matter for managing posts and frontmatter in a local dashboard
      - markdownlint

2. Pull jekyll image with `docker pull jekyll/jekyll:4.2.2` (use can use the :latest tag, but I recommend using one specific version like `4.2.2` for reproducibility)
3. Create new website by [following the respective guide on image's page](https://github.com/envygeeks/jekyll-docker/blob/master/README.md#quick-start-under-windows-cmd), something along the lines:

   ```bash
   docker run --rm \
       --volume="${PWD}:/srv/jekyll" \
       -it jekyll/jekyll \
       sh -c "chown -R jekyll /usr/gem/
           && jekyll new MY_NEW_AWESOME_SITE_NAME
           && bundle config set --local path 'vendor'"
   ```

    The last part with `bundle config...` is particularly useful for gems to cache properly and for you to be able to work offline — otherwise jekyll image will try to download gems not present in the base image each time the container is started (significantly extending launch and disallowing for work offline).

4. enter newly created `MY_NEW_AWESOME_SITE_NAME` directory
5. **[Highly recommended]:** Initialize [git](https://git-scm.com/) repository:
    1. `git init`
    2. create `.gitignore` (if missing) and add to it following content:

       ```
       **/_site
       **/.sass-cache
       **/.jekyll-cache
       **/.jekyll-metadata
       **/vendor
       ```
       {: filename=".gitignore"}

6. Create `vendor/bundle` directory in the website root
7. Create `docker-compose.yml` file in the website root with content similar to:

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

   The command in the services can be modified to your liking. `jekyll serve` starts a server, so that you can view your website. `jekyll build` would rebuild site without starting server.

8. Add appropriate entries to the `_config.yml` file (to exclude from being copied to the static site):

   ```yml
   exclude:
       - .sass-cache/
       - .jekyll-cache/
       - Gemfile
       - Gemfile.lock
       - vendor
       - docker-compose.yml
   ```
   {: filename="_config.yml"}

   Here you can update jekyll version beyond the one in the base jekyll image and add new plugins. To apply changes (download them etc.) you have to run the `Update gems` task from the next step. If you don't use VSCode you have to run command from that task manually.

9. **[Highly recommended]:** Add new **tasks** (in `.vscode/tasks.json`).

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

    The first task is used to update gems. [Second one](https://code.visualstudio.com/docs/containers/reference#_docker-compose-task) is used to start a jekyll server in compose when launching and attaching to chrome with VSCode debugger (via `F5` i.e. Run and Debug tab).

    I'm not certainly sure about the `bundle` parts in the `Update gems` task, but in my case gems didn't cache properly without it. This made it work (but also some other bloat was pulled from container into the `vendor/` directory)

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

    This allows you to start a chrome in debugger mode and place breakpoints straight in the VSCode. Here the `preLaunchTask` points to the corresponding task in the previous step.

    **IMPORTANT NOTES:**
    - Be patient. Docker has to start, jekyll has to start, jekyll has to generate files, Chrome has to start. Don't expect immediate results.
    - You can't debug sources in the main directory. Place breakpoints in the corresponding files inside `_site`, **NOT** your main sources.

**And that's it!** Now you can:

- Run your local jekyll installation with `docker compose up jekyll-server` straight from terminal...
- ...you can ALSO use <kbd>F5</kbd> in VSCode to start debugging...
- ...you can ALSO use `>Run Task > compose up jekyll` in the VSCode command palette...
- ...and if you have docker-containers extension for VS Code you can also run `>Run Task > Compose Up` from the command palette!
- attach to logs with `docker compose logs` when running compose in background (`--detached` flag).
- launch debugger chrome instance via task in VSCode using `F5` (or via bash script) and to update gems from step (9.) (by running tasks)
- stop containers with `docker compose down`
- check if containers are running with `docker compose ps` or in the VSCode docker tab

As a bonus I could recommend using [Frontmatter extension for VSCode](https://frontmatter.codes/) as a local CMS for the site. It works wonderfully well.

## How to revert if you get bored

1. Stop respective containers (check with `docker [compose] ps`) using `docker compose down`
2. Delete your website directory (are you sure though?)
3. Optionally clean your downloaded docker images with `docker rm <image>` or `docker prune` to delete all unused images
4. ...
5. Profit!

---

[^1]: you will have to install Docker though, but it a sin not to have it with how useful Docker is for all kinds of development.
