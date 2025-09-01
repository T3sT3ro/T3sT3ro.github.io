#!/usr/bin/env node
/**
 * Cache busting utility - updates the version in index.html
 * Run this when you make changes to JavaScript modules to force browser reload
 */

import fs from 'fs';
import path from 'path';

const indexPath = path.join(process.cwd(), 'index.html');

try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Find the current version
    const versionMatch = content.match(/window\.moduleVersion = '(\d+\.\d+\.\d+)';/);
    
    if (versionMatch) {
        const currentVersion = versionMatch[1];
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        const newVersion = `${major}.${minor}.${patch + 1}`;
        
        content = content.replace(
            /window\.moduleVersion = '\d+\.\d+\.\d+';/,
            `window.moduleVersion = '${newVersion}';`
        );
        
        fs.writeFileSync(indexPath, content);
        console.log(`🔄 Cache version updated: ${currentVersion} → ${newVersion}`);
    } else {
        console.log('❌ Could not find moduleVersion in index.html');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error updating cache version:', error.message);
    process.exit(1);
}
