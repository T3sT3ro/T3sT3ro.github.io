// UI controls and event handling

import { CONFIG } from './config.js';

export class UISettings {
    constructor() {
        this.loadSettings();
    }

    loadSettings() {
        // Load label control settings
        const showDepthLabels = localStorage.getItem('showDepthLabels');
        const showPumpLabels = localStorage.getItem('showPumpLabels');
        const showBasinLabels = localStorage.getItem('showBasinLabels');
        
        this.showDepthLabels = showDepthLabels !== null ? showDepthLabels === 'true' : true;
        this.showPumpLabels = showPumpLabels !== null ? showPumpLabels === 'true' : true;
        this.showBasinLabels = showBasinLabels !== null ? showBasinLabels === 'true' : false;
        
        this.updateUI();
    }

    saveSettings() {
        localStorage.setItem('showDepthLabels', this.showDepthLabels.toString());
        localStorage.setItem('showPumpLabels', this.showPumpLabels.toString());
        localStorage.setItem('showBasinLabels', this.showBasinLabels.toString());
    }

    updateUI() {
        const showDepthLabelsEl = document.getElementById('showDepthLabels');
        const showPumpLabelsEl = document.getElementById('showPumpLabels');
        const showBasinLabelsEl = document.getElementById('showBasinLabels');
        
        if (showDepthLabelsEl) showDepthLabelsEl.checked = this.showDepthLabels;
        if (showPumpLabelsEl) showPumpLabelsEl.checked = this.showPumpLabels;
        if (showBasinLabelsEl) showBasinLabelsEl.checked = this.showBasinLabels;
    }

    toggleDepthLabels() {
        this.showDepthLabels = !this.showDepthLabels;
        this.saveSettings();
    }

    togglePumpLabels() {
        this.showPumpLabels = !this.showPumpLabels;
        this.saveSettings();
    }

    toggleBasinLabels() {
        this.showBasinLabels = !this.showBasinLabels;
        this.saveSettings();
    }
}

export class NoiseControlUI {
    constructor(noiseSettings, onSettingsChange) {
        this.noiseSettings = noiseSettings;
        this.onSettingsChange = onSettingsChange;
    }

