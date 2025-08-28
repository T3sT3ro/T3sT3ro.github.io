// Main application controller - orchestrates all modules

import { setupCanvas } from './modules/config.js';
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
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = Math.floor((e.clientX - rect.left) / 6); // TILE_SIZE = 6
            const my = Math.floor((e.clientY - rect.top) / 6);
            
            if (mx < 0 || my < 0 || mx >= 160 || my >= 160) return; // WORLD_W/H = 160
            
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
            } else if (e.button === 2) { // Right mouse button - set to min neighbor height
                this.gameState.setToMinNeighborHeight(mx, my);
                this.gameState.setSelectedReservoir(null); // Clear reservoir selection
                this.updateReservoirControls();
            }
            
            this.draw();
            this.updateDebugDisplays();
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent right-click context menu
        });
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
        
        // Draw terrain
        this.renderer.drawTerrain(this.gameState.getHeights());
        
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
        
        // Draw basin highlight
        this.renderer.drawBasinHighlight(
            this.gameState.getBasins(),
            this.gameState.getHighlightedBasin()
        );
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tilemapApp = new TilemapWaterPumpingApp();
});
