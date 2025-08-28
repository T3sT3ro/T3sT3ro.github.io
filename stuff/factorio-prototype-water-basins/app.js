// Main application controller - orchestrates all modules

import { setupCanvas, CONFIG } from './modules/config.js';
import { GameState } from './modules/game.js';
import { Renderer, LegendRenderer } from './modules/renderer.js';
import { UISettings, NoiseControlUI, DebugDisplay } from './modules/ui.js';

class TilemapWaterPumpingApp {
    constructor() {
        // Setup canvas and rendering
        const { canvas, ctx } = setupCanvas();
        this.canvas = canvas;
        this.renderer = new Renderer(canvas, ctx);
        
        // Initialize game state
        this.gameState = new GameState();
        
        // Initialize UI components
        this.uiSettings = new UISettings();
        this.noiseControlUI = new NoiseControlUI(
            this.gameState.getHeightGenerator().getNoiseSettings(),
            () => this.onNoiseSettingsChanged()
        );
        this.debugDisplay = new DebugDisplay(this.gameState.getBasinManager(), this.gameState);
        
        // Setup callbacks
        this.debugDisplay.setBasinHighlightChangeCallback((basinId) => this.draw());
        
        // Tick control state
        this.tickTimer = null;
        this.tickInterval = null;
        
        this.initialize();
    }

    initialize() {
        // Setup UI controls
        this.setupEventHandlers();
        this.setupCanvasEventHandlers();
        this.noiseControlUI.setupMainNoiseControls();
        this.noiseControlUI.createOctaveControls();
        
        // Create legend
        LegendRenderer.createLegend();
        
        // Update reservoir controls
        this.updateReservoirControls();
        
        // Update zoom indicator
        this.updateZoomIndicator();
        
        // Initial render
        this.draw();
    }

    onNoiseSettingsChanged() {
        this.gameState.regenerateWithCurrentSettings();
        this.draw();
        this.updateDebugDisplays();
    }

    setupEventHandlers() {
        // Tick button with hold-to-continue functionality
        const tickBtn = document.getElementById('tickBtn');
        if (tickBtn) {
            tickBtn.onmousedown = () => {
                this.gameState.tick();
                this.draw();
                this.updateDebugDisplays();
                
                // Start timer for continuous ticking after a delay
                this.tickTimer = setTimeout(() => {
                    this.tickInterval = setInterval(() => {
                        this.gameState.tick();
                        this.draw();
                        this.updateDebugDisplays();
                    }, 100); // Tick every 100ms when held
                }, 500); // Wait 500ms before starting continuous ticking
            };
            
            const stopTicking = () => {
                if (this.tickTimer) {
                    clearTimeout(this.tickTimer);
                    this.tickTimer = null;
                }
                if (this.tickInterval) {
                    clearInterval(this.tickInterval);
                    this.tickInterval = null;
                }
            };
            
            tickBtn.onmouseup = stopTicking;
            tickBtn.onmouseleave = stopTicking;
        }
        
        // Other control buttons
        const randomizeBtn = document.getElementById('randomizeBtn');
        if (randomizeBtn) {
            randomizeBtn.onclick = () => {
                this.gameState.randomizeHeights();
                this.draw();
                this.updateDebugDisplays();
            };
        }
        
        const clearPumpsBtn = document.getElementById('clearPumps');
        if (clearPumpsBtn) {
            clearPumpsBtn.onclick = () => {
                this.gameState.clearPumps();
                this.updateReservoirControls();
                this.draw();
                this.updateDebugDisplays();
            };
        }
        
        const clearWaterBtn = document.getElementById('clearWater');
        if (clearWaterBtn) {
            clearWaterBtn.onclick = () => {
                this.gameState.clearAllWater();
                this.draw();
                this.updateDebugDisplays();
            };
        }
        
        // Label control event listeners
        const showDepthLabelsEl = document.getElementById('showDepthLabels');
        if (showDepthLabelsEl) {
            showDepthLabelsEl.onchange = () => {
                this.uiSettings.toggleDepthLabels();
                this.draw();
            };
        }
        
        const showPumpLabelsEl = document.getElementById('showPumpLabels');
        if (showPumpLabelsEl) {
            showPumpLabelsEl.onchange = () => {
                this.uiSettings.togglePumpLabels();
                this.draw();
            };
        }
        
        const showBasinLabelsEl = document.getElementById('showBasinLabels');
        if (showBasinLabelsEl) {
            showBasinLabelsEl.onchange = () => {
                this.uiSettings.toggleBasinLabels();
                this.draw();
            };
        }
        
        // Reservoir number input control
        const reservoirInputEl = document.getElementById('reservoirInput');
        if (reservoirInputEl) {
            reservoirInputEl.oninput = (e) => {
                const value = e.target.value;
                if (value === '' || value === '0') {
                    this.gameState.setSelectedReservoir(null);
                } else {
                    const id = parseInt(value);
                    if (id > 0) {
                        this.gameState.setSelectedReservoir(id);
                    } else {
                        this.gameState.setSelectedReservoir(null);
                    }
                }
                this.draw();
            };
        }
    }

