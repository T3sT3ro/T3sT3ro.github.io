---
title: Jekyll - local ruby installation + Docker = <3
description: How to start using Jekyll locally without pulling ruby bloat
date: 2022-11-02T09:15:23.457Z
preview: ""
tags:
  - docker
  - jekyll
lastmod: 2022-11-02T21:44:54.450Z
---

If this was you:

1. Wanted a blog on Github Pages
2. Learn about Jekyll
3. Check out how to install
4. Find out that it requires `ruby`, `gem`, `gcc`, and later `bundler` and other things
5. Remember, that you don't use ruby... ever? ...and don't want to install bloat into global scope of your PC
6. Find ruby package managers (`RVM`, `rbenv`) and install them
7. Notice your bash startup taking forever since adding initialization scripts to it for those two above
8. Try to startup... just for some gems to fail etc. etc. etc...
9. Give up OR sacrifice your newly born just to make THIS PIECE OF SH*T WORK

Then I have good news!

**This is a perfect opportunity for you learning Docker and using Jekyll hassle-free!**

## Why Docker?

Because if you decide you no longer want to use Jekyll or eventually move to some better static site generator, then YEETing everything out of your system is as simple as removing a container and purging image.

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

    The last one is particularly useful for gems to cache properly

4. enter newly created `MY_NEW_AWESOME_SITE_NAME` directory
5. *[recommended step] initialize [git](https://git-scm.com/) repository:

   1. `git init`
   2. create `.gitignore` (if missing) and add to it

      ```
      **/_site
      **/.sass-cache
      **/.jekyll-cache
      **/.jekyll-metadata
      **/vendor
      ```

6. Create `vendor/bundle` directory
7. Inside newly  create a `docker-compose.yml` file with content similar to:

    ```yml
    services:

      jekyll-server:
        image: jekyll/jekyll:4.2.2
        volumes:
          - .:/srv/jekyll:Z
          - ./vendor/bundle:/usr/local/bundle:Z # cache for offline work
        ports:
          - '[::1]:4000:4000'     # server port
          - '[::1]:35729:35729'   # livereload port
        command: jekyll serve --livereload

      bundle-update: 
        image: jekyll/jekyll:4.2.2
        volumes:
          - .:/srv/jekyll:Z
          - ./vendor/bundle:/usr/local/bundle:Z # mount to update gems cache
        command: bundle update # can be changed to bundle install
    ```

8. Add appropriate entries to the `_config.yml` file (to exclude from being copied to the static site):

    ```yml
    exclude:
      - Gemfile
      - Gemfile.lock
      - vendor
      - docker-compose.yml
    ```

9. And that's it! Now you can:
   - run your local jekyll installation with `docker compose up jekyll-server`. Use `-d` flag to start in background
   - attach to logs with `docker compose logs` when in background.
   - `docker compose up bundle-update` to update and install bundles.
   - stop with `docker compose down`

