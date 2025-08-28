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
            
            // Get or create settings for this octave
            if (!this.noiseSettings.octaveSettings[i]) {
                this.noiseSettings.octaveSettings[i] = {
                    frequency: this.noiseSettings.baseFreq * Math.pow(this.noiseSettings.lacunarity, i),
                    amplitude: Math.pow(this.noiseSettings.persistence, i)
                };
            }
            const settings = this.noiseSettings.octaveSettings[i];
            
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
        // Enhanced noise control event listeners
        const freqEl = document.getElementById('noiseFreq');
        const octavesEl = document.getElementById('noiseOctaves');
        const persistenceEl = document.getElementById('noisePersistence');
        const lacunarityEl = document.getElementById('noiseLacunarity');
        const offsetEl = document.getElementById('noiseOffset');
        const gainEl = document.getElementById('noiseGain');
        const noiseTypeEl = document.getElementById('noiseType');
        const warpEl = document.getElementById('noiseWarpStrength');
        const warpIterationsEl = document.getElementById('noiseWarpIterations');

        if (freqEl) {
            freqEl.addEventListener('input', (e) => { 
                document.getElementById('noiseFreqValue').textContent = e.target.value;
                this.noiseSettings.baseFreq = parseFloat(e.target.value);
                // Update existing octave settings with new base frequency
                for (let i = 0; i < this.noiseSettings.octaves; i++) {
                    if (!this.noiseSettings.octaveSettings[i]) {
                        this.noiseSettings.octaveSettings[i] = {};
                    }
                    this.noiseSettings.octaveSettings[i].frequency = this.noiseSettings.baseFreq * Math.pow(this.noiseSettings.lacunarity, i);
                }
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
                // Update existing octave settings with new persistence
                for (let i = 0; i < this.noiseSettings.octaves; i++) {
                    if (!this.noiseSettings.octaveSettings[i]) {
                        this.noiseSettings.octaveSettings[i] = {};
                    }
                    this.noiseSettings.octaveSettings[i].amplitude = Math.pow(this.noiseSettings.persistence, i);
                }
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

        if (lacunarityEl) {
            lacunarityEl.addEventListener('input', (e) => { 
                document.getElementById('noiseLacunarityValue').textContent = parseFloat(e.target.value).toFixed(2);
                this.noiseSettings.lacunarity = parseFloat(e.target.value);
                // Update existing octave settings with new lacunarity
                for (let i = 0; i < this.noiseSettings.octaves; i++) {
                    if (!this.noiseSettings.octaveSettings[i]) {
                        this.noiseSettings.octaveSettings[i] = {};
                    }
                    this.noiseSettings.octaveSettings[i].frequency = this.noiseSettings.baseFreq * Math.pow(this.noiseSettings.lacunarity, i);
                }
                this.createOctaveControls(); // Recreate octave controls with new lacunarity
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (gainEl) {
            gainEl.addEventListener('input', (e) => { 
                document.getElementById('noiseGainValue').textContent = parseFloat(e.target.value).toFixed(2);
                this.noiseSettings.gain = parseFloat(e.target.value);
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (noiseTypeEl) {
            noiseTypeEl.addEventListener('change', (e) => { 
                this.noiseSettings.noiseType = e.target.value;
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (warpEl) {
            warpEl.addEventListener('input', (e) => { 
                document.getElementById('noiseWarpStrengthValue').textContent = parseFloat(e.target.value).toFixed(2);
                this.noiseSettings.warpStrength = parseFloat(e.target.value);
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }

        if (warpIterationsEl) {
            warpIterationsEl.addEventListener('input', (e) => { 
                document.getElementById('noiseWarpIterationsValue').textContent = e.target.value;
                this.noiseSettings.warpIterations = parseInt(e.target.value);
                this.noiseSettings.saveSettings(); 
                this.onSettingsChange();
            });
        }
    }
}

export class DebugDisplay {
    constructor(basinManager, gameState) {
        this.basinManager = basinManager;
        this.gameState = gameState;
    }

    updateBasinsDisplay() {
        const heights = this.gameState.getHeights();
        const debugInfo = this.basinManager.getDebugInfo(heights);
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
            reservoirsDbg += `Reservoir #${reservoirId}: vol=${reservoir ? reservoir.volume.toFixed(1) : 0}\n`;
            
            pumpsInReservoir.forEach(pump => {
                const colorPrefix = pump.mode === 'inlet' ? '🔴' : '🟢';
                reservoirsDbg += `  ${colorPrefix} P${pump.index} (${pump.x},${pump.y}) ${pump.mode} `;
                reservoirsDbg += `[Remove]\n`;
            });
            reservoirsDbg += `[Remove Reservoir #${reservoirId}]\n\n`;
        });
        
        const reservoirsTextEl = document.getElementById('reservoirsText');
        if (reservoirsTextEl) {
            this.createInteractiveReservoirDisplay(reservoirsDbg, reservoirs, pumps, selectedReservoirId);
        }
    }

    // Update tick counter display
    updateTickCounter(tickCount) {
        const display = document.getElementById('tickCounterDisplay');
        if (display) {
            display.textContent = `Tick: ${tickCount}`;
        }
    }

    createInteractiveReservoirDisplay(reservoirsText, reservoirs, pumps, selectedReservoirId) {
        const reservoirsContainer = document.getElementById('reservoirsText');
        if (!reservoirsContainer) return;
        
        reservoirsContainer.innerHTML = '';
        
        // Add selected reservoir info
        if (selectedReservoirId !== null) {
            const selectedDiv = document.createElement('div');
            selectedDiv.textContent = `Selected Reservoir: #${selectedReservoirId}`;
            selectedDiv.style.fontWeight = 'bold';
            selectedDiv.style.marginBottom = '10px';
            reservoirsContainer.appendChild(selectedDiv);
        }
        
        // Group pumps by reservoir
        const pumpsByReservoir = new Map();
        pumps.forEach((pump, index) => {
            if (!pumpsByReservoir.has(pump.reservoirId)) {
                pumpsByReservoir.set(pump.reservoirId, []);
            }
            pumpsByReservoir.get(pump.reservoirId).push({...pump, index});
        });
        
        // Create interactive display for each reservoir
        pumpsByReservoir.forEach((pumpsInReservoir, reservoirId) => {
            const reservoir = reservoirs.get(reservoirId);
            
            const reservoirDiv = document.createElement('div');
            reservoirDiv.style.marginBottom = '10px';
            reservoirDiv.style.padding = '5px';
            reservoirDiv.style.border = '1px solid #ddd';
            
            const reservoirHeader = document.createElement('div');
            reservoirHeader.style.display = 'flex';
            reservoirHeader.style.justifyContent = 'space-between';
            reservoirHeader.style.alignItems = 'center';
            
            const reservoirInfo = document.createElement('span');
            reservoirInfo.innerHTML = `<strong>Reservoir #${reservoirId}:</strong> ${reservoir ? Math.floor(reservoir.volume) : 0} units`;
            reservoirHeader.appendChild(reservoirInfo);
            
            // Add reservoir removal button (inline, on the right)
            const removeReservoirButton = document.createElement('button');
            removeReservoirButton.textContent = 'Remove';
            removeReservoirButton.style.padding = '2px 6px';
            removeReservoirButton.style.fontSize = '0.8em';
            removeReservoirButton.onclick = () => {
                // Remove all pumps linked to this reservoir first
                const pumpsToRemove = pumps.filter(pump => pump.reservoirId === reservoirId);
                pumpsToRemove.forEach(pump => {
                    const pumpIndex = pumps.findIndex(p => p.x === pump.x && p.y === pump.y);
                    if (pumpIndex >= 0) {
                        window.tilemapApp.gameState.getPumpManager().removePump(pumpIndex);
                    }
                });
                
                // Remove the reservoir
                window.tilemapApp.gameState.getReservoirManager().removeReservoir(reservoirId);
                window.tilemapApp.updateReservoirControls();
                window.tilemapApp.updateDebugDisplays();
                window.tilemapApp.draw();
            };
            reservoirHeader.appendChild(removeReservoirButton);
            
            reservoirDiv.appendChild(reservoirHeader);
            
            // Add pumps for this reservoir
            pumpsInReservoir.forEach(pump => {
                const pumpDiv = document.createElement('div');
                pumpDiv.style.marginLeft = '15px';
                pumpDiv.style.fontSize = '0.9em';
                
                const colorPrefix = pump.mode === 'inlet' ? '🔴' : '🟢';
                const pumpText = document.createElement('span');
                pumpText.textContent = `${colorPrefix} P${pump.index} (${pump.x},${pump.y}) ${pump.mode} `;
                pumpDiv.appendChild(pumpText);
                
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.style.marginLeft = '5px';
                removeButton.style.padding = '1px 4px';
                removeButton.style.fontSize = '0.7em';
                removeButton.onclick = () => {
                    window.tilemapApp.gameState.getPumpManager().removePump(pump.index);
                    window.tilemapApp.updateDebugDisplays();
                    window.tilemapApp.draw();
                };
                pumpDiv.appendChild(removeButton);
                
                reservoirDiv.appendChild(pumpDiv);
            });
            
            reservoirsContainer.appendChild(reservoirDiv);
        });
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
