// Rendering and drawing functionality

import { CONFIG } from './config.js';
import { BasinLabelManager } from './labels.js';

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
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTerrain(heights) {
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
        for (let pump of pumps) {
            const cx = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const cy = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            // Highlight pumps in selected reservoir with a thicker circle
            if (selectedReservoirId && pump.reservoirId === selectedReservoirId) {
                this.ctx.beginPath(); 
                this.ctx.arc(cx, cy, CONFIG.TILE_SIZE * 1.8, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow highlight
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
            
            this.ctx.beginPath(); 
            this.ctx.arc(cx, cy, CONFIG.TILE_SIZE * 1, 0, Math.PI * 2);
            this.ctx.strokeStyle = (pump.mode === 'inlet') ? 'rgba(200, 0, 0, 0.7)' : 'rgba(0, 255, 0, 0.7)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        }
    }

    drawPumpConnections(pumpsByReservoir) {
        // Draw lines between pumps in the same reservoir (if more than 1)
        pumpsByReservoir.forEach((pumpsInReservoir) => {
            if (pumpsInReservoir.length > 1) {
                this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.6)'; // Blue connections
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]); // Dashed line
                
                // Connect pumps in a chain (not all-to-all to avoid clutter)
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
                this.ctx.lineWidth = 1;
            }
        });
    }

    drawChunkBoundaries() {
        this.ctx.strokeStyle = 'rgba(255,0,0)';
        
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

    drawLabels(heights, basins, pumps, labelSettings) {
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw depth labels (original system)
        if (labelSettings.showDepthLabels) {
            this.drawDepthLabels(heights);
        }
        
        // Draw basin labels with smart positioning
        if (labelSettings.showBasinLabels) {
            this.basinLabelManager.draw(this.ctx, basins, heights, pumps);
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
        for (let i = 0; i < pumps.length; i++) {
            const pump = pumps[i];
            const labelX = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const labelY = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 - CONFIG.TILE_SIZE * 2;
            
            const pumpText = `P${i} R${pump.reservoirId || '?'}`;
            
            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = (pump.mode === 'inlet') ? 'green' : 'red';
            
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(pumpText, labelX, labelY);
            this.ctx.lineWidth = 1;
            this.ctx.fillText(pumpText, labelX, labelY);
        }
    }

    drawBasinHighlight(basins, highlightedBasin) {
        basins.forEach((basin, id) => {
            if (highlightedBasin === id) {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow highlight
                this.ctx.strokeStyle = 'orange';
                this.ctx.lineWidth = 3;
                
                // Draw highlight around basin area
                basin.tiles.forEach(tileKey => {
                    const [tx, ty] = tileKey.split(',').map(Number);
                    const x = tx * CONFIG.TILE_SIZE;
                    const y = ty * CONFIG.TILE_SIZE;
                    this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    this.ctx.strokeRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                });
                
                this.ctx.restore();
            }
        });
    }
}

export class LegendRenderer {
    static createLegend() {
        const legendItems = document.getElementById('legendItems');
        if (!legendItems) return;
        
        legendItems.innerHTML = '';
        
        for (let depth = 0; depth <= CONFIG.MAX_DEPTH; depth++) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = getHeightColor(depth);
            
            const label = document.createElement('span');
            label.textContent = `${depth}`;
            
            item.appendChild(label);
            item.appendChild(colorBox);
            legendItems.appendChild(item);
        }
    }
}
