// Simple deterministic label positioning system for basin labels only

import { CONFIG } from './config.js';

export class BasinLabelManager {
    constructor() {
        this.basinLabels = new Map(); // basinId -> {anchorX, anchorY, labelX, labelY, text}
        this.lastBasinHash = null;
    }

    // Generate deterministic positions for basin labels
    generateBasinLabels(basins, heights, pumps = []) {
        const basinHash = this.createBasinHash(basins, pumps);
        if (basinHash === this.lastBasinHash) {
            return; // No change, reuse existing positions
        }
        
        this.lastBasinHash = basinHash;
        this.basinLabels.clear();
        
        const labels = [];
        const lineLength = 30;
        
        // Create pump obstacle positions
        const obstacles = [];
        pumps.forEach((pump, index) => {
            const pumpLabelX = pump.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const pumpLabelY = pump.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2 - CONFIG.TILE_SIZE * 2;
            obstacles.push({ x: pumpLabelX, y: pumpLabelY, type: 'pump' });
        });
        
        // Create initial label positions
        basins.forEach((basin, id) => {
            const tiles = Array.from(basin.tiles);
            if (tiles.length === 0) return;
            
            // Find a representative tile that belongs to this basin (not centroid)
            // Use the first tile, or preferably one close to the center if basin is large
            let representativeTile;
            if (tiles.length === 1) {
                representativeTile = tiles[0];
            } else {
                // Calculate centroid to find the tile closest to center
                let sumX = 0, sumY = 0;
                tiles.forEach(tileKey => {
                    const [x, y] = tileKey.split(',').map(Number);
                    sumX += x;
                    sumY += y;
                });
                const centerX = sumX / tiles.length;
                const centerY = sumY / tiles.length;
                
                // Find the actual tile closest to the centroid
                let minDistance = Infinity;
                tiles.forEach(tileKey => {
                    const [x, y] = tileKey.split(',').map(Number);
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        representativeTile = tileKey;
                    }
                });
            }
            
            const [tileX, tileY] = representativeTile.split(',').map(Number);
            const anchorX = tileX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const anchorY = tileY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            // Start label at origin point - force simulation will push it away naturally
            labels.push({
                id: id,
                anchorX: anchorX,
                anchorY: anchorY,
                labelX: anchorX,
                labelY: anchorY,
                text: id,
                lineLength: 30 // Will be adjusted during simulation
            });
        });
        
        // Apply repulsion to avoid overlaps (one-time calculation)
        const minLineLength = 30;
        const maxLineLength = 60;
        
        for (let iteration = 0; iteration < 20; iteration++) {
            let moved = false;
            
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];
                let pushX = 0, pushY = 0;
                
                // Repulsion from other basin labels
                for (let j = 0; j < labels.length; j++) {
                    if (i === j) continue;
                    
                    const other = labels[j];
                    const dx = label.labelX - other.labelX;
                    const dy = label.labelY - other.labelY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const minDistance = 25; // Minimum distance between basin labels
                    if (distance < minDistance && distance > 0) {
                        const pushDistance = (minDistance - distance) * 0.5;
                        pushX += (dx / distance) * pushDistance;
                        pushY += (dy / distance) * pushDistance;
                        moved = true;
                    }
                }
                
                // Repulsion from other basin label line endpoints
                for (let j = 0; j < labels.length; j++) {
                    if (i === j) continue;
                    
                    const other = labels[j];
                    const dx = label.labelX - other.labelX;
                    const dy = label.labelY - other.labelY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const minLineDistance = 20;
                    if (distance < minLineDistance && distance > 0) {
                        const pushDistance = (minLineDistance - distance) * 0.3;
                        pushX += (dx / distance) * pushDistance;
                        pushY += (dy / distance) * pushDistance;
                        moved = true;
                    }
                }
                
                // Repulsion from pump labels
                for (const obstacle of obstacles) {
                    const dx = label.labelX - obstacle.x;
                    const dy = label.labelY - obstacle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const minObstacleDistance = 30; // Keep further away from pump labels
                    if (distance < minObstacleDistance && distance > 0) {
                        const pushDistance = (minObstacleDistance - distance) * 0.4;
                        pushX += (dx / distance) * pushDistance;
                        pushY += (dy / distance) * pushDistance;
                        moved = true;
                    }
                }
                
                // Apply accumulated push
                label.labelX += pushX;
                label.labelY += pushY;
                
                // Keep labels within canvas bounds
                const margin = 15;
                const maxX = CONFIG.WORLD_W * CONFIG.TILE_SIZE - margin;
                const maxY = CONFIG.WORLD_H * CONFIG.TILE_SIZE - margin;
                
                label.labelX = Math.max(margin, Math.min(maxX, label.labelX));
                label.labelY = Math.max(margin, Math.min(maxY, label.labelY));
                
                // Calculate current distance from anchor
                const anchorDx = label.labelX - label.anchorX;
                const anchorDy = label.labelY - label.anchorY;
                const anchorDistance = Math.sqrt(anchorDx * anchorDx + anchorDy * anchorDy);
                
                // Adjust line length within bounds and update position
                if (anchorDistance > 0) {
                    // Determine optimal line length based on current position
                    let targetLength = Math.max(minLineLength, Math.min(maxLineLength, anchorDistance));
                    
                    // If there's strong repulsion, allow longer lines up to max
                    if (anchorDistance > maxLineLength) {
                        targetLength = maxLineLength;
                    }
                    
                    // Update label position to maintain target line length
                    label.labelX = label.anchorX + (anchorDx / anchorDistance) * targetLength;
                    label.labelY = label.anchorY + (anchorDy / anchorDistance) * targetLength;
                    label.lineLength = targetLength;
                } else {
                    // If label is exactly at anchor, give it a small push based on basin ID
                    const hash = this.hashString(label.id);
                    const angle = (hash % 8) * (Math.PI / 4);
                    label.labelX = label.anchorX + Math.cos(angle) * minLineLength;
                    label.labelY = label.anchorY + Math.sin(angle) * minLineLength;
                    label.lineLength = minLineLength;
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
    draw(ctx, basins, heights, pumps = []) {
        this.generateBasinLabels(basins, heights, pumps);
        
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
    
    createBasinHash(basins, pumps = []) {
        // Create hash to detect basin and pump changes
        let hash = `count:${basins.size}`;
        basins.forEach((basin, id) => {
            hash += `|${id}:${basin.tiles.size}`;
        });
        
        // Include pump positions in hash since they affect label positioning
        hash += `|pumps:${pumps.length}`;
        pumps.forEach((pump, index) => {
            hash += `|p${index}:${pump.x},${pump.y}`;
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
