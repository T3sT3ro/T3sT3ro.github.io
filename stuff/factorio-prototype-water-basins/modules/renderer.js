// Rendering and drawing functionality

import { CONFIG } from './config.js';
import { BasinLabelManager } from './labels.js';
import { UI_CONSTANTS, CSS_CLASSES } from './constants.js';

export function getHeightColor(depth) {
    // Only depth 0 = surface (brown), all others = gray
    if (depth === 0) {
        return 'rgb(139, 69, 19)'; // Brown for surface only
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
            maxZoom: 4
        };
    }

    // Apply camera transformation to context
    applyCameraTransform() {
        this.ctx.setTransform(
            this.camera.zoom, 0, 0, this.camera.zoom,
            -this.camera.x * this.camera.zoom,
            -this.camera.y * this.camera.zoom
        );
    }

    // Reset camera transformation
    resetTransform() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.camera.zoom) + this.camera.x,
            y: (screenY / this.camera.zoom) + this.camera.y
        };
    }

    // Pan camera by given offset
    pan(deltaX, deltaY) {
        this.camera.x += deltaX / this.camera.zoom;
        this.camera.y += deltaY / this.camera.zoom;
    }

    // Zoom camera at given point
    zoomAt(screenX, screenY, zoomFactor) {
        const worldBefore = this.screenToWorld(screenX, screenY);

        this.camera.zoom *= zoomFactor;
        this.camera.zoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, this.camera.zoom));

        const worldAfter = this.screenToWorld(screenX, screenY);
        this.camera.x += (worldBefore.x - worldAfter.x);
        this.camera.y += (worldBefore.y - worldAfter.y);
    }

    clear() {
        this.resetTransform();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyCameraTransform();
    }

    drawTerrain(heights, basinManager = null, highlightedBasin = null) {
        // Draw all terrain tiles first
        for (let y = 0; y < CONFIG.WORLD_H; y++) {
            for (let x = 0; x < CONFIG.WORLD_W; x++) {
                const depth = heights[y][x];
                this.ctx.fillStyle = getHeightColor(depth);
                this.ctx.fillRect(
                    x * CONFIG.TILE_SIZE,
                    y * CONFIG.TILE_SIZE,
                    CONFIG.TILE_SIZE,
                    CONFIG.TILE_SIZE
                );
            }
        }

        // Draw highlight strokes for highlighted basin
        if (basinManager && highlightedBasin) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.strokeStyle = 'orange';
            this.ctx.lineWidth = this.getScaledLineWidth(3);

            for (let y = 0; y < CONFIG.WORLD_H; y++) {
                for (let x = 0; x < CONFIG.WORLD_W; x++) {
                    if (basinManager.basinIdOf[y][x] === highlightedBasin) {
                        const params = [
                            x * CONFIG.TILE_SIZE,
                            y * CONFIG.TILE_SIZE,
                            CONFIG.TILE_SIZE,
                            CONFIG.TILE_SIZE
                        ];
                        this.ctx.fillRect(...params);
                        this.ctx.strokeRect(...params);
                    }
                }
            }
        }
    }

    drawWater(basins) {
        for (let [id, basin] of basins) {
            if (basin.level <= 0) continue;
            const alpha = Math.min(0.7, 0.12 + basin.level * 0.06);
            this.ctx.fillStyle = `rgba(50,120,200,${alpha})`;

            basin.tiles.forEach(tileKey => {
                const [tx, ty] = tileKey.split(',').map(Number);
                // Only draw water if it's above the terrain height
                if (basin.level > basin.height) {
                    this.ctx.fillRect(
                        tx * CONFIG.TILE_SIZE,
                        ty * CONFIG.TILE_SIZE,
                        CONFIG.TILE_SIZE,
                        CONFIG.TILE_SIZE
                    );
                }
            });
        }
    }

    drawPumps(pumps, selectedReservoirId) {
        const scaledLineWidth = this.getScaledLineWidth(2);

        for (let pump of pumps) {
            const cx = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const cy = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

            // Highlight pumps in selected reservoir with a thicker circle
            if (selectedReservoirId && pump.reservoirId === selectedReservoirId) {
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, CONFIG.TILE_SIZE * 1.8, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow highlight
                this.ctx.lineWidth = scaledLineWidth + 1;
                this.ctx.stroke();
            }

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, CONFIG.TILE_SIZE * 1, 0, Math.PI * 2);
            this.ctx.strokeStyle = (pump.mode === 'inlet') ? 'rgba(200, 0, 0, 0.7)' : 'rgba(0, 255, 0, 0.7)';
            this.ctx.lineWidth = scaledLineWidth;
            this.ctx.stroke();
        }
    }

    drawPumpConnections(pumpsByReservoir) {
        // Draw lines between pumps in the same reservoir (if more than 1)
        const scaledLineWidth = this.getScaledLineWidth(2);
        const dashPattern = this.camera.zoom < 0.5 ? [10, 6] : [5, 3];

        pumpsByReservoir.forEach((pumpsInReservoir, reservoirId) => {
            if (pumpsInReservoir.length > 1) {
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = scaledLineWidth;
                this.ctx.setLineDash(dashPattern);

                for (let i = 0; i < pumpsInReservoir.length - 1; i++) {
                    const pump1 = pumpsInReservoir[i];
                    const pump2 = pumpsInReservoir[i + 1];

                    const x1 = pump1.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const y1 = pump1.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const x2 = pump2.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const y2 = pump2.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }

                this.ctx.setLineDash([]); // Reset to solid lines
            }
        });
    }

    drawChunkBoundaries() {
        this.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        this.ctx.lineWidth = this.getScaledLineWidth(1);

        // Vertical lines
        for (let cx = 0; cx <= CONFIG.WORLD_W; cx += CONFIG.CHUNK_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(cx * CONFIG.TILE_SIZE, 0);
            this.ctx.lineTo(cx * CONFIG.TILE_SIZE, CONFIG.WORLD_H * CONFIG.TILE_SIZE);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let cy = 0; cy <= CONFIG.WORLD_H; cy += CONFIG.CHUNK_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, cy * CONFIG.TILE_SIZE);
            this.ctx.lineTo(CONFIG.WORLD_W * CONFIG.TILE_SIZE, cy * CONFIG.TILE_SIZE);
            this.ctx.stroke();
        }
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

    drawLabels(heights, basins, pumps, labelSettings) {
        const fontSize = this.getScaledFontSize();
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw depth labels (original system)
        if (labelSettings.showDepthLabels) {
            this.drawDepthLabels(heights);
        }

        // Draw basin labels with smart positioning
        if (labelSettings.showBasinLabels) {
            this.basinLabelManager.draw(this.ctx, basins, heights, pumps, this.camera.zoom);
        }

        // Draw pump labels (original system)
        if (labelSettings.showPumpLabels) {
            this.drawPumpLabels(pumps);
        }
    }

    drawDepthLabels(heights) {
        for (let y = 0; y < CONFIG.WORLD_H; y++) {
            for (let x = 0; x < CONFIG.WORLD_W; x++) {
                const depth = heights[y][x];
                if (depth > 0) { // Only show depth for non-land tiles
                    const labelX = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const labelY = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

                    // Choose text color based on background
                    const grayValue = Math.floor(220 - (depth / CONFIG.MAX_DEPTH) * 180);
                    if (grayValue > 130) {
                        this.ctx.strokeStyle = 'white';
                        this.ctx.fillStyle = 'black';
                    } else {
                        this.ctx.strokeStyle = 'black';
                        this.ctx.fillStyle = 'white';
                    }

                    this.ctx.lineWidth = 1;
                    this.ctx.strokeText(depth.toString(), labelX, labelY);
                    this.ctx.fillText(depth.toString(), labelX, labelY);
                }
            }
        }
    }

    drawPumpLabels(pumps) {
        const fontSize = this.getScaledFontSize();
        this.ctx.font = `${fontSize}px Arial`;
        const scaledLineWidth = this.getScaledLineWidth(1);

        for (let i = 0; i < pumps.length; i++) {
            const pump = pumps[i];
            const labelX = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const labelY = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 - CONFIG.TILE_SIZE * 2;

            const pumpText = `P${i} R${pump.reservoirId || '?'}`;

            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = (pump.mode === 'inlet') ? 'green' : 'red';

            this.ctx.lineWidth = scaledLineWidth * 2;
            this.ctx.strokeText(pumpText, labelX, labelY);
            this.ctx.lineWidth = scaledLineWidth;
            this.ctx.fillText(pumpText, labelX, labelY);
        }
    }

    drawBrushOverlay(overlayMap, selectedDepth) {
        if (overlayMap.size === 0) return;

        // Set overlay style using constants
        this.ctx.fillStyle = UI_CONSTANTS.BRUSH.OVERLAY_FILL;
        this.ctx.strokeStyle = getHeightColor(selectedDepth);
        this.ctx.lineWidth = this.getScaledLineWidth(UI_CONSTANTS.BRUSH.OVERLAY_LINE_WIDTH);

        // Draw overlay tiles
        for (const [key, depth] of overlayMap) {
            const [x, y] = key.split(',').map(n => parseInt(n));
            
            const tileX = x * CONFIG.TILE_SIZE;
            const tileY = y * CONFIG.TILE_SIZE;
            
            // Fill with semi-transparent white
            this.ctx.fillRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            
            // Stroke with target depth color
            this.ctx.strokeRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        }
    }

    drawBrushPreview(centerX, centerY, brushSize) {
        if (centerX < 0 || centerY < 0 || centerX >= CONFIG.WORLD_W || centerY >= CONFIG.WORLD_H) return;

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
        const legendItems = document.getElementById('legendItems');
        if (!legendItems) return;

        legendItems.innerHTML = '';

        for (let depth = 0; depth <= CONFIG.MAX_DEPTH; depth++) {
            const item = document.createElement('div');
            item.className = CSS_CLASSES.LEGEND_ITEM;
            item.id = `legend-item-${depth}`;

            const colorBox = document.createElement('div');
            colorBox.className = CSS_CLASSES.LEGEND_COLOR;
            colorBox.style.backgroundColor = getHeightColor(depth);

            const label = document.createElement('span');
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
        allItems.forEach(item => {
            item.classList.remove(CSS_CLASSES.LEGEND_ITEM_SELECTED);
        });

        // Add selection styling to current depth using CSS class
        const selectedItem = document.getElementById(`legend-item-${depth}`);
        if (selectedItem) {
            selectedItem.classList.add(CSS_CLASSES.LEGEND_ITEM_SELECTED);
        }
    }
}
