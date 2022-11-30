---
title: Jekyll on Docker = ♥
date: 2022-11-02T09:15:23.457Z
tags: docker jekyll
lastmod: 2022-11-30T21:06:25.505Z
---

If this was you:

1. Wanted a blog on Github Pages
2. Discovered Jekyll
3. Got clobbered by the install instructions including installing `ruby`, `gem`, `gcc`, `bundler`
4. Recalled that you know nothing about ruby, gems, bundler etc. and decided that you don't want to install bloat
5. Discovered ruby package managers (`RVM`, `rbenv`) and failed miserably installing them, finding later out that suddenly your `.bashrc` is 2 seconds slower to load
6. Withstood the excruciating pain of realizing that your workstation gets messier and messier
7. Try to finally start a jekyll only to find that you installed gems to global scope, your lockfile failed, your gems didn't update etc

Then I have good news!

**You are in a perfect time and place to learn Docker+Jekyll!**

## Why Docker?

Because if you decide you no longer want to use Jekyll (or eventually move to some better static site generator), then YEETing everything out of your system is as simple as removing a container and purging the unused image.

Docker is also a great tool for tinkering — want to tinker for a bit with PyTorch? CUDA? Fortran? Redis? Elastic? `docker pull <anything>` will keep your system (mostly) clean.

## Guide with Docker

1. First, [install Docker](https://docs.docker.com/engine/install) if haven't done so already.
2. Pull jekyll image with `docker pull jekyll/jekyll:4.2.2` (use can use the :latest tag, but I recommend using one specific version like 4.2.2 for reproducibility)
3. Create new website by [following the respective guide on image's page](https://github.com/envygeeks/jekyll-docker/blob/master/README.md#quick-start-under-windows-cmd), something along the lines:

    ```bash
    docker run --rm \
        --volume="${PWD}:/srv/jekyll" \
        -it jekyll/jekyll \
        sh -c "chown -R jekyll /usr/gem/
            && jekyll new MY_NEW_AWESOME_SITE_NAME
            && bundle config set --local path 'vendor'"
    ```

    The last part with `bundle` is particularly useful for gems to cache properly and for you to be able to work offline.

4. enter newly created `MY_NEW_AWESOME_SITE_NAME` directory
5. **[recommended step]** initialize [git](https://git-scm.com/) repository:
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

6. Create `vendor/bundle` directory
7. Inside newly create a `docker-compose.yml` file with content similar to:

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
            command: jekyll serve # run jekyll server
            # ↑ --drafts --livereload --incremental   you can add optional arguments
    ```
    {: filename="docker-compose.yml"}

8. Add appropriate entries to the `_config.yml` file (to exclude from being copied to the static site):

   ```yml
   exclude:
       - Gemfile
       - Gemfile.lock
       - vendor
       - docker-compose.yml
   ```
   {: filename="_config.yml"}

9. Create a vscode task (in `.vscode/tasks.json`) to update gems:

   ```json
   {
       "label": "Update gems",
       "type": "shell",
       "command": "docker compose run jekyll-server bash -c
           'bundle config unset deployment
           && bundle update
           && bundle install --deployment'",
   }
   ```
   {: filename=".vscode/tasks.json"}

10. And to enable debugging in compose app (VSCode + chrome)... idk for now :P

I'm not certainly sure about the above command, but in my case gems didn't cache properly, unfortunately

2. And that's it! Now you can:

    - run your local jekyll installation with `docker compose up jekyll-server`.
    - attach to logs with `docker compose logs` when in background.
    - launch task in VSCode (or via bash script) to update gems from step (9.)
    - stop with `docker compose down`
