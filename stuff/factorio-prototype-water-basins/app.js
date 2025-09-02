// Main application controller - orchestrates all modules

// Cache busting for module imports
const moduleVersion = window.moduleVersion || Date.now();

// Dynamic imports with cache busting
const configModule = import(`./modules/config.js?v=${moduleVersion}`);
const gameModule = import(`./modules/game.js?v=${moduleVersion}`);
const rendererModule = import(`./modules/renderer.js?v=${moduleVersion}`);
const uiModule = import(`./modules/ui.js?v=${moduleVersion}`);
const constantsModule = import(`./modules/constants.js?v=${moduleVersion}`);
const saveloadModule = import(`./modules/saveload.js?v=${moduleVersion}`);

// Wait for all modules to load, then initialize the app
Promise.all([configModule, gameModule, rendererModule, uiModule, constantsModule, saveloadModule])
  .then(([config, game, renderer, ui, constants, saveload]) => {
    const { setupCanvas, CONFIG } = config;
    const { GameState } = game;
    const { Renderer, LegendRenderer } = renderer;
    const { UISettings, NoiseControlUI, DebugDisplay } = ui;
    const { UI_CONSTANTS } = constants;
    const { SaveLoadManager } = saveload;

    // Create and initialize the app
    const app = new TilemapWaterPumpingApp(
      setupCanvas,
      CONFIG,
      GameState,
      Renderer,
      LegendRenderer,
      UISettings,
      NoiseControlUI,
      DebugDisplay,
      UI_CONSTANTS,
      SaveLoadManager,
    );
    app.init();
  })
  .catch((error) => {
    console.error("Failed to load modules:", error);
  });

class TilemapWaterPumpingApp {
  constructor(
    setupCanvas,
    CONFIG,
    GameState,
    Renderer,
    LegendRenderer,
    UISettings,
    NoiseControlUI,
    DebugDisplay,
    UI_CONSTANTS,
    SaveLoadManager,
  ) {
    this.setupCanvas = setupCanvas;
    this.CONFIG = CONFIG;
    this.GameState = GameState;
    this.Renderer = Renderer;
    this.LegendRenderer = LegendRenderer;
    this.UISettings = UISettings;
    this.NoiseControlUI = NoiseControlUI;
    this.DebugDisplay = DebugDisplay;
    this.UI_CONSTANTS = UI_CONSTANTS;
    this.SaveLoadManager = SaveLoadManager;

    // Brush state
    this.brushSize = UI_CONSTANTS.BRUSH.MIN_SIZE;
    this.selectedDepth = 0;
    this.brushOverlay = new Map(); // key: "x,y", value: depth
    this.isDrawing = false;
    this.brushCenter = null; // {x, y} in tile coordinates
  }

  init() {
    // Setup canvas and rendering
    const { canvas, ctx } = this.setupCanvas();
    this.canvas = canvas;
    this.renderer = new this.Renderer(canvas, ctx);

    // Initialize game state
    this.gameState = new this.GameState();

    // Initialize UI components
    this.uiSettings = new this.UISettings();
    this.noiseControlUI = new this.NoiseControlUI(
      this.gameState.getHeightGenerator().getNoiseSettings(),
      () => this.onNoiseSettingsChanged(),
    );
    this.debugDisplay = new this.DebugDisplay(this.gameState.getBasinManager(), this.gameState, {
      removePump: (index) => {
        this.gameState.getPumpManager().removePump(index);
        this.renderer.onPumpsChanged();
      },
      removeReservoir: (id) => {
        this.gameState.getReservoirManager().removeReservoir(id);
        this.renderer.onPumpsChanged();
        this.renderer.onWaterChanged(); // Reservoirs can contain water
      },
      updateControls: () => this.updateReservoirControls(),
      updateDisplays: () => this.updateDebugDisplays(),
      updateDebugDisplays: () => this.updateDebugDisplays(),
      clearSelection: () => this.clearReservoirSelection(),
      draw: () => this.draw(),
    });

    // Initialize save/load manager
    this.saveLoadManager = new this.SaveLoadManager(this.gameState, () => this.onGameStateChanged());
    
    // Make save load manager globally accessible for HTML onclick handlers
    globalThis.saveLoadManager = this.saveLoadManager;

    // Setup callbacks
    this.debugDisplay.setBasinHighlightChangeCallback((_basinId) => {
      this.renderer.onBasinHighlightChanged();
      this.draw();
    });

    // Tick control state
    this.tickTimer = null;
    this.tickInterval = null;
    123;

    this.initialize();
  }

