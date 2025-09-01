// Game state management and main game logic

import { CONFIG } from './config.js';
import { HeightGenerator } from './noise.js';
import { BasinManager } from './basins.js';
import { ReservoirManager, PumpManager } from './pumps.js';

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
        performance.mark('height-generation-start');
        this.heights = this.heightGenerator.generate(this.currentSeed);
        performance.mark('height-generation-end');
        performance.measure('Height Generation', 'height-generation-start', 'height-generation-end');
        
        performance.mark('basin-computation-start');
        this.recomputeAll();
        performance.mark('basin-computation-end');
        performance.measure('Basin Computation', 'basin-computation-start', 'basin-computation-end');
        
        // Log the detailed timing
        const measures = performance.getEntriesByType('measure');
        const recentMeasures = measures.slice(-2); // Get the 2 most recent measures
        recentMeasures.forEach(measure => {
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
        const neighbors = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
        
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
        // Don't auto-select reservoir when linking to existing or when one is already selected
        if (reservoirId && !linkToExisting && this.getSelectedReservoir() === null) {
            this.setSelectedReservoir(reservoirId);
        }
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
        performance.mark('basin-manager-compute-start');
        this.basinManager.computeBasins(this.heights);
        performance.mark('basin-manager-compute-end');
        performance.measure('Basin Manager - Compute Basins', 'basin-manager-compute-start', 'basin-manager-compute-end');
        
        // Log the timing for this specific operation
        const measures = performance.getEntriesByType('measure');
        const lastMeasure = measures[measures.length - 1];
        console.log(`    └─ ${lastMeasure.name}: ${lastMeasure.duration.toFixed(2)}ms`);
    }

    // Getters for rendering
    getHeights() { return this.heights; }
    getBasins() { return this.basinManager.basins; }
    getPumps() { return this.pumpManager.getAllPumps(); }
    getReservoirs() { return this.reservoirManager.getAllReservoirs(); }
    getPumpsByReservoir() { return this.pumpManager.getPumpsByReservoir(); }
    getTickCounter() { return this.tickCounter; }
    
    // Getters for managers (for UI access)
    getBasinManager() { return this.basinManager; }
    getReservoirManager() { return this.reservoirManager; }
    getPumpManager() { return this.pumpManager; }
    getHeightGenerator() { return this.heightGenerator; }
}
