// Game state management and main game logic

import { CONFIG } from "./config.js";
import { HeightGenerator } from "./noise.js";
import { BasinManager } from "./basins.js";
import { PumpManager, ReservoirManager } from "./pumps.js";

export class GameState {
  constructor() {
    this.heightGenerator = new HeightGenerator(CONFIG.WORLD_W, CONFIG.WORLD_H, CONFIG.MAX_DEPTH);
    this.basinManager = new BasinManager();
    this.reservoirManager = new ReservoirManager();
    this.pumpManager = new PumpManager(this.reservoirManager, this.basinManager);

    // Initialize tick counter
    this.tickCounter = 0;

    // Track current seed for noise regeneration
    this.currentSeed = 0;

    // Initialize terrain
    this.heights = this.heightGenerator.generate(this.currentSeed);
    this.basinManager.computeBasins(this.heights);
  }

  // Terrain operations
  randomizeHeights() {
    this.currentSeed = Math.random() * 1000;
    console.log("Randomized heights with seed:", this.currentSeed);
    this.heights = this.heightGenerator.generate(this.currentSeed);
    this.recomputeAll();
  }

  // Regenerate terrain with current seed but updated noise settings
  regenerateWithCurrentSettings() {
    performance.mark("height-generation-start");
    this.heights = this.heightGenerator.generate(this.currentSeed);
    performance.mark("height-generation-end");
    performance.measure("Height Generation", "height-generation-start", "height-generation-end");

    performance.mark("basin-computation-start");
    this.recomputeAll();
    performance.mark("basin-computation-end");
    performance.measure("Basin Computation", "basin-computation-start", "basin-computation-end");

    // Log the detailed timing
    const measures = performance.getEntriesByType("measure");
    const recentMeasures = measures.slice(-2); // Get the 2 most recent measures
    recentMeasures.forEach((measure) => {
      console.log(`  └─ ${measure.name}: ${measure.duration.toFixed(2)}ms`);
    });
  }