    createOctaveControls() {
        const container = document.getElementById('octaveControls');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < this.noiseSettings.octaves; i++) {
            const octaveDiv = document.createElement('div');
            octaveDiv.className = 'octave-controls';
            
            const title = document.createElement('h5');
            title.textContent = `Octave ${i + 1}`;
            octaveDiv.appendChild(title);
            
            // Get settings for this octave
            const settings = this.noiseSettings.octaveSettings[i] || {
                frequency: this.noiseSettings.baseFreq * Math.pow(2, i),
                amplitude: Math.pow(this.noiseSettings.persistence, i)
            };
            
            // Frequency control
            const freqLabel = document.createElement('label');
            freqLabel.innerHTML = `Frequency: <input id="octaveFreq${i}" type="range" min="0.001" max="0.5" step="0.001" value="${settings.frequency.toFixed(3)}"><span class="value-display" id="octaveFreq${i}Value">${settings.frequency.toFixed(3)}</span>`;
            octaveDiv.appendChild(freqLabel);
            
            // Amplitude control
            const ampLabel = document.createElement('label');
            ampLabel.innerHTML = `Amplitude: <input id="octaveAmp${i}" type="range" min="0" max="2" step="0.01" value="${settings.amplitude.toFixed(2)}"><span class="value-display" id="octaveAmp${i}Value">${settings.amplitude.toFixed(2)}</span>`;
            octaveDiv.appendChild(ampLabel);
            
            container.appendChild(octaveDiv);
            
            // Add event listeners for real-time updates
            document.getElementById(`octaveFreq${i}`).addEventListener('input', (e) => {
                document.getElementById(`octaveFreq${i}Value`).textContent = e.target.value;
                this.noiseSettings.octaveSettings[i].frequency = parseFloat(e.target.value);
                this.noiseSettings.saveSettings();
                this.onSettingsChange();
            });
            
            document.getElementById(`octaveAmp${i}`).addEventListener('input', (e) => {
                document.getElementById(`octaveAmp${i}Value`).textContent = e.target.value;
                this.noiseSettings.octaveSettings[i].amplitude = parseFloat(e.target.value);
                this.noiseSettings.saveSettings();
                this.onSettingsChange();
            });
        }
    }

    setupMainNoiseControls() {
        // Noise control event listeners
        const freqEl = document.getElementById('noiseFreq');
        const octavesEl = document.getElementById('noiseOctaves');
        const persistenceEl = document.getElementById('noisePersistence');
        const offsetEl = document.getElementById('noiseOffset');

        if (freqEl) {
            freqEl.addEventListener('input', (e) => { 
                document.getElementById('noiseFreqValue').textContent = e.target.value;
                this.noiseSettings.baseFreq = parseFloat(e.target.value);
                this.createOctaveControls(); // Recreate octave controls with new base frequency
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (octavesEl) {
            octavesEl.addEventListener('input', (e) => { 
                document.getElementById('noiseOctavesValue').textContent = e.target.value;
                this.noiseSettings.octaves = parseInt(e.target.value);
                this.createOctaveControls(); // Recreate octave controls when count changes
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (persistenceEl) {
            persistenceEl.addEventListener('input', (e) => { 
                document.getElementById('noisePersistenceValue').textContent = e.target.value;
                this.noiseSettings.persistence = parseFloat(e.target.value);
                this.createOctaveControls(); // Recreate octave controls with new persistence
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (offsetEl) {
            offsetEl.addEventListener('input', (e) => { 
                document.getElementById('noiseOffsetValue').textContent = e.target.value;
                this.noiseSettings.offset = parseFloat(e.target.value);
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }
    }
}

export class DebugDisplay {
    constructor(basinManager) {
        this.basinManager = basinManager;
    }

    updateBasinsDisplay() {
        const debugInfo = this.basinManager.getDebugInfo();
        let basinsDbg = "";
        
        // Build tree structure - find root basins (those with no higher neighbors)
        const visited = new Set();
        const printBasin = (id, depth = 0) => {
            if (visited.has(id)) return;
            visited.add(id);
            
            const indent = "  ".repeat(depth);
            const basin = this.basinManager.basins.get(id);
            if (!basin) return;
            
            const maxCapacity = basin.tiles.size * CONFIG.VOLUME_UNIT * CONFIG.MAX_DEPTH;
            basinsDbg += `${indent}${id}: ${basin.tiles.size} tiles, vol=${basin.volume}/${maxCapacity}, water_lvl=${basin.level}\n`;
            
            // Find children (connected basins that haven't been visited)
            const children = Array.from(debugInfo.connections.get(id) || [])
                .filter(childId => !visited.has(childId))
                .sort();
            
            children.forEach(childId => {
                printBasin(childId, depth + 1);
            });
        };
        
        // Start with unvisited basins (creates forest if disconnected components exist)
        debugInfo.basinArray.forEach(([id]) => {
            if (!visited.has(id)) {
                printBasin(id);
            }
        });
        
        // Create interactive basin display
        this.createInteractiveBasinDisplay(basinsDbg);
        
        // Update basin title with statistics
        const titleEl = document.getElementById('basinsTitle');
        if (titleEl) {
            titleEl.textContent = `Basins (${debugInfo.basinCount}, deg≤${debugInfo.maxDegree}, d≤${debugInfo.maxDepth})`;
        }
    }

    updateReservoirsDisplay(reservoirs, pumps, selectedReservoirId) {
        let reservoirsDbg = selectedReservoirId !== null ? 
            `Selected Reservoir: #${selectedReservoirId}\n\n` : 
            'No reservoir selected\n\n';
        
        // Group pumps by reservoir
        const pumpsByReservoir = new Map();
        pumps.forEach((pump, index) => {
            if (!pumpsByReservoir.has(pump.reservoirId)) {
                pumpsByReservoir.set(pump.reservoirId, []);
            }
            pumpsByReservoir.get(pump.reservoirId).push({...pump, index});
        });
        
        pumpsByReservoir.forEach((pumpsInReservoir, reservoirId) => {
            const reservoir = reservoirs.get(reservoirId);
            reservoirsDbg += `Reservoir #${reservoirId}: vol=${reservoir ? reservoir.volume : 0}\n`;
            
            pumpsInReservoir.forEach(pump => {
                const colorPrefix = pump.mode === 'inlet' ? '🔴' : '🟢';
                reservoirsDbg += `  ${colorPrefix} P${pump.index} (${pump.x},${pump.y}) ${pump.mode}\n`;
            });
            reservoirsDbg += '\n';
        });
        
        const reservoirsTextEl = document.getElementById('reservoirsText');
        if (reservoirsTextEl) {
            reservoirsTextEl.textContent = reservoirsDbg;
        }
    }

    createInteractiveBasinDisplay(basinsText) {
        const basinsContainer = document.getElementById('basinsText');
        if (!basinsContainer) return;
        
        basinsContainer.innerHTML = '';
        
        const lines = basinsText.split('\n');
        lines.forEach(line => {
            if (line.trim() === '') {
                basinsContainer.appendChild(document.createTextNode('\n'));
                return;
            }
            
            const lineDiv = document.createElement('div');
            lineDiv.textContent = line;
            
            // Check if this line contains a basin ID
            const basinMatch = line.match(/(\d+#\w+):/);
            if (basinMatch) {
                const basinId = basinMatch[1];
                lineDiv.className = 'basin-line';
                lineDiv.dataset.basinId = basinId;
                
                lineDiv.addEventListener('click', () => {
                    const currentHighlight = this.basinManager.getHighlightedBasin();
                    const newHighlight = currentHighlight === basinId ? null : basinId;
                    this.basinManager.setHighlightedBasin(newHighlight);
                    this.updateBasinHighlights();
                    // Trigger redraw (this should be handled by the main application)
                    this.onBasinHighlightChange?.(newHighlight);
                });
                
                lineDiv.addEventListener('mouseenter', () => {
                    const currentHighlight = this.basinManager.getHighlightedBasin();
                    if (currentHighlight !== basinId) {
                        this.basinManager.setHighlightedBasin(basinId);
                        this.onBasinHighlightChange?.(basinId);
                    }
                });
                
                lineDiv.addEventListener('mouseleave', () => {
                    // Only clear highlight if it's not permanently selected
                    const permanentHighlight = document.querySelector('.basin-line.highlighted');
                    if (!permanentHighlight) {
                        this.basinManager.setHighlightedBasin(null);
                        this.onBasinHighlightChange?.(null);
                    }
                });
            }
            
            basinsContainer.appendChild(lineDiv);
        });
    }

    updateBasinHighlights() {
        const highlighted = this.basinManager.getHighlightedBasin();
        document.querySelectorAll('.basin-line').forEach(line => {
            line.classList.remove('highlighted');
            if (line.dataset.basinId === highlighted) {
                line.classList.add('highlighted');
            }
        });
    }

    setBasinHighlightChangeCallback(callback) {
        this.onBasinHighlightChange = callback;
    }
}
