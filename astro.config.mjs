import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/** @import {} */
import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";

// https://astro.build/config
export default defineConfig({
  site: 'https://T3sT3ro.github.io',
  integrations: [mdx(), sitemap({
    lastmod: new Date()
  }), sentry(), spotlightjs()],
  prefetch: true,
  devToolbar: {
    enabled: true
  },
  experimental: {
    contentCollectionCache: true
  }
});