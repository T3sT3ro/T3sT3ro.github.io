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
        
        // Initialize terrain
        this.heights = this.heightGenerator.generate(0);
        this.basinManager.computeBasins(this.heights);
    }

    // Terrain operations
    randomizeHeights() {
        this.heights = this.heightGenerator.generate(Math.random() * 1000);
        this.recomputeAll();
    }

    setDepthAt(x, y, depth) {
        if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
            this.heights[y][x] = Math.max(0, Math.min(CONFIG.MAX_DEPTH, depth));
            this.recomputeAll();
        }
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
        if (reservoirId && !linkToExisting) {
            this.reservoirManager.setSelectedReservoir(reservoirId);
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
        this.basinManager.computeBasins(this.heights);
    }

    // Getters for rendering
    getHeights() { return this.heights; }
    getBasins() { return this.basinManager.basins; }
    getPumps() { return this.pumpManager.getAllPumps(); }
    getReservoirs() { return this.reservoirManager.getAllReservoirs(); }
    getPumpsByReservoir() { return this.pumpManager.getPumpsByReservoir(); }
    
    // Getters for managers (for UI access)
    getBasinManager() { return this.basinManager; }
    getReservoirManager() { return this.reservoirManager; }
    getPumpManager() { return this.pumpManager; }
    getHeightGenerator() { return this.heightGenerator; }
}
