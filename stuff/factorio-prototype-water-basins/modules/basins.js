// Basin computation and management

import { CONFIG } from './config.js';

// Generate letter sequence: a, b, c, ..., z, aa, ab, ac, ...
function generateLetterSequence(index) {
    let result = '';
    let num = index;
    
    do {
        result = String.fromCharCode(65 + (num % 26)) + result;
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
        
        // First pass: identify all potential basin tiles and their connectivity
        const basinsByLevel = new Map();
        const tileToBasin = new Map(); // Maps "x,y" to basin data
        
        for (let y = 0; y < CONFIG.WORLD_H; y++) {
            for (let x = 0; x < CONFIG.WORLD_W; x++) {
                if (visited[y][x]) continue;
                const height = heights[y][x];
                
                // Skip depth 0 (land/surface) - no basins on land
                if (height === 0) {
                    visited[y][x] = true;
                    continue;
                }
                
                // Flood fill to find all connected tiles at the current depth
                const tiles = new Set();
                const stack = [[x, y]];
                while (stack.length) {
                    const [cx, cy] = stack.pop();
                    if (cx < 0 || cy < 0 || cx >= CONFIG.WORLD_W || cy >= CONFIG.WORLD_H) continue;
                    if (visited[cy][cx]) continue;
                    if (heights[cy][cx] !== height) continue; // Only same depth for this basin
                    visited[cy][cx] = true;
                    tiles.add(cx + "," + cy);
                    
                    // Check all 8 directions (4 cardinal + 4 diagonal)
                    const directions = [
                        [1, 0], [-1, 0], [0, 1], [0, -1], // Cardinal directions
                        [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal directions
                    ];
                    
                    directions.forEach(([dx, dy]) => {
                        const nx = cx + dx, ny = cy + dy;
                        if (nx < 0 || ny < 0 || nx >= CONFIG.WORLD_W || ny >= CONFIG.WORLD_H) return;
                        if (visited[ny][nx]) return;
                        if (heights[ny][nx] !== height) return; // Only same depth connections
                        
                        // For diagonal connections, check if the diagonal crossing is blocked by land
                        const isDiagonal = Math.abs(dx) + Math.abs(dy) === 2;
                        if (isDiagonal) {
                            // Check the two orthogonal neighbors that form the "crossing"
                            const cross1x = cx + dx, cross1y = cy;
                            const cross2x = cx, cross2y = cy + dy;
                            
                            // If both crossing tiles are within bounds, check for land blocking
                            if (cross1x >= 0 && cross1x < CONFIG.WORLD_W && cross1y >= 0 && cross1y < CONFIG.WORLD_H &&
                                cross2x >= 0 && cross2x < CONFIG.WORLD_W && cross2y >= 0 && cross2y < CONFIG.WORLD_H) {
                                const cross1IsLand = heights[cross1y][cross1x] === 0;
                                const cross2IsLand = heights[cross2y][cross2x] === 0;
                                
                                // Block diagonal if both crossing tiles are land (complete blockage)
                                if (cross1IsLand && cross2IsLand) return;
                            }
                        }
                        
                        stack.push([nx, ny]);
                    });
                }
                
                // Only create basins for water tiles (depth > 0)
                if (tiles.size > 0 && height > 0) {
                    const basinData = { tiles, height, outlets: new Set() };
                    
                    // Group by height level
                    if (!basinsByLevel.has(height)) {
                        basinsByLevel.set(height, []);
                    }
                    basinsByLevel.get(height).push(basinData);
                    
                    // Map each tile to this basin
                    tiles.forEach(tileKey => {
                        tileToBasin.set(tileKey, basinData);
                    });
                }
            }
        }
        
        // Second pass: find outlets for each basin (connections to lower depth basins)
        basinsByLevel.forEach((basinsAtLevel, currentDepth) => {
            basinsAtLevel.forEach(basin => {
                basin.tiles.forEach(tileKey => {
                    const [tx, ty] = tileKey.split(',').map(Number);
                    
                    // Check all 8 directions for outlet connections to lower depths
                    const directions = [
                        [1, 0], [-1, 0], [0, 1], [0, -1], // Cardinal directions
                        [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal directions
                    ];
                    
                    directions.forEach(([dx, dy]) => {
                        const nx = tx + dx, ny = ty + dy;
                        if (nx < 0 || ny < 0 || nx >= CONFIG.WORLD_W || ny >= CONFIG.WORLD_H) return;
                        
                        const neighborHeight = heights[ny][nx];
                        const neighborKey = nx + "," + ny;
                        
                        // Check if neighbor is a lower depth basin (potential outlet)
                        if (neighborHeight > 0 && neighborHeight < currentDepth && tileToBasin.has(neighborKey)) {
                            const neighborBasin = tileToBasin.get(neighborKey);
                            basin.outlets.add(neighborBasin);
                        }
                    });
                });
            });
        });
        
        // First pass: Assign IDs to all basins and create a mapping from basin data to ID
        const basinDataToId = new Map();
        
        basinsByLevel.forEach((basinsAtLevel, level) => {
            basinsAtLevel.forEach((basinData, index) => {
                const letters = generateLetterSequence(index);
                const id = `${level}#${letters}`;
                
                // Map the basin data to its ID
                basinDataToId.set(basinData, id);
                
                // Create the basin entry (outlets will be filled in second pass)
                this.basins.set(id, { 
                    tiles: basinData.tiles, 
                    volume: 0, 
                    level: 0, 
                    height: level,
                    outlets: [] // Will be filled in next pass
                });
                
                // Map tiles to basin ID
                basinData.tiles.forEach(k => {
                    const [tx, ty] = k.split(',').map(Number);
                    this.basinIdOf[ty][tx] = id;
                });
            });
        });
        
        // Second pass: Fill in outlet IDs now that all basin IDs are assigned
        basinsByLevel.forEach((basinsAtLevel, level) => {
            basinsAtLevel.forEach((basinData, index) => {
                const basinId = basinDataToId.get(basinData);
                const basin = this.basins.get(basinId);
                
                basin.outlets = Array.from(basinData.outlets).map(outletBasin => {
                    return basinDataToId.get(outletBasin);
                }).filter(id => id); // Filter out any undefined IDs
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
        // First, handle water overflow from higher to lower basins
        this.handleWaterOverflow();
        
        // Then update individual basin levels
        this.basins.forEach(basin => {
            const capacityPerLevel = basin.tiles.size * CONFIG.VOLUME_UNIT;
            basin.level = Math.floor(basin.volume / capacityPerLevel);
            if (basin.level < 0) basin.level = 0;
            if (basin.level > CONFIG.MAX_DEPTH) basin.level = CONFIG.MAX_DEPTH;
        });
    }
    
    handleWaterOverflow() {
        // Process basins from deepest to shallowest to handle overflow cascade
        const sortedBasins = Array.from(this.basins.entries()).sort((a, b) => b[1].height - a[1].height);
        
        sortedBasins.forEach(([basinId, basin]) => {
            if (!basin.outlets || basin.outlets.length === 0) return;
            
            const maxCapacity = basin.tiles.size * CONFIG.VOLUME_UNIT * CONFIG.MAX_DEPTH;
            if (basin.volume > maxCapacity) {
                // This basin is overflowing
                const overflow = basin.volume - maxCapacity;
                basin.volume = maxCapacity;
                
                // Distribute overflow to outlet basins
                const outletCount = basin.outlets.length;
                const overflowPerOutlet = overflow / outletCount;
                
                basin.outlets.forEach(outletId => {
                    const outletBasin = this.basins.get(outletId);
                    if (outletBasin) {
                        outletBasin.volume += overflowPerOutlet;
                    }
                });
            }
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
    getDebugInfo(heights) {
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
                // Check all 8 directions for connections
                const directions = [
                    [1, 0], [-1, 0], [0, 1], [0, -1], // Cardinal directions
                    [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal directions
                ];
                
                directions.forEach(([dx, dy]) => {
                    const nx = tx + dx, ny = ty + dy;
                    if (nx >= 0 && ny >= 0 && nx < CONFIG.WORLD_W && ny < CONFIG.WORLD_H) {
                        const neighborBasinId = this.basinIdOf[ny][nx];
                        if (neighborBasinId && neighborBasinId !== id) {
                            // For diagonal connections, check if the diagonal crossing is blocked
                            const isDiagonal = Math.abs(dx) + Math.abs(dy) === 2;
                            if (isDiagonal && heights) {
                                // Check the two orthogonal neighbors that form the "crossing"
                                const cross1x = tx + dx, cross1y = ty;
                                const cross2x = tx, cross2y = ty + dy;
                                
                                // Check for land blocking the diagonal
                                if (cross1x >= 0 && cross1x < CONFIG.WORLD_W && cross1y >= 0 && cross1y < CONFIG.WORLD_H &&
                                    cross2x >= 0 && cross2x < CONFIG.WORLD_W && cross2y >= 0 && cross2y < CONFIG.WORLD_H) {
                                    const cross1IsLand = heights[cross1y][cross1x] === 0;
                                    const cross2IsLand = heights[cross2y][cross2x] === 0;
                                    
                                    // Block diagonal if both crossing tiles are land (complete blockage)
                                    if (cross1IsLand && cross2IsLand) return;
                                }
                            }
                            
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