    setupCanvasEventHandlers() {
        let isPanning = false;
        let lastPanX = 0;
        let lastPanY = 0;

        // Mouse down event
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            
            // Handle middle mouse button for panning
            if (e.button === 1) { // Middle mouse button
                isPanning = true;
                lastPanX = screenX;
                lastPanY = screenY;
                this.canvas.style.cursor = 'grabbing';
                e.preventDefault();
                return;
            }
            
            // Convert screen coordinates to world coordinates for game logic
            const worldPos = this.renderer.screenToWorld(screenX, screenY);
            const mx = Math.floor(worldPos.x / CONFIG.TILE_SIZE);
            const my = Math.floor(worldPos.y / CONFIG.TILE_SIZE);
            
            if (mx < 0 || my < 0 || mx >= CONFIG.WORLD_W || my >= CONFIG.WORLD_H) return;
            
            // Prevent context menu for right-click
            if (e.button === 2) {
                e.preventDefault();
            }
            
            if (e.altKey) {
                if (e.button === 0) { // ALT + LMB - increase depth
                    this.gameState.increaseDepthAt(mx, my);
                } else if (e.button === 2) { // ALT + RMB - decrease depth
                    this.gameState.decreaseDepthAt(mx, my);
                }
                this.draw();
                this.updateDebugDisplays();
                return;
            }
            
            if (e.ctrlKey) {
                if (e.shiftKey) {
                    if (e.button === 0) { // SHIFT + CTRL + LMB - link pump to reservoir
                        if (this.gameState.linkPumpToReservoir(mx, my)) {
                            console.log(`Reservoir ${this.gameState.getSelectedReservoir()} selected for linking future pumps`);
                        } else {
                            console.log('No pump found at this location to link to');
                        }
                        this.updateReservoirControls();
                        this.draw();
                    }
                    return;
                }
                
                if (e.button === 0) { // CTRL + LMB - flood fill
                    this.gameState.floodFill(mx, my, true);
                } else if (e.button === 2) { // CTRL + RMB - flood empty
                    this.gameState.floodFill(mx, my, false);
                }
                this.draw();
                this.updateDebugDisplays();
                return;
            }
            
            if (e.shiftKey) {
                if (e.button === 0) { // SHIFT + LMB - add outlet pump
                    const selectedId = this.gameState.getSelectedReservoir();
                    const reservoirId = this.gameState.addPump(mx, my, 'outlet', selectedId !== null);
                    this.updateReservoirControls();
                    this.draw();
                    this.updateDebugDisplays();
                } else if (e.button === 2) { // SHIFT + RMB - add inlet pump
                    const selectedId = this.gameState.getSelectedReservoir();
                    const reservoirId = this.gameState.addPump(mx, my, 'inlet', selectedId !== null);
                    this.updateReservoirControls();
                    this.draw();
                    this.updateDebugDisplays();
                }
                return;
            }
            
            // Basic tile operations
            if (e.button === 0) { // Left mouse button - set depth to 0
                this.gameState.setDepthAt(mx, my, 0);
                this.gameState.setSelectedReservoir(null); // Clear reservoir selection
                this.updateReservoirControls();
            } else if (e.button === 2) { // Right mouse button - set depth to 1
                this.gameState.setDepthAt(mx, my, 1);
                this.gameState.setSelectedReservoir(null); // Clear reservoir selection
                this.updateReservoirControls();
            }
            
            this.draw();
            this.updateDebugDisplays();
        });

        // Mouse move event for panning and tile info
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            
            if (isPanning) {
                const deltaX = screenX - lastPanX;
                const deltaY = screenY - lastPanY;
                
                this.renderer.pan(-deltaX, -deltaY);
                
                lastPanX = screenX;
                lastPanY = screenY;
                
                this.draw();
            } else {
                // Update tile info when not panning
                const worldPos = this.renderer.screenToWorld(screenX, screenY);
                const tileX = Math.floor(worldPos.x / CONFIG.TILE_SIZE);
                const tileY = Math.floor(worldPos.y / CONFIG.TILE_SIZE);
                
                const tileInfo = this.getTileInfo(tileX, tileY);
                this.updateZoomIndicator(tileInfo);
            }
        });

        // Mouse up event
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 1 && isPanning) { // Middle mouse button
                isPanning = false;
                this.canvas.style.cursor = 'default';
            }
        });

        // Mouse leave event to stop panning and reset tile info
        this.canvas.addEventListener('mouseleave', () => {
            if (isPanning) {
                isPanning = false;
                this.canvas.style.cursor = 'default';
            }
            // Reset to just zoom info when mouse leaves canvas
            this.updateZoomIndicator();
        });

        // Wheel event for zooming
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.renderer.zoomAt(screenX, screenY, zoomFactor);
            
            this.updateZoomIndicator();
            this.draw();
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent right-click context menu
        });
    }

    updateZoomIndicator(tileInfo = null) {
        const zoomIndicator = document.getElementById('zoomIndicator');
        if (zoomIndicator) {
            const zoomPercentage = Math.round(this.renderer.camera.zoom * 100);
            let displayText = `Zoom: ${zoomPercentage}%`;
            
            if (tileInfo) {
                const { x, y, depth, basinId, pumpInfo } = tileInfo;
                displayText += ` | Tile: (${x}, ${y})`;
                
                if (depth === 0) {
                    displayText += ` Land`;
                } else {
                    displayText += ` Depth: ${depth}`;
                }
                
                if (basinId) {
                    displayText += ` Basin: ${basinId}`;
                }
                
                if (pumpInfo) {
                    displayText += ` | ${pumpInfo.mode} Pump R${pumpInfo.reservoirId || '?'}`;
                }
            }
            
            zoomIndicator.textContent = displayText;
        }
    }

    getTileInfo(x, y) {
        if (x < 0 || y < 0 || x >= CONFIG.WORLD_W || y >= CONFIG.WORLD_H) {
            return null;
        }
        
        const heights = this.gameState.getHeights();
        const basinManager = this.gameState.getBasinManager();
        const pumps = this.gameState.getPumps();
        
        const depth = heights[y][x];
        const basinId = basinManager.getBasinIdAt(x, y);
        
        // Check if there's a pump at this location
        const pump = pumps.find(p => p.x === x && p.y === y);
        const pumpInfo = pump ? { mode: pump.mode, reservoirId: pump.reservoirId } : null;
        
        return {
            x,
            y,
            depth,
            basinId,
            pumpInfo
        };
    }

    updateReservoirControls() {
        const input = document.getElementById('reservoirInput');
        if (input) {
            const selectedId = this.gameState.getSelectedReservoir();
            input.value = selectedId !== null ? selectedId : 0;
        }
    }

    updateDebugDisplays() {
        this.debugDisplay.updateBasinsDisplay();
        this.debugDisplay.updateReservoirsDisplay(
            this.gameState.getReservoirs(),
            this.gameState.getPumps(),
            this.gameState.getSelectedReservoir()
        );
        this.debugDisplay.updateTickCounter(this.gameState.getTickCounter());
    }

    draw() {
        this.renderer.clear();
        
        // Draw terrain with integrated highlighting
        this.renderer.drawTerrain(
            this.gameState.getHeights(),
            this.gameState.getBasinManager(),
            this.gameState.getHighlightedBasin()
        );
        
        // Draw water
        this.renderer.drawWater(this.gameState.getBasins());
        
        // Draw pumps
        this.renderer.drawPumps(
            this.gameState.getPumps(),
            this.gameState.getSelectedReservoir()
        );
        
        // Draw pump connections
        this.renderer.drawPumpConnections(this.gameState.getPumpsByReservoir());
        
        // Draw chunk boundaries
        this.renderer.drawChunkBoundaries();
        
        // Draw labels
        this.renderer.drawLabels(
            this.gameState.getHeights(),
            this.gameState.getBasins(),
            this.gameState.getPumps(),
            this.uiSettings
        );
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tilemapApp = new TilemapWaterPumpingApp();
});