  initialize() {
    // Setup UI controls
    this.setupEventHandlers();
    this.setupCanvasEventHandlers();
    this.setupKeyboardEventHandlers();
    this.noiseControlUI.setupMainNoiseControls();
    this.noiseControlUI.createOctaveControls();

    // Create legend with selected depth highlight
    this.LegendRenderer.createLegend();
    this.updateLegendSelection();

    // Update reservoir controls
    this.updateReservoirControls();

    // Update insights display
    this.updateInsightsDisplay();

    // Update debug displays with initial state
    this.updateDebugDisplays();

    // Initial render
    this.draw();
  }

  onNoiseSettingsChanged() {
    performance.mark("noise-settings-change-start");

    performance.mark("terrain-regeneration-start");
    this.gameState.regenerateWithCurrentSettings();
    // Mark terrain layer as dirty after regeneration
    this.renderer.onTerrainChanged();
    this.renderer.onWaterChanged(); // Water basins change with terrain
    // Basin labels also need to be updated when terrain changes affect basins
    this.renderer.onLabelsToggled();
    performance.mark("terrain-regeneration-end");
    performance.measure(
      "Terrain Regeneration",
      "terrain-regeneration-start",
      "terrain-regeneration-end",
    );

    performance.mark("rendering-start");
    this.draw();
    performance.mark("rendering-end");
    performance.measure("Rendering", "rendering-start", "rendering-end");

    performance.mark("debug-display-update-start");
    this.updateDebugDisplays();
    performance.mark("debug-display-update-end");
    performance.measure(
      "Debug Display Update",
      "debug-display-update-start",
      "debug-display-update-end",
    );

    performance.mark("noise-settings-change-end");
    performance.measure(
      "🔥 Noise Settings Change - Total Time",
      "noise-settings-change-start",
      "noise-settings-change-end",
    );

    // Log the results
    const measures = performance.getEntriesByType("measure");
    const recentMeasures = measures.slice(-4); // Get the 4 most recent measures
    recentMeasures.forEach((measure) => {
      console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
    });
  }

  onGameStateChanged() {
    // Called when the game state is loaded from save/import
    this.renderer.onTerrainChanged();
    this.renderer.onWaterChanged();
    this.renderer.onPumpsChanged();
    this.renderer.onLabelsToggled();
    this.draw();
    this.updateDebugDisplays();
    this.updateReservoirControls();
    
    // Update noise control UI to reflect loaded settings
    this.noiseControlUI.updateUI();
  }

  setupKeyboardEventHandlers() {
    document.addEventListener("keydown", (e) => {
      // Handle 0-9 keys for depth selection
      if (e.key >= "0" && e.key <= "9") {
        const depth = parseInt(e.key);
        this.setSelectedDepth(depth);
        e.preventDefault();
      }
    });
  }

  setSelectedDepth(depth) {
    this.selectedDepth = Math.max(0, Math.min(9, depth));
    this.updateLegendSelection();
    console.log(`Selected depth: ${this.selectedDepth}`);
  }

  updateLegendSelection() {
    this.LegendRenderer.updateSelectedDepth(this.selectedDepth);
  }

