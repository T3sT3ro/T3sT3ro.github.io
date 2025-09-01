#!/usr/bin/env deno run --allow-net --allow-read

/**
 * Simple HTTP server for serving static files
 * Supports Chrome DevTools debugging via --inspect flag
 */

import { serveDir } from "@std/http/file-server";

const port = 8000;

console.log(`🚀 Starting development server on http://localhost:${port}`);
console.log(`📁 Serving files from: ${Deno.cwd()}`);

if (Deno.args.includes("--debug")) {
  console.log(`🐛 Debug mode enabled. Open Chrome DevTools at: chrome://inspect`);
}

Deno.serve({ port }, (req) => {
  return serveDir(req, {
    fsRoot: ".",
  });
});
