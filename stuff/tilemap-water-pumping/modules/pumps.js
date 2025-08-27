// Pump and reservoir management system

import { CONFIG } from './config.js';

export class ReservoirManager {
    constructor() {
        this.reservoirs = new Map(); // id -> {volume: number}
        this.nextReservoirId = 1;
        this.selectedReservoirId = null; // For linking pumps to the same reservoir
    }

    createReservoir() {
        const id = this.nextReservoirId++;
        this.reservoirs.set(id, { volume: 0 });
        return id;
    }

    getReservoir(id) {
        return this.reservoirs.get(id);
    }

    setSelectedReservoir(id) {
        this.selectedReservoirId = id;
    }

    getSelectedReservoir() {
        return this.selectedReservoirId;
    }

    clearAll() {
        this.reservoirs.clear();
        this.nextReservoirId = 1;
        this.selectedReservoirId = null;
    }

    clearAllWater() {
        this.reservoirs.forEach(reservoir => {
            reservoir.volume = 0;
        });
    }

    exists(id) {
        return this.reservoirs.has(id);
    }

    getAllReservoirs() {
        return this.reservoirs;
    }

    removeReservoir(id) {
        if (this.reservoirs.has(id)) {
            this.reservoirs.delete(id);
            return true;
        }
        return false;
    }
}

export class PumpManager {
    constructor(reservoirManager, basinManager) {
        this.pumps = []; // {x, y, mode, reservoirId}
        this.reservoirManager = reservoirManager;
        this.basinManager = basinManager;
    }

    addPumpAt(x, y, mode, linkToReservoir = false) {
        const basinId = this.basinManager.getBasinIdAt(x, y);
        if (!basinId) return null;
        
        let reservoirId;
        const selectedId = this.reservoirManager.getSelectedReservoir();
        
        if (linkToReservoir && selectedId && this.reservoirManager.exists(selectedId)) {
            reservoirId = selectedId;
        } else if (selectedId && selectedId > 0 && this.reservoirManager.exists(selectedId)) {
            // Use currently selected reservoir if it exists
            reservoirId = selectedId;
        } else {
            reservoirId = this.reservoirManager.createReservoir();
        }
        
        this.pumps.push({ x, y, mode, reservoirId });
        return reservoirId;
    }

    linkPumpToReservoir(x, y) {
        // Find existing pump at this location to get its reservoir
        const existingPump = this.pumps.find(p => p.x === x && p.y === y);
        if (existingPump) {
            this.reservoirManager.setSelectedReservoir(existingPump.reservoirId);
            console.log(`Selected reservoir ${existingPump.reservoirId} for linking`);
            return true;
        }
        
        // If no pump at exact location, find the nearest pump within a small radius
        const nearbyPumps = this.pumps.filter(p => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1);
        if (nearbyPumps.length > 0) {
            this.reservoirManager.setSelectedReservoir(nearbyPumps[0].reservoirId);
            console.log(`Selected reservoir ${nearbyPumps[0].reservoirId} for linking (from nearby pump)`);
            return true;
        }
        
        return false;
    }

    clearAll() {
        this.pumps = [];
        this.reservoirManager.clearAll();
    }

    tick() {
        for (let pump of this.pumps) {
            const basin = this.basinManager.getBasinAt(pump.x, pump.y);
            const reservoir = this.reservoirManager.getReservoir(pump.reservoirId);
            
            if (!basin || !reservoir) continue;
            
            if (pump.mode === 'inlet') {
                // Pump water from basin to reservoir
                const take = Math.min(CONFIG.PUMP_RATE, basin.volume);
                basin.volume -= take;
                reservoir.volume += take;
            } else {
                // Pump water from reservoir to basin
                const give = Math.min(CONFIG.PUMP_RATE, Math.max(0, reservoir.volume));
                reservoir.volume -= give;
                basin.volume += give;
            }
        }
        
        // Update basin water levels after all pumping operations
        this.basinManager.updateWaterLevels();
    }

    getAllPumps() {
        return this.pumps;
    }

    removePump(index) {
        if (index >= 0 && index < this.pumps.length) {
            this.pumps.splice(index, 1);
            return true;
        }
        return false;
    }

    removePumpAt(x, y) {
        for (let i = 0; i < this.pumps.length; i++) {
            if (this.pumps[i].x === x && this.pumps[i].y === y) {
                this.pumps.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    // Get pumps grouped by reservoir for debugging
    getPumpsByReservoir() {
        const pumpsByReservoir = new Map();
        this.pumps.forEach((pump, index) => {
            if (!pumpsByReservoir.has(pump.reservoirId)) {
                pumpsByReservoir.set(pump.reservoirId, []);
            }
            pumpsByReservoir.get(pump.reservoirId).push({...pump, index});
        });
        return pumpsByReservoir;
    }
}
