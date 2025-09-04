// Basin computation and management

import { CONFIG } from "./config.js";
import { UI_CONSTANTS } from "./constants.js";

// Generate letter sequence: a, b, c, ..., z, aa, ab, ac, ...
function generateLetterSequence(index) {
  let result = "";
  let num = index;

  do {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return result;
}

// Bucket-based priority queue for depth-ordered processing
class DepthPriorityQueue {
  constructor() {
    this.buckets = new Map();
    this.maxDepth = -1;
  }

  push(item) {
    const depth = item.depth;
    if (!this.buckets.has(depth)) {
      this.buckets.set(depth, []);
    }
    this.buckets.get(depth).push(item);
    this.maxDepth = Math.max(this.maxDepth, depth);
  }

  pop() {
    while (this.maxDepth >= 0) {
      const bucket = this.buckets.get(this.maxDepth);
      if (bucket && bucket.length > 0) {
        return bucket.pop();
      }
      this.maxDepth--;
    }
    return undefined;
  }

  get length() {
    let total = 0;
    for (const bucket of this.buckets.values()) {
      total += bucket.length;
    }
    return total;
  }
}

export class BasinManager {
  constructor() {
    this.basins = new Map(); // id -> {volume, level, height, outlets, parent, tileCount}
    this.basinIdOf = new Array(CONFIG.WORLD_H);
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      this.basinIdOf[y] = new Array(CONFIG.WORLD_W).fill(0);
    }
    this.nextBasinId = 1;
    this.highlightedBasin = null;
    
    // Optimization state
    this.lastHeights = null;
    
    // Debug state and generator
    this.basinGenerator = null;
    this.debugState = {
      enabled: false,
      stepByStep: false,
      stage: UI_CONSTANTS?.DEBUG?.STAGES?.UNINITIALIZED || 'uninitialized',
      currentStep: 0,
      visitedTiles: new Set(),
      queueTiles: new Set(),
      currentTile: null,
      currentBasinTiles: new Set(),
      currentBasinId: null,
      onStepCallback: null,
    };
  }

  // Get all tiles that belong to a specific basin
  getBasinTiles(basinId) {
    const tiles = [];
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        if (this.basinIdOf[y][x] === basinId) {
          tiles.push(`${x},${y}`);
        }
      }
    }
    return tiles;
  }

  // Get tile count for a specific basin
  getBasinTileCount(basinId) {
    const basin = this.basins.get(basinId);
    return basin ? basin.tileCount : 0;
  }

  // Update tile count for a basin (called during basin creation)
  updateBasinTileCount(basinId, count) {
    const basin = this.basins.get(basinId);
    if (basin) {
      basin.tileCount = count;
    }
  }

  computeBasins(heights, options = {}) {
    const { stepByStep = this.debugState.stepByStep } = options;
    
    performance.mark("basin-computation-start");

    // Check if we can skip computation
    const changedTiles = this.detectChangedTiles(heights);
    if (changedTiles.size === 0 && this.lastHeights !== null) {
      performance.mark("basin-computation-end");
      performance.measure("Total Basin Computation", "basin-computation-start", "basin-computation-end");
      return;
    }

    // Clear existing data
    this.basinIdOf.forEach(row => row.fill(0));
    this.basins.clear();
    this.nextBasinId = 1;

    if (stepByStep) {
      // Run as generator for step-by-step debugging
      this.basinGenerator = this.computeBasinsGenerator(heights);
      const firstStep = this.basinGenerator.next();
      if (firstStep.done) this.basinGenerator = null;
    } else {
      // Run synchronously
      this.runBasinComputation(heights);
    }

    // Store current heights for next comparison
    this.lastHeights = heights.map(row => [...row]);

    performance.mark("basin-computation-end");
    performance.measure("Total Basin Computation", "basin-computation-start", "basin-computation-end");
    
    // Log performance info
    const measures = performance.getEntriesByType("measure");
    const lastMeasure = measures[measures.length - 1];
    console.log(
      `        └─ Basin Computation (${changedTiles.size} changed tiles, ${this.basins.size} basins): ${lastMeasure.duration.toFixed(2)}ms`
    );
  }

  detectChangedTiles(heights) {
    const changed = new Set();
    
    if (!this.lastHeights) {
      // First run - everything is "changed"
      for (let y = 0; y < CONFIG.WORLD_H; y++) {
        for (let x = 0; x < CONFIG.WORLD_W; x++) {
          if (heights[y][x] > 0) {
            changed.add(`${x},${y}`);
          }
        }
      }
      return changed;
    }

    // Find actually changed tiles
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        if (heights[y][x] !== this.lastHeights[y][x]) {
          changed.add(`${x},${y}`);
        }
      }
    }

    return changed;
  }

  *computeBasinsGenerator(heights) {
    this.resetDebugState();
    this.debugState.stage = UI_CONSTANTS.DEBUG.STAGES.INITIALIZING;
    
    if (this.debugState.onStepCallback) {
      this.debugState.onStepCallback(this.getDebugState());
    }
    yield { type: UI_CONSTANTS.DEBUG.YIELD_TYPES.STAGE, data: UI_CONSTANTS.DEBUG.STAGES.INITIALIZING };

    // Build priority queue
    const queue = this.buildPriorityQueue(heights);
    this.debugState.stage = UI_CONSTANTS.DEBUG.STAGES.PROCESSING_TILES;
    
    if (this.debugState.onStepCallback) {
      this.debugState.onStepCallback(this.getDebugState());
    }
    yield { type: UI_CONSTANTS.DEBUG.YIELD_TYPES.STAGE, data: UI_CONSTANTS.DEBUG.STAGES.PROCESSING_TILES };

    // Process tiles and build basins
    const visited = new Set();
    const basinNodes = new Map(); // basinId -> { basin, parent }

    while (queue.length > 0) {
      const { x, y, depth } = queue.pop();
      const tileKey = `${x},${y}`;
      
      if (visited.has(tileKey)) continue;

      // Build basin from this starting point
      yield* this.buildBasinGenerator(x, y, depth, heights, visited, basinNodes);
    }

    // Finalize basins
    this.debugState.stage = UI_CONSTANTS.DEBUG.STAGES.FINALIZING;
    if (this.debugState.onStepCallback) {
      this.debugState.onStepCallback(this.getDebugState());
    }
    yield { type: UI_CONSTANTS.DEBUG.YIELD_TYPES.STAGE, data: UI_CONSTANTS.DEBUG.STAGES.FINALIZING };

    this.finalizeBasins(basinNodes);

    this.debugState.stage = UI_CONSTANTS.DEBUG.STAGES.COMPLETED;
    if (this.debugState.onStepCallback) {
      this.debugState.onStepCallback(this.getDebugState());
    }
    yield { type: UI_CONSTANTS.DEBUG.YIELD_TYPES.STAGE, data: UI_CONSTANTS.DEBUG.STAGES.COMPLETED };
  }

  runBasinComputation(heights) {
    // Synchronous version - no yields
    const queue = this.buildPriorityQueue(heights);
    const visited = new Set();
    const basinNodes = new Map();

    while (queue.length > 0) {
      const { x, y, depth } = queue.pop();
      const tileKey = `${x},${y}`;
      
      if (visited.has(tileKey)) continue;
      this.buildBasin(x, y, depth, heights, visited, basinNodes);
    }

    this.finalizeBasins(basinNodes);
  }

  buildPriorityQueue(heights) {
    const queue = new DepthPriorityQueue();
    
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        const depth = heights[y][x];
        if (depth > 0) {
          queue.push({ x, y, depth });
        }
      }
    }

    // Update debug visualization
    if (this.debugState.enabled) {
      this.updateDebugQueueVisualization(queue);
    }

    return queue;
  }

  buildBasin(startX, startY, depth, heights, visited, basinNodes) {
    const basinId = this.nextBasinId++;
    const tiles = new Set();
    const queue = [[startX, startY]];
    const tileKey = `${startX},${startY}`;
    
    if (visited.has(tileKey)) return;
    
    visited.add(tileKey);
    tiles.add(tileKey);
    this.basinIdOf[startY][startX] = basinId;

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      
      for (const [dx, dy] of CONFIG.BASIN_COMPUTATION.DIRECTIONS.ALL) {
        const nx = x + dx;
        const ny = y + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (!this.isValidTile(nx, ny) || visited.has(neighborKey)) continue;
        if (heights[ny][nx] !== depth) continue;
        if (!this.isDiagonalValid(x, y, nx, ny, heights)) continue;
        
        visited.add(neighborKey);
        tiles.add(neighborKey);
        this.basinIdOf[ny][nx] = basinId;
        queue.push([nx, ny]);
      }
    }

    // Create basin
    const basin = this.createBasin(tiles, depth);
    this.basins.set(basinId, basin);
    
    // Store in nodes structure for parent-child relationships
    basinNodes.set(basinId, { basin, parent: null });
  }

  *buildBasinGenerator(startX, startY, depth, heights, visited, basinNodes) {
    const basinId = this.nextBasinId++;
    const tiles = new Set();
    const queue = [[startX, startY]];
    const tileKey = `${startX},${startY}`;
    
    if (visited.has(tileKey)) return;
    
    // Initialize debug state
    this.debugState.currentBasinId = basinId;
    this.debugState.currentBasinTiles.clear();
    this.debugState.visitedTiles.add(tileKey);
    this.debugState.currentBasinTiles.add(tileKey);
    
    visited.add(tileKey);
    tiles.add(tileKey);
    this.basinIdOf[startY][startX] = basinId;

    if (this.debugState.onStepCallback) {
      this.debugState.onStepCallback(this.getDebugState());
    }
    yield { 
      type: UI_CONSTANTS.DEBUG.YIELD_TYPES.BASIN_START, 
      data: { basinId, startX, startY, depth, currentTile: tileKey } 
    };

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      this.debugState.currentTile = `${x},${y}`;
      this.debugState.currentStep++;
      
      for (const [dx, dy] of CONFIG.BASIN_COMPUTATION.DIRECTIONS.ALL) {
        const nx = x + dx;
        const ny = y + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (!this.isValidTile(nx, ny) || visited.has(neighborKey)) continue;
        if (heights[ny][nx] !== depth) continue;
        if (!this.isDiagonalValid(x, y, nx, ny, heights)) continue;
        
        visited.add(neighborKey);
        tiles.add(neighborKey);
        this.basinIdOf[ny][nx] = basinId;
        queue.push([nx, ny]);

        this.debugState.visitedTiles.add(neighborKey);
        this.debugState.currentBasinTiles.add(neighborKey);
      }

      // Yield after processing each tile
      if (this.debugState.onStepCallback) {
        this.debugState.onStepCallback(this.getDebugState());
      }
      yield { 
        type: UI_CONSTANTS.DEBUG.YIELD_TYPES.TILE_PROCESSED, 
        data: { 
          basinId, 
          currentTile: `${x},${y}`, 
          queueSize: queue.length, 
          basinSize: tiles.size 
        } 
      };
    }

    // Create basin
    const basin = this.createBasin(tiles, depth);
    this.basins.set(basinId, basin);
    basinNodes.set(basinId, { basin, parent: null });

    yield { 
      type: UI_CONSTANTS.DEBUG.YIELD_TYPES.BASIN_COMPLETED, 
      data: { basinId, tiles: tiles.size } 
    };
  }

  // Helper methods
  isValidTile(x, y) {
    return x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H;
  }

  createBasin(tiles, depth) {
    return {
      volume: 0,
      level: 0,
      height: depth,
      outlets: [],
      parent: null,
      tileCount: tiles.size || tiles.length || 0
    };
  }

  finalizeBasins(basinNodes) {
    // Convert numeric IDs to depth#letter format and establish parent relationships
    const basinIdMap = new Map();
    const depthGroups = new Map();
    
    // Group basins by depth
    for (const [oldId, { basin }] of basinNodes) {
      const depth = basin.height;
      if (!depthGroups.has(depth)) {
        depthGroups.set(depth, []);
      }
      depthGroups.get(depth).push({ oldId, basin });
    }
    
    // Assign new IDs and find outlets/parents
    const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => a - b);
    
    for (const depth of sortedDepths) {
      const basinsAtDepth = depthGroups.get(depth);
      let letterIndex = 0;
      
      for (const { oldId, basin } of basinsAtDepth) {
        const letters = generateLetterSequence(letterIndex++);
        const newBasinId = `${depth}#${letters}`;
        
        basinIdMap.set(oldId, newBasinId);
        
        // Update basin in main map
        this.basins.delete(oldId);
        this.basins.set(newBasinId, basin);
        
        // Update basinIdOf array - find all tiles that belong to this basin
        for (let y = 0; y < CONFIG.WORLD_H; y++) {
          for (let x = 0; x < CONFIG.WORLD_W; x++) {
            if (this.basinIdOf[y][x] === oldId) {
              this.basinIdOf[y][x] = newBasinId;
            }
          }
        }
        
        // Find outlets (connections to shallower basins)
        this.findBasinOutlets(newBasinId, basin);
      }
    }
    
    // Update outlet references to use new IDs
    for (const basin of this.basins.values()) {
      basin.outlets = basin.outlets
        .map(oldId => basinIdMap.get(oldId) || oldId)
        .filter(id => this.basins.has(id));
    }
  }

  findBasinOutlets(basinId, basin) {
    const outlets = new Set();
    
    const basinTiles = this.getBasinTiles(basinId);
    for (const tileKey of basinTiles) {
      const [tx, ty] = tileKey.split(',').map(Number);
      
      for (const [dx, dy] of CONFIG.BASIN_COMPUTATION.DIRECTIONS.ALL) {
        const nx = tx + dx;
        const ny = ty + dy;
        
        if (!this.isValidTile(nx, ny)) continue;
        
        const neighborBasinId = this.basinIdOf[ny][nx];
        if (!neighborBasinId) continue;
        
        const neighborBasin = this.basins.get(neighborBasinId);
        if (neighborBasin && neighborBasin.height < basin.height) {
          outlets.add(neighborBasinId);
        }
      }
    }
    
    basin.outlets = Array.from(outlets);
  }

  isDiagonalValid(x1, y1, x2, y2, heights) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (Math.abs(dx) + Math.abs(dy) !== 2) return true; // Not diagonal

    // Check the two orthogonal neighbors that form the "crossing"
    const cross1x = x1 + dx, cross1y = y1;
    const cross2x = x1, cross2y = y1 + dy;

    // If both crossing tiles are within bounds, check for land blocking
    if (this.isValidTile(cross1x, cross1y) && this.isValidTile(cross2x, cross2y)) {
      const cross1IsLand = heights[cross1y][cross1x] === 0;
      const cross2IsLand = heights[cross2y][cross2x] === 0;

      // Block diagonal if both crossing tiles are land (complete blockage)
      return !(cross1IsLand && cross2IsLand);
    }

    return true;
  }

  updateDebugQueueVisualization(queue) {
    this.debugState.queueTiles.clear();
    // Get current items in queue (limited for visualization)
    const items = [];
    const tempQueue = [];
    let count = 0;
    while (queue.length > 0 && count < UI_CONSTANTS.DEBUG.MAX_QUEUE_VISUALIZATION) {
      const item = queue.pop();
      items.push(item);
      tempQueue.push(item);
      count++;
    }
    // Restore queue
    tempQueue.forEach(item => queue.push(item));
    
    // Add to visualization
    items.forEach(({ x, y }) => {
      this.debugState.queueTiles.add(`${x},${y}`);
    });
  }

  // Debug control methods
  enableStepByStepDebug(enabled, onStepCallback = null) {
    this.debugState.enabled = enabled;
    this.debugState.stepByStep = enabled;
    this.debugState.onStepCallback = onStepCallback;
    this.resetDebugState();
  }

  resetDebugState() {
    this.debugState.currentStep = 0;
    this.debugState.visitedTiles.clear();
    this.debugState.queueTiles.clear();
    this.debugState.currentTile = null;
    this.debugState.currentBasinTiles.clear();
    this.debugState.currentBasinId = null;
    this.debugState.stage = UI_CONSTANTS.DEBUG.STAGES.UNINITIALIZED;
    this.basinGenerator = null;
  }

  stepDebug() {
    if (!this.debugState.stepByStep) return false;
    
    // If we have an active generator, continue with it
    if (this.basinGenerator) {
      const result = this.basinGenerator.next();
      
      if (result.done) {
        // Generator is complete, clean up
        this.basinGenerator = null;
        return false;
      }
      
      // Generator yielded some debug data
      return true;
    }
    
    return false;
  }

  getDebugState() {
    return {
      enabled: this.debugState.enabled,
      stepByStep: this.debugState.stepByStep,
      stage: this.debugState.stage,
      currentStep: this.debugState.currentStep,
      visitedTiles: this.debugState.visitedTiles,
      queueTiles: this.debugState.queueTiles,
      currentTile: this.debugState.currentTile,
      currentBasinTiles: this.debugState.currentBasinTiles,
      currentBasinId: this.debugState.currentBasinId,
      queueSize: this.debugState.queueTiles.size,
      visitedSize: this.debugState.visitedTiles.size,
      bucketsUsed: 0,
      currentDepth: this.debugState.currentTile ? 
        this.debugState.heights?.[this.debugState.currentTile.split(',')[1]]?.[this.debugState.currentTile.split(',')[0]] || -1 : -1,
    };
  }

  // Basin management methods (rest of the API)
  getBasinAt(x, y) {
    if (!this.isValidTile(x, y)) return null;
    const basinId = this.basinIdOf[y][x];
    return basinId ? this.basins.get(basinId) : null;
  }

  getBasinIdAt(x, y) {
    if (!this.isValidTile(x, y)) return null;
    return this.basinIdOf[y][x] || null;
  }

  floodFill(startX, startY, fillWithWater) {
    const startBasinId = this.basinIdOf[startY][startX];
    if (!startBasinId) return;

    const basin = this.basins.get(startBasinId);
    if (!basin) return;

    if (fillWithWater) {
      basin.volume = basin.tileCount * CONFIG.VOLUME_UNIT * CONFIG.MAX_DEPTH;
    } else {
      basin.volume = 0;
    }

    this.updateWaterLevels();
  }

  updateWaterLevels() {
    this.handleWaterOverflow();

    this.basins.forEach((basin) => {
      const capacityPerLevel = basin.tileCount * CONFIG.VOLUME_UNIT;
      basin.level = Math.floor(basin.volume / capacityPerLevel);
      if (basin.level < 0) basin.level = 0;
      if (basin.level > CONFIG.MAX_DEPTH) basin.level = CONFIG.MAX_DEPTH;
    });
  }

  handleWaterOverflow() {
    const sortedBasins = Array.from(this.basins.entries()).sort((a, b) =>
      b[1].height - a[1].height
    );

    sortedBasins.forEach(([_basinId, basin]) => {
      if (!basin.outlets || basin.outlets.length === 0) return;

      const maxCapacity = basin.tileCount * CONFIG.VOLUME_UNIT * CONFIG.MAX_DEPTH;
      if (basin.volume > maxCapacity) {
        const overflow = basin.volume - maxCapacity;
        basin.volume = maxCapacity;

        const outletCount = basin.outlets.length;
        const overflowPerOutlet = overflow / outletCount;

        basin.outlets.forEach((outletId) => {
          const outletBasin = this.basins.get(outletId);
          if (outletBasin) {
            outletBasin.volume += overflowPerOutlet;
          }
        });
      }
    });
  }

  clearAllWater() {
    this.basins.forEach((basin) => {
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

  getDebugInfo(heights) {
    const connections = new Map();
    const basinArray = Array.from(this.basins.entries()).sort((a, b) => {
      const [levelA, lettersA] = a[0].split("#");
      const [levelB, lettersB] = b[0].split("#");
      if (levelA !== levelB) return parseInt(levelA) - parseInt(levelB);
      return lettersA.localeCompare(lettersB);
    });

    // Build connection graph
    basinArray.forEach(([id]) => {
      connections.set(id, new Set());
      
      // Iterate through all tiles to find those belonging to this basin
      for (let y = 0; y < CONFIG.WORLD_H; y++) {
        for (let x = 0; x < CONFIG.WORLD_W; x++) {
          if (this.basinIdOf[y][x] === id) {
            CONFIG.BASIN_COMPUTATION.DIRECTIONS.ALL.forEach(([dx, dy]) => {
              const nx = x + dx, ny = y + dy;
              if (this.isValidTile(nx, ny)) {
                const neighborBasinId = this.basinIdOf[ny][nx];
                if (neighborBasinId && neighborBasinId !== id) {
                  const isDiagonal = Math.abs(dx) + Math.abs(dy) === 2;
                  if (isDiagonal && heights) {
                    const cross1x = x + dx, cross1y = y;
                    const cross2x = x, cross2y = y + dy;

                    if (this.isValidTile(cross1x, cross1y) && this.isValidTile(cross2x, cross2y)) {
                      const cross1IsLand = heights[cross1y][cross1x] === 0;
                      const cross2IsLand = heights[cross2y][cross2x] === 0;

                      if (cross1IsLand && cross2IsLand) return;
                    }
                  }

                  connections.get(id).add(neighborBasinId);
                }
              }
            });
          }
        }
      }
    });

    const basinCount = this.basins.size;
    const maxDepth = basinArray.length > 0
      ? Math.max(...basinArray.map(([id]) => parseInt(id.split("#")[0])))
      : 0;

    let maxDegree = 0;
    connections.forEach((connectionSet) => {
      maxDegree = Math.max(maxDegree, connectionSet.size);
    });

    return {
      basinCount,
      maxDepth,
      maxDegree,
      basinArray,
      connections,
    };
  }
}