  getBrushTiles(centerX, centerY) {
    const tiles = [];
    const radius = Math.floor(this.brushSize / 2);

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = centerX + dx;
        const y = centerY + dy;

        // Check if tile is within world bounds
        if (x >= 0 && y >= 0 && x < this.CONFIG.WORLD_W && y < this.CONFIG.WORLD_H) {
          // For circular brush, check distance
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            tiles.push({ x, y });
          }
        }
      }
    }

    return tiles;
  }

  updateBrushOverlay(centerX, centerY) {
    if (!this.isDrawing) return;

    const tiles = this.getBrushTiles(centerX, centerY);

    for (const tile of tiles) {
      const key = `${tile.x},${tile.y}`;
      this.brushOverlay.set(key, this.selectedDepth);
    }
  }

  commitBrushChanges() {
    if (this.brushOverlay.size === 0) return;

    // Apply all changes at once using batch method (no recomputation per tile)
    for (const [key, depth] of this.brushOverlay) {
      const [x, y] = key.split(",").map((n) => parseInt(n));
      this.gameState.setDepthAtBatch(x, y, depth);
    }

    // Clear overlay
    this.brushOverlay.clear();

    // Only revalidate the map once after all changes are committed
    this.gameState.revalidateMap();
    // Mark terrain and water layers as dirty after terrain changes
    this.renderer.onTerrainChanged();
    this.renderer.onWaterChanged();
    // Basin labels also need to be updated when terrain changes affect basins
    this.renderer.onLabelsToggled();
    this.updateDebugDisplays();
  }

  setupEventHandlers() {
    // Tick button with hold-to-continue functionality
    const tickBtn = document.getElementById("tickBtn");
    if (tickBtn) {
      tickBtn.onmousedown = () => {
        this.gameState.tick();
        this.renderer.onWaterChanged(); // Water levels change during simulation
        this.draw();
        this.updateDebugDisplays();

        // Start timer for continuous ticking after a delay
        this.tickTimer = setTimeout(() => {
          this.tickInterval = setInterval(() => {
            this.gameState.tick();
            this.renderer.onWaterChanged(); // Water levels change during simulation
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
    const randomizeBtn = document.getElementById("randomizeBtn");
    if (randomizeBtn) {
      randomizeBtn.onclick = () => {
        this.gameState.randomizeHeights();
        this.renderer.onTerrainChanged();
        this.renderer.onWaterChanged(); // Water basins change with terrain
        // Basin labels also need to be updated when terrain changes affect basins
        this.renderer.onLabelsToggled();
        this.draw();
        this.updateDebugDisplays();
      };
    }

    const clearPumpsBtn = document.getElementById("clearPumps");
    if (clearPumpsBtn) {
      clearPumpsBtn.onclick = () => {
        this.gameState.clearPumps();
        this.renderer.onPumpsChanged();
        this.updateReservoirControls();
        this.draw();
        this.updateDebugDisplays();
      };
    }

    const clearWaterBtn = document.getElementById("clearWater");
    if (clearWaterBtn) {
      clearWaterBtn.onclick = () => {
        this.gameState.clearAllWater();
        this.renderer.onWaterChanged();
        this.draw();
        this.updateDebugDisplays();
      };
    }

    // Label control event listeners
    const showDepthLabelsEl = document.getElementById("showDepthLabels");
    if (showDepthLabelsEl) {
      showDepthLabelsEl.onchange = () => {
        this.uiSettings.toggleDepthLabels();
        this.renderer.onLabelsToggled();
        this.draw();
      };
    }

    const showPumpLabelsEl = document.getElementById("showPumpLabels");
    if (showPumpLabelsEl) {
      showPumpLabelsEl.onchange = () => {
        this.uiSettings.togglePumpLabels();
        this.renderer.onLabelsToggled();
        this.draw();
      };
    }

    const showBasinLabelsEl = document.getElementById("showBasinLabels");
    if (showBasinLabelsEl) {
      showBasinLabelsEl.onchange = () => {
        this.uiSettings.toggleBasinLabels();
        this.renderer.onLabelsToggled();
        this.draw();
      };
    }

    // Pipe system number input control
    const reservoirInputEl = document.getElementById("reservoirInput");
    if (reservoirInputEl) {
      reservoirInputEl.oninput = (_e) => {
        const desiredId = this.getDesiredReservoirIdFromInput();
        this.gameState.setSelectedReservoir(desiredId);
        this.renderer.onPumpsChanged(); // Pump highlighting changes
        this.draw();
      };
    }
  }

  setupCanvasEventHandlers() {
    let isPanning = false;
    let lastPanX = 0;
    let lastPanY = 0;

    // Mouse down event
    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Handle middle mouse button for panning
      if (e.button === 1) { // Middle mouse button
        isPanning = true;
        lastPanX = screenX;
        lastPanY = screenY;
        this.canvas.style.cursor = "grabbing";
        e.preventDefault();
        return;
      }

      // Convert screen coordinates to world coordinates for game logic
      const worldPos = this.renderer.screenToWorld(screenX, screenY);
      const mx = Math.floor(worldPos.x / this.CONFIG.TILE_SIZE);
      const my = Math.floor(worldPos.y / this.CONFIG.TILE_SIZE);

      if (mx < 0 || my < 0 || mx >= this.CONFIG.WORLD_W || my >= this.CONFIG.WORLD_H) return;

      // Prevent context menu for right-click
      if (e.button === 2) {
        e.preventDefault();
      }

      // ALT + RMB - pipette tool
      if (e.altKey && e.button === 2) {
        const heights = this.gameState.getHeights();
        const pickedDepth = heights[my][mx];
        this.setSelectedDepth(pickedDepth);
        return;
      }

      if (e.ctrlKey) {
        if (e.shiftKey) {
          if (e.button === 0) { // SHIFT + CTRL + LMB - link pump to pipe system
            if (this.gameState.linkPumpToReservoir(mx, my)) {
              console.log(
                `Pipe System ${this.gameState.getSelectedReservoir()} selected for linking future pumps`,
              );
            } else {
              console.log("No pump found at this location to link to");
            }
            this.updateReservoirControls();
            this.draw();
          }
          return;
        }

        if (e.button === 0) { // CTRL + LMB - flood fill
          this.gameState.floodFill(mx, my, true);
          this.renderer.onWaterChanged();
        } else if (e.button === 2) { // CTRL + RMB - flood empty
          this.gameState.floodFill(mx, my, false);
          this.renderer.onWaterChanged();
        }
        this.draw();
        this.updateDebugDisplays();
        return;
      }

      if (e.shiftKey) {
        if (e.button === 0) { // SHIFT + LMB - add outlet pump
          const selectedId = this.gameState.getSelectedReservoir();
          const _reservoirId = this.gameState.addPump(mx, my, "outlet", selectedId !== null);
          this.renderer.onPumpsChanged();
          this.updateReservoirControls();
          this.draw();
          this.updateDebugDisplays();
        } else if (e.button === 2) { // SHIFT + RMB - add inlet pump
          const selectedId = this.gameState.getSelectedReservoir();
          const _reservoirId = this.gameState.addPump(mx, my, "inlet", selectedId !== null);
          this.renderer.onPumpsChanged();
          this.updateReservoirControls();
          this.draw();
          this.updateDebugDisplays();
        }
        return;
      }

      // Left mouse button - start painting
      if (e.button === 0) {
        this.isDrawing = true;
        this.brushOverlay.clear();
        this.updateBrushOverlay(mx, my);
        this.gameState.setSelectedReservoir(null); // Clear pipe system selection
        this.renderer.onPumpsChanged(); // Pump highlighting changes
        this.updateReservoirControls();
        this.draw();
      }
    });

    // Mouse move event for panning, tile info, and painting
    this.canvas.addEventListener("mousemove", (e) => {
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
        // Update tile info and brush position
        const worldPos = this.renderer.screenToWorld(screenX, screenY);
        const tileX = Math.floor(worldPos.x / this.CONFIG.TILE_SIZE);
        const tileY = Math.floor(worldPos.y / this.CONFIG.TILE_SIZE);

        // Update brush center for overlay rendering
        this.brushCenter = { x: tileX, y: tileY };

        // Continue painting if drawing
        if (this.isDrawing) {
          this.updateBrushOverlay(tileX, tileY);
        }

        const tileInfo = this.getTileInfo(tileX, tileY);
        this.updateInsightsDisplay(tileInfo);
        this.draw();
      }
    });

    // Mouse up event
    this.canvas.addEventListener("mouseup", (e) => {
      if (e.button === 1 && isPanning) { // Middle mouse button
        isPanning = false;
        this.canvas.style.cursor = "default";
      } else if (e.button === 0 && this.isDrawing) { // Left mouse button
        this.isDrawing = false;
        this.commitBrushChanges();
        this.draw();
      }
    });

    // Mouse leave event to stop panning, painting, and reset tile info
    this.canvas.addEventListener("mouseleave", () => {
      if (isPanning) {
        isPanning = false;
        this.canvas.style.cursor = "default";
      }
      if (this.isDrawing) {
        this.isDrawing = false;
        this.commitBrushChanges();
        this.draw();
      }
      this.brushCenter = null;
      // Reset to just zoom info when mouse leaves canvas
      this.updateInsightsDisplay();
      this.draw();
    });

    // Wheel event for zooming and brush size
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();

      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      if (e.shiftKey) {
        // SHIFT + Wheel - change brush size
        const delta = e.deltaY > 0 ? -1 : 1;
        this.brushSize = Math.max(
          this.UI_CONSTANTS.BRUSH.MIN_SIZE,
          Math.min(this.UI_CONSTANTS.BRUSH.MAX_SIZE, this.brushSize + delta),
        );
        console.log(`Brush size: ${this.brushSize}`);
        this.updateInsightsDisplay();
        this.draw();
      } else if (e.altKey) {
        // ALT + Wheel - change selected depth
        const delta = e.deltaY > 0 ? -1 : 1;
        this.setSelectedDepth(this.selectedDepth + delta);
      } else {
        // Normal zoom
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.renderer.zoomAt(screenX, screenY, zoomFactor);
        this.updateInsightsDisplay();
        this.draw();
      }
    });

    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault(); // Prevent right-click context menu
    });
  }

  updateInsightsDisplay(tileInfo = null) {
    // Update zoom value
    const zoomValue = document.getElementById("zoomValue");
    if (zoomValue) {
      const zoomPercentage = Math.round(this.renderer.camera.zoom * 100);
      zoomValue.textContent = `${zoomPercentage}%`;
    }

    // Update brush size
    const brushValue = document.getElementById("brushValue");
    if (brushValue) {
      brushValue.textContent = this.brushSize;
    }

    // Update tile info
    const tileInfoEl = document.getElementById("tileInfo");
    if (tileInfoEl) {
      if (tileInfo) {
        const { x, y, depth } = tileInfo;
        if (depth === 0) {
          tileInfoEl.textContent = `(${x},${y}) Land`;
        } else {
          tileInfoEl.textContent = `(${x},${y}) D${depth}`;
        }
      } else {
        tileInfoEl.textContent = "--";
      }
    }

    // Update basin info
    const basinInfoEl = document.getElementById("basinInfo");
    if (basinInfoEl) {
      if (tileInfo && tileInfo.basinId) {
        const basinManager = this.gameState.getBasinManager();
        const basin = basinManager.basins.get(tileInfo.basinId);
        if (basin) {
          const maxCapacity = basin.tiles.size * this.CONFIG.VOLUME_UNIT * this.CONFIG.MAX_DEPTH;
          const currentVolume = Math.floor(basin.volume);
          basinInfoEl.textContent = `${tileInfo.basinId} ${currentVolume}/${maxCapacity}`;
        } else {
          basinInfoEl.textContent = tileInfo.basinId;
        }
      } else if (tileInfo && tileInfo.pumpInfo) {
        const { mode, reservoirId } = tileInfo.pumpInfo;
        basinInfoEl.textContent = `${mode} PS${reservoirId || "?"}`;
      } else {
        basinInfoEl.textContent = "--";
      }
    }
  }

  getTileInfo(x, y) {
    if (x < 0 || y < 0 || x >= this.CONFIG.WORLD_W || y >= this.CONFIG.WORLD_H) {
      return null;
    }

    const heights = this.gameState.getHeights();
    const basinManager = this.gameState.getBasinManager();
    const pumps = this.gameState.getPumps();

    const depth = heights[y][x];
    const basinId = basinManager.getBasinIdAt(x, y);

    // Check if there's a pump at this location
    const pump = pumps.find((p) => p.x === x && p.y === y);
    const pumpInfo = pump ? { mode: pump.mode, reservoirId: pump.reservoirId } : null;

    return {
      x,
      y,
      depth,
      basinId,
      pumpInfo,
    };
  }

  updateReservoirControls() {
    // This method should only be called when we need to sync the input
    // field with the internal state (like on initial load)
    const input = document.getElementById("reservoirInput");
    if (input && input.value === "") {
      // Set to 1 if input is empty
      const selectedId = this.gameState.getSelectedReservoir();
      input.value = selectedId !== null ? selectedId : 1;
    }
  }

  getDesiredReservoirIdFromInput() {
    const input = document.getElementById("reservoirInput");
    if (input) {
      const value = input.value;
      if (value === "" || parseInt(value) < 1) {
        // Reset to 1 if invalid
        input.value = "1";
        return 1;
      }
      const id = parseInt(value);
      return id > 0 ? id : 1;
    }
    return 1;
  }

  clearReservoirSelection() {
    console.log("Clearing reservoir selection");
    this.gameState.setSelectedReservoir(null);
    this.renderer.onPumpsChanged(); // Pump highlighting changes
    // Don't update input field - let it keep its current value as source of truth
    this.draw();
  }

  updateDebugDisplays() {
    this.debugDisplay.updateBasinsDisplay();
    this.debugDisplay.updateReservoirsDisplay(
      this.gameState.getReservoirs(),
      this.gameState.getPumps(),
      this.gameState.getSelectedReservoir(),
    );
    this.debugDisplay.updateTickCounter(this.gameState.getTickCounter());
  }

  draw() {
    // Use optimized layered rendering
    this.renderer.renderOptimized(
      this.gameState,
      this.uiSettings,
      this.gameState.getSelectedReservoir(),
      this.brushOverlay,
      this.brushCenter,
      this.brushSize,
      this.selectedDepth
    );
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  globalThis.tilemapApp = new TilemapWaterPumpingApp();
});
