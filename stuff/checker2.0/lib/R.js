/**
 * Reads files from the `resources` directory of the module
 * such as `man.yaml`, `defaultConfig.yaml`
 */
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 
 * @param {path} resourcePath this package's resource to load
 * @returns promise of UTF-8 read file
 */
export default function (resourcePath) {
    return resolve(__dirname, resourcePath);
}