// Rendering and drawing functionality

import { CONFIG } from "./config.js";
import { BasinLabelManager } from "./labels.js";
import { CSS_CLASSES, UI_CONSTANTS } from "./constants.js";

export function getHeightColor(depth) {
  // Only depth 0 = surface (brown), all others = gray
  if (depth === 0) {
    return "rgb(139, 69, 19)"; // Brown for surface only
  } else {
    // Gray gradient for all depths > 0
    const ratio = depth / CONFIG.MAX_DEPTH;
    const v = Math.floor(220 - ratio * 180); // 220 (light gray) -> 40 (dark gray)
    return `rgb(${v},${v},${v})`;
  }
}

export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.basinLabelManager = new BasinLabelManager();

    // Camera/viewport system for pan and zoom
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      minZoom: 0.25,
      maxZoom: 4,
    };

    // Initialize off-screen canvases for layered rendering
    this.initializeOffScreenCanvases();
    
    // Track which layers need updates
    this.layerDirty = {
      terrain: true,
      infrastructure: true,
      water: true,
      interactive: true,
      highlight: true
    };
  }

  initializeOffScreenCanvases() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Layer 1: Static terrain
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = width;
    this.terrainCanvas.height = height;
    this.terrainCtx = this.terrainCanvas.getContext('2d');

    // Layer 2: Infrastructure (chunk boundaries, pump connections)
    this.infrastructureCanvas = document.createElement('canvas');
    this.infrastructureCanvas.width = width;
    this.infrastructureCanvas.height = height;
    this.infrastructureCtx = this.infrastructureCanvas.getContext('2d');

    // Layer 3: Dynamic water
    this.waterCanvas = document.createElement('canvas');
    this.waterCanvas.width = width;
    this.waterCanvas.height = height;
    this.waterCtx = this.waterCanvas.getContext('2d');

    // Layer 4: Interactive elements (pumps, labels)
    this.interactiveCanvas = document.createElement('canvas');
    this.interactiveCanvas.width = width;
    this.interactiveCanvas.height = height;
    this.interactiveCtx = this.interactiveCanvas.getContext('2d');

    // Layer 5: Basin highlights (separate for performance)
    this.highlightCanvas = document.createElement('canvas');
    this.highlightCanvas.width = width;
    this.highlightCanvas.height = height;
    this.highlightCtx = this.highlightCanvas.getContext('2d');
  }

  // Mark specific layers as needing updates
  markLayerDirty(layer) {
    if (layer === 'all') {
      Object.keys(this.layerDirty).forEach(key => this.layerDirty[key] = true);
    } else if (layer in this.layerDirty) {
      this.layerDirty[layer] = true;
    }
  }

  // Apply camera transformation to any context
  applyCameraTransformToContext(ctx) {
    ctx.setTransform(
      this.camera.zoom,
      0,
      0,
      this.camera.zoom,
      -this.camera.x * this.camera.zoom,
      -this.camera.y * this.camera.zoom,
    );
  }

  // Apply camera transformation to main context
  applyCameraTransform() {
    this.applyCameraTransformToContext(this.ctx);
  }

  // Reset camera transformation for any context
  resetTransformForContext(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Reset camera transformation
  resetTransform() {
    this.resetTransformForContext(this.ctx);
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX / this.camera.zoom) + this.camera.x,
      y: (screenY / this.camera.zoom) + this.camera.y,
    };
  }

  // Pan camera by given offset
  pan(deltaX, deltaY) {
    this.camera.x += deltaX / this.camera.zoom;
    this.camera.y += deltaY / this.camera.zoom;
    // All layers need to be redrawn when camera moves
    this.markLayerDirty('all');
  }

  // Zoom camera at given point
  zoomAt(screenX, screenY, zoomFactor) {
    const worldBefore = this.screenToWorld(screenX, screenY);

    this.camera.zoom *= zoomFactor;
    this.camera.zoom = Math.max(
      this.camera.minZoom,
      Math.min(this.camera.maxZoom, this.camera.zoom),
    );

    const worldAfter = this.screenToWorld(screenX, screenY);
    this.camera.x += worldBefore.x - worldAfter.x;
    this.camera.y += worldBefore.y - worldAfter.y;
    
    // All layers need to be redrawn when camera zooms
    this.markLayerDirty('all');
  }

  clear() {
    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.applyCameraTransform();
  }

  clearLayer(ctx) {
    this.resetTransformForContext(ctx);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.applyCameraTransformToContext(ctx);
  }

  renderTerrainLayer(heights) {
    if (!this.layerDirty.terrain) return;
    
    this.clearLayer(this.terrainCtx);

    // Draw all terrain tiles
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        const depth = heights[y][x];
        this.terrainCtx.fillStyle = getHeightColor(depth);
        this.terrainCtx.fillRect(
          x * CONFIG.TILE_SIZE,
          y * CONFIG.TILE_SIZE,
          CONFIG.TILE_SIZE,
          CONFIG.TILE_SIZE,
        );
      }
    }

    this.layerDirty.terrain = false;
  }

  renderInfrastructureLayer(pumpsByReservoir, showChunkBoundaries = true) {
    if (!this.layerDirty.infrastructure) return;
    
    this.clearLayer(this.infrastructureCtx);

    // Draw chunk boundaries
    if (showChunkBoundaries) {
      this.infrastructureCtx.strokeStyle = "rgba(255,0,0,0.5)";
      this.infrastructureCtx.lineWidth = this.getScaledLineWidth(1);

      // Vertical lines
      for (let cx = 0; cx <= CONFIG.WORLD_W; cx += CONFIG.CHUNK_SIZE) {
        this.infrastructureCtx.beginPath();
        this.infrastructureCtx.moveTo(cx * CONFIG.TILE_SIZE, 0);
        this.infrastructureCtx.lineTo(cx * CONFIG.TILE_SIZE, CONFIG.WORLD_H * CONFIG.TILE_SIZE);
        this.infrastructureCtx.stroke();
      }

      // Horizontal lines
      for (let cy = 0; cy <= CONFIG.WORLD_H; cy += CONFIG.CHUNK_SIZE) {
        this.infrastructureCtx.beginPath();
        this.infrastructureCtx.moveTo(0, cy * CONFIG.TILE_SIZE);
        this.infrastructureCtx.lineTo(CONFIG.WORLD_W * CONFIG.TILE_SIZE, cy * CONFIG.TILE_SIZE);
        this.infrastructureCtx.stroke();
      }
    }

    // Draw pump connections
    const scaledLineWidth = this.getScaledLineWidth(2);
    const dashPattern = this.camera.zoom < 0.5 ? [10, 6] : [5, 3];

    pumpsByReservoir.forEach((pumpsInReservoir, _reservoirId) => {
      if (pumpsInReservoir.length > 1) {
        this.infrastructureCtx.strokeStyle = "red";
        this.infrastructureCtx.lineWidth = scaledLineWidth;
        this.infrastructureCtx.setLineDash(dashPattern);

        for (let i = 0; i < pumpsInReservoir.length - 1; i++) {
          const pump1 = pumpsInReservoir[i];
          const pump2 = pumpsInReservoir[i + 1];

          const x1 = pump1.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
          const y1 = pump1.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
          const x2 = pump2.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
          const y2 = pump2.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

          this.infrastructureCtx.beginPath();
          this.infrastructureCtx.moveTo(x1, y1);
          this.infrastructureCtx.lineTo(x2, y2);
          this.infrastructureCtx.stroke();
        }

        this.infrastructureCtx.setLineDash([]); // Reset to solid lines
      }
    });

    this.layerDirty.infrastructure = false;
  }

  // Get appropriate font size based on zoom level to keep text readable
  getScaledFontSize(baseFontSize = 10) {
    // Simplified scaling - only scale at extreme zoom levels
    if (this.camera.zoom < 0.5) {
      return Math.max(8, baseFontSize / this.camera.zoom);
    } else if (this.camera.zoom > 2) {
      return Math.min(16, baseFontSize);
    }
    return baseFontSize;
  }

  // Get scaled line width for better visibility at different zoom levels
  getScaledLineWidth(baseWidth = 1) {
    // Only scale line width at very low zoom levels
    return this.camera.zoom < 0.5 ? Math.max(0.5, baseWidth / this.camera.zoom) : baseWidth;
  }

  renderWaterLayer(basins) {
    if (!this.layerDirty.water) return;
    
    this.clearLayer(this.waterCtx);

    for (const [_id, basin] of basins) {
      if (basin.level <= 0) continue;
      const alpha = Math.min(0.7, 0.12 + basin.level * 0.06);
      this.waterCtx.fillStyle = `rgba(50,120,200,${alpha})`;

      basin.tiles.forEach((tileKey) => {
        const [tx, ty] = tileKey.split(",").map(Number);
        // Only draw water if it's above the terrain height
        if (basin.level > basin.height) {
          this.waterCtx.fillRect(
            tx * CONFIG.TILE_SIZE,
            ty * CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE,
          );
        }
      });
    }

    this.layerDirty.water = false;
  }

  renderInteractiveLayer(pumps, selectedReservoirId, heights, basins, labelSettings) {
    if (!this.layerDirty.interactive) return;
    
    this.clearLayer(this.interactiveCtx);

    // Draw pumps
    const scaledLineWidth = this.getScaledLineWidth(2);

    for (const pump of pumps) {
      const cx = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
      const cy = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

      // Highlight pumps in selected reservoir with a thicker circle
      if (selectedReservoirId && pump.reservoirId === selectedReservoirId) {
        this.interactiveCtx.beginPath();
        this.interactiveCtx.arc(cx, cy, CONFIG.TILE_SIZE * 1.8, 0, Math.PI * 2);
        this.interactiveCtx.strokeStyle = "rgba(255, 255, 0, 0.5)"; // Yellow highlight
        this.interactiveCtx.lineWidth = scaledLineWidth + 1;
        this.interactiveCtx.stroke();
      }

      this.interactiveCtx.beginPath();
      this.interactiveCtx.arc(cx, cy, CONFIG.TILE_SIZE * 1, 0, Math.PI * 2);
      this.interactiveCtx.strokeStyle = (pump.mode === "inlet")
        ? "rgba(200, 0, 0, 0.7)"
        : "rgba(0, 255, 0, 0.7)";
      this.interactiveCtx.lineWidth = scaledLineWidth;
      this.interactiveCtx.stroke();
    }

    // Draw labels
    const fontSize = this.getScaledFontSize();
    this.interactiveCtx.font = `${fontSize}px Arial`;
    this.interactiveCtx.textAlign = "center";
    this.interactiveCtx.textBaseline = "middle";

    // Draw depth labels
    if (labelSettings.showDepthLabels) {
      this.drawDepthLabelsToContext(this.interactiveCtx, heights);
    }

    // Draw basin labels with smart positioning
    if (labelSettings.showBasinLabels) {
      this.basinLabelManager.draw(this.interactiveCtx, basins, heights, pumps, this.camera.zoom);
    }

    // Draw pump labels
    if (labelSettings.showPumpLabels) {
      this.drawPumpLabelsToContext(this.interactiveCtx, pumps);
    }

    this.layerDirty.interactive = false;
  }

  renderHighlightLayer(basinManager, highlightedBasin) {
    if (!this.layerDirty.highlight) return;
    
    this.clearLayer(this.highlightCtx);

    // Only render if there's a basin to highlight
    if (basinManager && highlightedBasin) {
      // Use optimized tile lookup from basin data instead of scanning all world tiles
      const basin = basinManager.basins.get(highlightedBasin);
      if (basin) {
        this.highlightCtx.fillStyle = "rgba(255, 255, 0, 0.5)";
        this.highlightCtx.strokeStyle = "orange";
        this.highlightCtx.lineWidth = this.getScaledLineWidth(3);

        // Draw highlight for each tile in the basin
        basin.tiles.forEach((tileKey) => {
          const [x, y] = tileKey.split(",").map(Number);
          const params = [
            x * CONFIG.TILE_SIZE,
            y * CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE,
          ];
          this.highlightCtx.fillRect(...params);
          this.highlightCtx.strokeRect(...params);
        });
      }
    }

    this.layerDirty.highlight = false;
  }

  drawDepthLabelsToContext(ctx, heights) {
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      for (let x = 0; x < CONFIG.WORLD_W; x++) {
        const depth = heights[y][x];
        if (depth > 0) { // Only show depth for non-land tiles
          const labelX = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
          const labelY = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

          // Choose text color based on background
          const grayValue = Math.floor(220 - (depth / CONFIG.MAX_DEPTH) * 180);
          if (grayValue > 130) {
            ctx.strokeStyle = "white";
            ctx.fillStyle = "black";
          } else {
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
          }

          ctx.lineWidth = 1;
          ctx.strokeText(depth.toString(), labelX, labelY);
          ctx.fillText(depth.toString(), labelX, labelY);
        }
      }
    }
  }

  drawPumpLabelsToContext(ctx, pumps) {
    const fontSize = this.getScaledFontSize();
    ctx.font = `${fontSize}px Arial`;
    const scaledLineWidth = this.getScaledLineWidth(1);

    // Group pumps by reservoir to get proper pump indices per reservoir
    const pumpsByReservoir = new Map();
    pumps.forEach((pump, globalIndex) => {
      if (!pumpsByReservoir.has(pump.reservoirId)) {
        pumpsByReservoir.set(pump.reservoirId, []);
      }
      pumpsByReservoir.get(pump.reservoirId).push({ ...pump, globalIndex });
    });

    // Draw labels for each pump with proper P{reservoirId}.{reservoirPumpIndex} naming
    pumpsByReservoir.forEach((reservoirPumps, _reservoirId) => {
      reservoirPumps.forEach((pump, reservoirPumpIndex) => {
        const labelX = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const labelY = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 - CONFIG.TILE_SIZE * 2;

        const pumpText = `P${pump.reservoirId || "?"}.${reservoirPumpIndex + 1}`;

        ctx.strokeStyle = "white";
        ctx.fillStyle = (pump.mode === "inlet") ? "green" : "red";

        ctx.lineWidth = scaledLineWidth * 2;
        ctx.strokeText(pumpText, labelX, labelY);
        ctx.lineWidth = scaledLineWidth;
        ctx.fillText(pumpText, labelX, labelY);
      });
    });
  }

  // New optimized render method that uses layered rendering
  renderOptimized(gameState, uiSettings, selectedReservoirId, brushOverlay, brushCenter, brushSize, selectedDepth) {
    // Render each layer only if it's dirty
    this.renderTerrainLayer(gameState.getHeights());

    this.renderInfrastructureLayer(
      gameState.getPumpsByReservoir(),
      true // show chunk boundaries
    );

    this.renderWaterLayer(gameState.getBasins());

    this.renderHighlightLayer(
      gameState.getBasinManager(), 
      gameState.getHighlightedBasin()
    );

    this.renderInteractiveLayer(
      gameState.getPumps(),
      selectedReservoirId,
      gameState.getHeights(),
      gameState.getBasins(),
      uiSettings
    );

    // Clear main canvas and reset transform for compositing
    this.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Composite all layers to main canvas without any additional transforms
    // (the layers already have the camera transform applied)
    this.ctx.drawImage(this.terrainCanvas, 0, 0);
    this.ctx.drawImage(this.waterCanvas, 0, 0);
    this.ctx.drawImage(this.infrastructureCanvas, 0, 0);
    this.ctx.drawImage(this.highlightCanvas, 0, 0);
    this.ctx.drawImage(this.interactiveCanvas, 0, 0);

    // Apply camera transform for UI overlays (these need to move with the camera)
    this.applyCameraTransform();
    
    // Draw UI overlays directly to main canvas (these change frequently)
    this.drawBrushOverlay(brushOverlay, selectedDepth);
    if (brushCenter) {
      this.drawBrushPreview(brushCenter.x, brushCenter.y, brushSize);
    }
  }

  // Legacy method for backward compatibility
  drawTerrain(heights, basinManager = null, highlightedBasin = null) {
    this.markLayerDirty('terrain');
    this.renderTerrainLayer(heights);
    
    // Handle highlighting if provided (legacy support)
    if (basinManager && highlightedBasin) {
      this.markLayerDirty('highlight');
      this.renderHighlightLayer(basinManager, highlightedBasin);
    }
  }

  // Legacy method for backward compatibility
  drawWater(basins) {
    this.markLayerDirty('water');
    this.renderWaterLayer(basins);
  }

  // Legacy method for backward compatibility
  drawPumps(_pumps, _selectedReservoirId) {
    this.markLayerDirty('interactive');
    // Will be handled in renderInteractiveLayer
  }

  // Legacy method for backward compatibility
  drawPumpConnections(_pumpsByReservoir) {
    this.markLayerDirty('infrastructure');
    // Will be handled in renderInfrastructureLayer
  }

  // Legacy method for backward compatibility
  drawChunkBoundaries() {
    this.markLayerDirty('infrastructure');
    // Will be handled in renderInfrastructureLayer
  }

  // Legacy method for backward compatibility
  drawLabels(_heights, _basins, _pumps, _labelSettings) {
    this.markLayerDirty('interactive');
    // Will be handled in renderInteractiveLayer
  }

  // Public methods to mark layers dirty for specific changes
  onTerrainChanged() {
    this.markLayerDirty('terrain');
  }

  onWaterChanged() {
    this.markLayerDirty('water');
  }

  onPumpsChanged() {
    this.markLayerDirty('infrastructure');
    this.markLayerDirty('interactive');
  }

  onLabelsToggled() {
    this.markLayerDirty('interactive');
  }

  onBasinHighlightChanged() {
    this.markLayerDirty('highlight');
  }

  drawBrushOverlay(overlayMap, selectedDepth) {
    if (overlayMap.size === 0) return;

    // Set overlay style using constants
    this.ctx.fillStyle = UI_CONSTANTS.BRUSH.OVERLAY_FILL;
    this.ctx.strokeStyle = getHeightColor(selectedDepth);
    this.ctx.lineWidth = this.getScaledLineWidth(UI_CONSTANTS.BRUSH.OVERLAY_LINE_WIDTH);

    // Draw overlay tiles
    for (const [key, _depth] of overlayMap) {
      const [x, y] = key.split(",").map((n) => parseInt(n));

      const tileX = x * CONFIG.TILE_SIZE;
      const tileY = y * CONFIG.TILE_SIZE;

      // Fill with semi-transparent white
      this.ctx.fillRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

      // Stroke with target depth color
      this.ctx.strokeRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    }
  }

  drawBrushPreview(centerX, centerY, brushSize) {
    if (centerX < 0 || centerY < 0 || centerX >= CONFIG.WORLD_W || centerY >= CONFIG.WORLD_H) {
      return;
    }

    const radius = Math.floor(brushSize / 2);

    this.ctx.strokeStyle = UI_CONSTANTS.BRUSH.PREVIEW_COLOR;
    this.ctx.lineWidth = this.getScaledLineWidth(1);
    this.ctx.setLineDash(UI_CONSTANTS.BRUSH.PREVIEW_DASH);

    // Draw preview tiles
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = centerX + dx;
        const y = centerY + dy;

        // Check if tile is within world bounds
        if (x >= 0 && y >= 0 && x < CONFIG.WORLD_W && y < CONFIG.WORLD_H) {
          // For circular brush, check distance
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const tileX = x * CONFIG.TILE_SIZE;
            const tileY = y * CONFIG.TILE_SIZE;

            this.ctx.strokeRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
          }
        }
      }
    }

    // Reset line dash
    this.ctx.setLineDash([]);
  }
}

