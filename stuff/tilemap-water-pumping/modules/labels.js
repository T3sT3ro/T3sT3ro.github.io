// Simple deterministic label positioning system for basin labels only

import { CONFIG } from './config.js';

export class BasinLabelManager {
    constructor() {
        this.basinLabels = new Map(); // basinId -> {anchorX, anchorY, labelX, labelY, text}
        this.lastBasinHash = null;
    }

    // Generate deterministic positions for basin labels
    generateBasinLabels(basins, heights) {
        const basinHash = this.createBasinHash(basins);
        if (basinHash === this.lastBasinHash) {
            return; // No change, reuse existing positions
        }
        
        this.lastBasinHash = basinHash;
        this.basinLabels.clear();
        
        const labels = [];
        const lineLength = 30;
        
        // Create initial label positions
        basins.forEach((basin, id) => {
            const tiles = Array.from(basin.tiles);
            if (tiles.length === 0) return;
            
            // Calculate centroid
            let sumX = 0, sumY = 0;
            tiles.forEach(tileKey => {
                const [x, y] = tileKey.split(',').map(Number);
                sumX += x;
                sumY += y;
            });
            const centerX = Math.round(sumX / tiles.length);
            const centerY = Math.round(sumY / tiles.length);
            
            const anchorX = centerX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const anchorY = centerY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            // Initial label position with deterministic offset based on basin ID
            const hash = this.hashString(id);
            const angle = (hash % 8) * (Math.PI / 4); // 8 directions
            const labelX = anchorX + Math.cos(angle) * lineLength;
            const labelY = anchorY + Math.sin(angle) * lineLength;
            
            labels.push({
                id: id,
                anchorX: anchorX,
                anchorY: anchorY,
                labelX: labelX,
                labelY: labelY,
                text: id
            });
        });
        
        // Apply simple repulsion to avoid overlaps (one-time calculation)
        for (let iteration = 0; iteration < 10; iteration++) {
            let moved = false;
            
            for (let i = 0; i < labels.length; i++) {
                for (let j = i + 1; j < labels.length; j++) {
                    const label1 = labels[i];
                    const label2 = labels[j];
                    
                    const dx = label2.labelX - label1.labelX;
                    const dy = label2.labelY - label1.labelY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const minDistance = 25; // Minimum distance between labels
                    if (distance < minDistance && distance > 0) {
                        const pushDistance = (minDistance - distance) / 2;
                        const pushX = (dx / distance) * pushDistance;
                        const pushY = (dy / distance) * pushDistance;
                        
                        label1.labelX -= pushX;
                        label1.labelY -= pushY;
                        label2.labelX += pushX;
                        label2.labelY += pushY;
                        
                        moved = true;
                    }
                }
                
                // Keep labels within canvas bounds
                const margin = 15;
                const maxX = CONFIG.WORLD_W * CONFIG.TILE_SIZE - margin;
                const maxY = CONFIG.WORLD_H * CONFIG.TILE_SIZE - margin;
                
                labels[i].labelX = Math.max(margin, Math.min(maxX, labels[i].labelX));
                labels[i].labelY = Math.max(margin, Math.min(maxY, labels[i].labelY));
                
                // Maintain fixed line length from anchor
                const anchorDx = labels[i].labelX - labels[i].anchorX;
                const anchorDy = labels[i].labelY - labels[i].anchorY;
                const anchorDistance = Math.sqrt(anchorDx * anchorDx + anchorDy * anchorDy);
                
                if (anchorDistance > 0) {
                    labels[i].labelX = labels[i].anchorX + (anchorDx / anchorDistance) * lineLength;
                    labels[i].labelY = labels[i].anchorY + (anchorDy / anchorDistance) * lineLength;
                }
            }
            
            if (!moved) break; // Converged early
        }
        
        // Store final positions
        labels.forEach(label => {
            this.basinLabels.set(label.id, label);
        });
    }

    // Draw basin labels with connecting lines
    draw(ctx, basins, heights) {
        this.generateBasinLabels(basins, heights);
        
        if (this.basinLabels.size === 0) return;
        
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw connecting lines
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        this.basinLabels.forEach(label => {
            ctx.beginPath();
            ctx.moveTo(label.anchorX, label.anchorY);
            ctx.lineTo(label.labelX, label.labelY);
            ctx.stroke();
        });
        
        // Draw anchor dots
        ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        this.basinLabels.forEach(label => {
            ctx.beginPath();
            ctx.arc(label.anchorX, label.anchorY, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels (semi-transparent, no outline)
        this.basinLabels.forEach(label => {
            // Get the height at the center to determine text color
            const centerX = Math.round(label.anchorX / CONFIG.TILE_SIZE);
            const centerY = Math.round(label.anchorY / CONFIG.TILE_SIZE);
            const centerHeight = heights[centerY] ? heights[centerY][centerX] : 0;
            
            // Choose semi-transparent text color based on background
            let textColor;
            if (centerHeight === 0) {
                textColor = 'rgba(255, 255, 255, 0.9)';
            } else {
                const grayValue = Math.floor(220 - (centerHeight / CONFIG.MAX_DEPTH) * 180);
                if (grayValue > 130) {
                    textColor = 'rgba(0, 0, 0, 0.8)';
                } else {
                    textColor = 'rgba(255, 255, 255, 0.9)';
                }
            }
            
            ctx.fillStyle = textColor;
            ctx.fillText(label.text, label.labelX, label.labelY);
        });
    }
    
    createBasinHash(basins) {
        // Create hash to detect basin changes
        let hash = `count:${basins.size}`;
        basins.forEach((basin, id) => {
            hash += `|${id}:${basin.tiles.size}`;
        });
        return hash;
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}