  setDepthAt(x, y, depth) {
    if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
      this.heights[y][x] = Math.max(0, Math.min(CONFIG.MAX_DEPTH, depth));
      this.recomputeAll();
    }
  }

  // Batch version that doesn't recompute immediately - for brush painting
  setDepthAtBatch(x, y, depth) {
    if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
      this.heights[y][x] = Math.max(0, Math.min(CONFIG.MAX_DEPTH, depth));
    }
  }

  // Call this after batch operations to recompute basins once
  revalidateMap() {
    this.recomputeAll();
  }

  increaseDepthAt(x, y) {
    if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
      this.heights[y][x] = Math.min(CONFIG.MAX_DEPTH, this.heights[y][x] + 1);
      this.recomputeAll();
    }
  }

  decreaseDepthAt(x, y) {
    if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
      this.heights[y][x] = Math.max(0, this.heights[y][x] - 1);
      this.recomputeAll();
    }
  }

  setToMinNeighborHeight(x, y) {
    if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
      const minHeight = this.getMinNeighborHeight(x, y);
      this.heights[y][x] = minHeight;
      this.recomputeAll();
    }
  }

  getMinNeighborHeight(x, y) {
    let minHeight = CONFIG.MAX_DEPTH + 1; // Start with impossible high value
    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];

    for (let [nx, ny] of neighbors) {
      if (nx >= 0 && ny >= 0 && nx < CONFIG.WORLD_W && ny < CONFIG.WORLD_H) {
        minHeight = Math.min(minHeight, this.heights[ny][nx]);
      }
    }

    // If no valid neighbors found, return current height
    return minHeight <= CONFIG.MAX_DEPTH ? minHeight : this.heights[y][x];
  }

  // Pump operations
  addPump(x, y, mode, linkToExisting = false) {
    const reservoirId = this.pumpManager.addPumpAt(x, y, mode, linkToExisting);
    // Don't auto-select reservoir - let the input field be the source of truth
    return reservoirId;
  }

  linkPumpToReservoir(x, y) {
    return this.pumpManager.linkPumpToReservoir(x, y);
  }

  clearPumps() {
    this.pumpManager.clearAll();
  }

  // Water operations
  floodFill(x, y, fillWithWater) {
    this.basinManager.floodFill(x, y, fillWithWater);
  }

  clearAllWater() {
    this.basinManager.clearAllWater();
    this.reservoirManager.clearAllWater();
  }

  // Simulation tick
  tick() {
    this.tickCounter++;
    this.pumpManager.tick();
  }

  // Reservoir management
  setSelectedReservoir(id) {
    this.reservoirManager.setSelectedReservoir(id);
  }

  getSelectedReservoir() {
    return this.reservoirManager.getSelectedReservoir();
  }

  // Basin highlighting
  setHighlightedBasin(basinId) {
    this.basinManager.setHighlightedBasin(basinId);
  }

  getHighlightedBasin() {
    return this.basinManager.getHighlightedBasin();
  }

  // Utility methods
  recomputeAll() {
    performance.mark("basin-manager-compute-start");
    this.basinManager.computeBasins(this.heights);
    performance.mark("basin-manager-compute-end");
    performance.measure(
      "Basin Manager - Compute Basins",
      "basin-manager-compute-start",
      "basin-manager-compute-end",
    );

    // Log the timing for this specific operation
    const measures = performance.getEntriesByType("measure");
    const lastMeasure = measures[measures.length - 1];
    console.log(`    └─ ${lastMeasure.name}: ${lastMeasure.duration.toFixed(2)}ms`);
  }

  // Getters for rendering
  getHeights() {
    return this.heights;
  }
  getBasins() {
    return this.basinManager.basins;
  }
  getPumps() {
    return this.pumpManager.getAllPumps();
  }
  getReservoirs() {
    return this.reservoirManager.getAllReservoirs();
  }
  getPumpsByReservoir() {
    return this.pumpManager.getPumpsByReservoir();
  }
  getTickCounter() {
    return this.tickCounter;
  }

  // Getters for managers (for UI access)
  getBasinManager() {
    return this.basinManager;
  }
  getReservoirManager() {
    return this.reservoirManager;
  }
  getPumpManager() {
    return this.pumpManager;
  }
  getHeightGenerator() {
    return this.heightGenerator;
  }

  // Save/Load functionality
  exportToJSON() {
    const data = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      // Terrain data
      currentSeed: this.currentSeed,
      heights: this.compressHeights(this.heights),
      // Game state
      tickCounter: this.tickCounter,
      // Noise settings
      noiseSettings: {
        baseFreq: this.heightGenerator.noiseSettings.baseFreq,
        octaves: this.heightGenerator.noiseSettings.octaves,
        persistence: this.heightGenerator.noiseSettings.persistence,
        lacunarity: this.heightGenerator.noiseSettings.lacunarity,
        offset: this.heightGenerator.noiseSettings.offset,
        gain: this.heightGenerator.noiseSettings.gain,
        noiseType: this.heightGenerator.noiseSettings.noiseType,
        warpStrength: this.heightGenerator.noiseSettings.warpStrength,
        warpIterations: this.heightGenerator.noiseSettings.warpIterations,
        octaveSettings: this.heightGenerator.noiseSettings.octaveSettings
      },
      // Basin data - optimized storage
      basins: this.compressBasins(),
      // Pump data
      pumps: this.pumpManager.getAllPumps().map(pump => ({
        x: pump.x,
        y: pump.y,
        mode: pump.mode,
        reservoirId: pump.reservoirId
      })),
      // Reservoir data
      reservoirs: Array.from(this.reservoirManager.getAllReservoirs().entries()).map(([id, reservoir]) => ({
        id: id,
        volume: reservoir.volume
      }))
    };
    return JSON.stringify(data, null, 2);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate version compatibility
      if (!data.version) {
        throw new Error("Invalid save data: missing version information");
      }
      
      // Import terrain data
      if (data.currentSeed !== undefined) {
        this.currentSeed = data.currentSeed;
      }
      
      if (data.heights) {
        this.heights = this.decompressHeights(data.heights);
      } else {
        throw new Error("Invalid save data: missing terrain heights");
      }
      
      // Import game state
      if (data.tickCounter !== undefined) {
        this.tickCounter = data.tickCounter;
      }
      
      // Import noise settings
      if (data.noiseSettings) {
        const settings = this.heightGenerator.getNoiseSettings();
        Object.assign(settings, data.noiseSettings);
        // Update UI controls if they exist
        settings.updateUI();
      }
      
      // Clear existing data
      this.basinManager = new BasinManager();
      this.reservoirManager = new ReservoirManager();
      this.pumpManager = new PumpManager(this.reservoirManager, this.basinManager);
      
      // Recompute basins based on imported heights
      this.basinManager.computeBasins(this.heights);
      
      // Import basin data
      if (data.basins) {
        if (data.basins.format === "optimized_v1") {
          // New optimized format
          this.reconstructBasinsFromCompressed(data.basins);
        } else {
          // Legacy format - fallback
          this.importLegacyBasins(data.basins);
        }
      }
      
      // Import reservoirs
      if (data.reservoirs) {
        data.reservoirs.forEach(reservoirData => {
          this.reservoirManager.createReservoir(reservoirData.id);
          const reservoir = this.reservoirManager.getReservoir(reservoirData.id);
          if (reservoir) {
            reservoir.volume = reservoirData.volume || 0;
          }
        });
      }
      
      // Import pumps
      if (data.pumps) {
        data.pumps.forEach(pumpData => {
          // First create/ensure the reservoir exists
          if (pumpData.reservoirId) {
            this.reservoirManager.createReservoir(pumpData.reservoirId);
            this.reservoirManager.setSelectedReservoir(pumpData.reservoirId);
          }
          
          const _reservoirId = this.pumpManager.addPumpAt(
            pumpData.x, 
            pumpData.y, 
            pumpData.mode || 'auto',
            true  // Link to existing reservoir
          );
          
          // No additional properties to set since pumping and lastPumpTick don't exist
        });
      }
      
      return true;
    } catch (error) {
      console.error("Failed to import save data:", error);
      throw new Error(`Failed to import save data: ${error.message}`);
    }
  }

  // Compression utilities for better save format
  compressHeights(heights) {
    // Option 1: Readable 2D array format (current implementation improved)
    return {
      format: "2d_array",
      width: CONFIG.WORLD_W,
      height: CONFIG.WORLD_H,
      data: heights.map(row => row.join('')).join('\n')
    };
    
    // Alternative: Run-length encoding for sparse data
    // return this.runLengthEncode(heights);
    
    // Alternative: Base64 + bit packing for maximum compression
    // return this.base64Encode(heights);
  }

  runLengthEncode(heights) {
    const flattened = heights.flat();
    const compressed = [];
    let current = flattened[0];
    let count = 1;
    
    for (let i = 1; i < flattened.length; i++) {
      if (flattened[i] === current) {
        count++;
      } else {
        compressed.push([current, count]);
        current = flattened[i];
        count = 1;
      }
    }
    compressed.push([current, count]);
    
    return {
      format: "rle",
      width: CONFIG.WORLD_W,
      height: CONFIG.WORLD_H,
      data: compressed
    };
  }

  base64Encode(heights) {
    // Pack 2 height values (0-9) into each byte for 50% compression
    const flattened = heights.flat();
    const bytes = [];
    
    for (let i = 0; i < flattened.length; i += 2) {
      const val1 = flattened[i] || 0;
      const val2 = flattened[i + 1] || 0;
      bytes.push((val1 << 4) | val2);
    }
    
    const uint8Array = new Uint8Array(bytes);
    const base64 = btoa(String.fromCharCode.apply(null, uint8Array));
    
    return {
      format: "base64_packed",
      width: CONFIG.WORLD_W,
      height: CONFIG.WORLD_H,
      data: base64
    };
  }

  decompressHeights(compressed) {
    switch (compressed.format) {
      case "2d_array":
        return compressed.data.split('\n').map(row => 
          row.split('').map(char => parseInt(char, 10))
        );
        
      case "rle":
        return this.runLengthDecode(compressed);
        
      case "base64_packed":
        return this.base64Decode(compressed);
        
      default:
        // Fallback for old uncompressed format
        return Array.isArray(compressed) ? compressed : compressed.data;
    }
  }

  runLengthDecode(compressed) {
    const flattened = [];
    for (const [value, count] of compressed.data) {
      for (let i = 0; i < count; i++) {
        flattened.push(value);
      }
    }
    
    const heights = [];
    for (let y = 0; y < compressed.height; y++) {
      heights[y] = [];
      for (let x = 0; x < compressed.width; x++) {
        heights[y][x] = flattened[y * compressed.width + x];
      }
    }
    return heights;
  }

  base64Decode(compressed) {
    const binaryString = atob(compressed.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const flattened = [];
    for (const byte of bytes) {
      flattened.push((byte >> 4) & 0xF);  // High 4 bits
      flattened.push(byte & 0xF);         // Low 4 bits
    }
    
    const heights = [];
    for (let y = 0; y < compressed.height; y++) {
      heights[y] = [];
      for (let x = 0; x < compressed.width; x++) {
        const index = y * compressed.width + x;
        heights[y][x] = index < flattened.length ? flattened[index] : 0;
      }
    }
    return heights;
  }

  // Basin compression utilities
  compressBasins() {
    const basinIdMap = this.createBasinIdMap();
    const basinTree = this.createBasinTree();
    const basinMetadata = this.createBasinMetadata();

    return {
      format: "optimized_v1",
      width: CONFIG.WORLD_W,
      height: CONFIG.WORLD_H,
      // 2D array where each cell contains the basin ID for that tile
      basinIdMap: this.compressBasinIdMap(basinIdMap),
      // Tree structure showing how basins connect (outlets)
      basinTree: basinTree,
      // Basin properties (volume, level, etc.)
      basinMetadata: basinMetadata
    };
  }

  createBasinIdMap() {
    // Create 2D array of basin IDs
    const basinIdMap = [];
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      basinIdMap[y] = [];
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        const basinId = this.basinManager.basinIdOf[y][x];
        // Convert basin ID to a compact format - use 0 for no basin
        basinIdMap[y][x] = basinId || "0";
      }
    }
    return basinIdMap;
  }

  compressBasinIdMap(basinIdMap) {
    // Option 1: Simple string format (easy to read/debug)
    return {
      format: "string_rows",
      data: basinIdMap.map(row => row.join('|')).join('\n')
    };

    // Alternative: Run-length encoding for basin IDs (better compression)
    // Uncomment the line below and comment the above return to use RLE
    // return this.runLengthEncodeBasinIds(basinIdMap);
  }

  runLengthEncodeBasinIds(basinIdMap) {
    const flattened = basinIdMap.flat();
    const compressed = [];
    let current = flattened[0];
    let count = 1;

    for (let i = 1; i < flattened.length; i++) {
      if (flattened[i] === current) {
        count++;
      } else {
        compressed.push([current, count]);
        current = flattened[i];
        count = 1;
      }
    }
    compressed.push([current, count]);

    return {
      format: "rle_basin_ids",
      data: compressed
    };
  }

  createBasinTree() {
    // Create tree structure showing basin outlet relationships
    const tree = {};
    this.basinManager.basins.forEach((basin, basinId) => {
      tree[basinId] = {
        outlets: basin.outlets || [],
        height: basin.height
      };
    });
    return tree;
  }

  createBasinMetadata() {
    // Store basin properties (volume, level, etc.)
    const metadata = {};
    this.basinManager.basins.forEach((basin, basinId) => {
      metadata[basinId] = {
        volume: basin.volume || 0,
        level: basin.level || 0,
        tileCount: basin.tiles ? basin.tiles.size : 0
      };
    });
    return metadata;
  }

  decompressBasins(compressedBasins) {
    if (!compressedBasins.format || compressedBasins.format !== "optimized_v1") {
      // Fallback for old format
      return compressedBasins;
    }

    return {
      basinIdMap: this.decompressBasinIdMap(compressedBasins.basinIdMap),
      basinTree: compressedBasins.basinTree,
      basinMetadata: compressedBasins.basinMetadata
    };
  }

  decompressBasinIdMap(compressed) {
    switch (compressed.format) {
      case "string_rows":
        return compressed.data.split('\n').map(row => row.split('|'));

      case "rle_basin_ids":
        return this.runLengthDecodeBasinIds(compressed);

      default:
        // Fallback
        return compressed;
    }
  }

  runLengthDecodeBasinIds(compressed) {
    const flattened = [];
    for (const [value, count] of compressed.data) {
      for (let i = 0; i < count; i++) {
        flattened.push(value);
      }
    }

    const basinIdMap = [];
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      basinIdMap[y] = [];
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        basinIdMap[y][x] = flattened[y * CONFIG.WORLD_W + x];
      }
    }
    return basinIdMap;
  }

  reconstructBasinsFromCompressed(compressedData) {
    const decompressed = this.decompressBasins(compressedData);
    const { basinIdMap, basinTree, basinMetadata } = decompressed;

    // Clear existing basin data
    this.basinManager.basins.clear();
    this.basinManager.basinIdOf.forEach(row => row.fill(0));

    // Reconstruct basinIdOf array
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        const basinId = basinIdMap[y][x];
        this.basinManager.basinIdOf[y][x] = basinId === "0" ? 0 : basinId;
      }
    }

    // Reconstruct basin objects
    Object.keys(basinTree).forEach(basinId => {
      if (basinId === "0") return; // Skip empty tiles

      // Collect tiles for this basin
      const tiles = new Set();
      for (let y = 0; y < CONFIG.WORLD_H; y++) {
        for (let x = 0; x < CONFIG.WORLD_W; x++) {
          if (basinIdMap[y][x] === basinId) {
            tiles.add(`${x},${y}`);
          }
        }
      }

      // Create basin object
      const metadata = basinMetadata[basinId] || {};
      const treeData = basinTree[basinId] || {};
      
      this.basinManager.basins.set(basinId, {
        tiles: tiles,
        volume: metadata.volume || 0,
        level: metadata.level || 0,
        height: treeData.height || 0,
        outlets: treeData.outlets || []
      });
    });
  }

  importLegacyBasins(basinsData) {
    // Handle old format where basins were stored as individual objects
    if (Array.isArray(basinsData)) {
      basinsData.forEach(basinData => {
        const basin = this.basinManager.basins.get(basinData.id);
        if (basin) {
          basin.volume = basinData.volume || 0;
          basin.level = basinData.level || 0;
          // Note: height and outlets are set during computeBasins
        }
      });
    }
  }
}
