// Basin computation and management

import { CONFIG } from './config.js';

// Generate letter sequence: a, b, c, ..., z, aa, ab, ac, ...
function generateLetterSequence(index) {
    let result = '';
    let num = index;
    
    do {
        result = String.fromCharCode(97 + (num % 26)) + result;
        num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    
    return result;
}

export class BasinManager {
    constructor() {
        this.basins = new Map(); // id -> {tiles: Set of 'x,y', volume, level}
        this.basinIdOf = new Array(CONFIG.WORLD_H);
        for (let y = 0; y < CONFIG.WORLD_H; y++) {
            this.basinIdOf[y] = new Array(CONFIG.WORLD_W).fill(0);
        }
        this.nextBasinId = 1;
        this.highlightedBasin = null; // For basin highlighting on map
    }

    computeBasins(heights) {
        // Clear existing basin data
        this.basinIdOf.forEach(row => row.fill(0));
        this.basins.clear();
        this.nextBasinId = 1;
        
        const visited = new Array(CONFIG.WORLD_H);
        for (let y = 0; y < CONFIG.WORLD_H; y++) { 
            visited[y] = new Array(CONFIG.WORLD_W).fill(false); 
        }
        
        // Group basins by height level
        const basinsByLevel = new Map();
        
        for (let y = 0; y < CONFIG.WORLD_H; y++) {
            for (let x = 0; x < CONFIG.WORLD_W; x++) {
                if (visited[y][x]) continue;
                const height = heights[y][x];
                
                // Skip depth 0 (land/surface) - no basins on land
                if (height === 0) {
                    visited[y][x] = true;
                    continue;
                }
                
                const tiles = new Set();
                const stack = [[x, y]];
                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    if (cx < 0 || cy < 0 || cx >= CONFIG.WORLD_W || cy >= CONFIG.WORLD_H) continue;
                    if (visited[cy][cx]) continue;
                    if (heights[cy][cx] === 0) continue; // Skip land tiles in flood fill too
                    visited[cy][cx] = true;
                    tiles.add(cx + "," + cy);
                    const h = heights[cy][cx];
                    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                        const nx = cx + dx, ny = cy + dy;
                        if (nx < 0 || ny < 0 || nx >= CONFIG.WORLD_W || ny >= CONFIG.WORLD_H) return;
                        if (visited[ny][nx]) return;
                        if (heights[ny][nx] <= h && heights[ny][nx] > 0) stack.push([nx, ny]); // Only add water tiles
                    });
                }
                
                // Only create basins for water tiles (depth > 0)
                if (tiles.size > 0 && height > 0) {
                    // Group by height level
                    if (!basinsByLevel.has(height)) {
                        basinsByLevel.set(height, []);
                    }
                    basinsByLevel.get(height).push({ tiles, height });
                }
            }
        }
        
        // Assign IDs in format level#letters
        basinsByLevel.forEach((basinsAtLevel, level) => {
            basinsAtLevel.forEach((basinData, index) => {
                const letters = generateLetterSequence(index);
                const id = `${level}#${letters}`;
                this.basins.set(id, { 
                    tiles: basinData.tiles, 
                    volume: 0, 
                    level: 0, 
                    height: level 
                });
                basinData.tiles.forEach(k => {
                    const [tx, ty] = k.split(',').map(Number);
                    this.basinIdOf[ty][tx] = id;
                });
            });
        });
    }

    getBasinAt(x, y) {
        if (x < 0 || y < 0 || x >= CONFIG.WORLD_W || y >= CONFIG.WORLD_H) return null;
        const basinId = this.basinIdOf[y][x];
        return basinId ? this.basins.get(basinId) : null;
    }

    getBasinIdAt(x, y) {
        if (x < 0 || y < 0 || x >= CONFIG.WORLD_W || y >= CONFIG.WORLD_H) return null;
        return this.basinIdOf[y][x] || null;
    }

    floodFill(startX, startY, fillWithWater) {
        const startBasinId = this.basinIdOf[startY][startX];
        if (!startBasinId) return;
        
        const basin = this.basins.get(startBasinId);
        if (!basin) return;
        
        if (fillWithWater) {
            // Fill with maximum water
            basin.volume = basin.tiles.size * CONFIG.VOLUME_UNIT * CONFIG.MAX_DEPTH;
        } else {
            // Empty all water
            basin.volume = 0;
        }
        
        // Update water levels immediately
        this.updateWaterLevels();
    }

    updateWaterLevels() {
        this.basins.forEach(basin => {
            const capacityPerLevel = basin.tiles.size * CONFIG.VOLUME_UNIT;
            basin.level = Math.floor(basin.volume / capacityPerLevel);
            if (basin.level < 0) basin.level = 0;
            if (basin.level > CONFIG.MAX_DEPTH) basin.level = CONFIG.MAX_DEPTH;
        });
    }

    clearAllWater() {
        this.basins.forEach(basin => {
            basin.volume = 0;
            basin.level = 0;
        });
    }

    setHighlightedBasin(basinId) {
        this.highlightedBasin = basinId;
    }

    getHighlightedBasin() {
        return this.highlightedBasin;
    }

    // Get debug information about basins
    getDebugInfo() {
        const connections = new Map();
        const basinArray = Array.from(this.basins.entries()).sort((a, b) => {
            // Sort by level first, then by letter sequence
            const [levelA, lettersA] = a[0].split('#');
            const [levelB, lettersB] = b[0].split('#');
            if (levelA !== levelB) return parseInt(levelA) - parseInt(levelB);
            return lettersA.localeCompare(lettersB);
        });
        
        // Build connection graph
        basinArray.forEach(([id, basin]) => {
            connections.set(id, new Set());
            basin.tiles.forEach(tileKey => {
                const [tx, ty] = tileKey.split(',').map(Number);
                // Check neighbors for connections
                [[tx-1, ty], [tx+1, ty], [tx, ty-1], [tx, ty+1]].forEach(([nx, ny]) => {
                    if (nx >= 0 && ny >= 0 && nx < CONFIG.WORLD_W && ny < CONFIG.WORLD_H) {
                        const neighborBasinId = this.basinIdOf[ny][nx];
                        if (neighborBasinId && neighborBasinId !== id) {
                            connections.get(id).add(neighborBasinId);
                        }
                    }
                });
            });
        });
        
        // Calculate statistics
        const basinCount = this.basins.size;
        const maxDepth = basinArray.length > 0 ? 
            Math.max(...basinArray.map(([id]) => parseInt(id.split('#')[0]))) : 0;
        
        let maxDegree = 0;
        connections.forEach((connectionSet) => {
            maxDegree = Math.max(maxDegree, connectionSet.size);
        });
        
        return {
            basinCount,
            maxDepth,
            maxDegree,
            basinArray,
            connections
        };
    }
}