export class LegendRenderer {
  static selectedDepth = 0;

  static createLegend() {
    const legendItems = document.getElementById("legendItems");
    if (!legendItems) return;

    legendItems.innerHTML = "";

    for (let depth = 0; depth <= CONFIG.MAX_DEPTH; depth++) {
      const item = document.createElement("div");
      item.className = CSS_CLASSES.LEGEND_ITEM;
      item.id = `legend-item-${depth}`;

      const colorBox = document.createElement("div");
      colorBox.className = CSS_CLASSES.LEGEND_COLOR;
      colorBox.style.backgroundColor = getHeightColor(depth);

      const label = document.createElement("span");
      label.textContent = `${depth}`;

      item.appendChild(label);
      item.appendChild(colorBox);
      legendItems.appendChild(item);
    }
  }

  static updateSelectedDepth(depth) {
    this.selectedDepth = depth;

    // Remove previous selection styling by removing CSS class
    const allItems = document.querySelectorAll(`.${CSS_CLASSES.LEGEND_ITEM}`);
    allItems.forEach((item) => {
      item.classList.remove(CSS_CLASSES.LEGEND_ITEM_SELECTED);
    });

    // Add selection styling to current depth using CSS class
    const selectedItem = document.getElementById(`legend-item-${depth}`);
    if (selectedItem) {
      selectedItem.classList.add(CSS_CLASSES.LEGEND_ITEM_SELECTED);
    }
  }
}
