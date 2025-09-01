// UI controls and event handling

import { CONFIG } from "./config.js";

export class UISettings {
  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    // Load label control settings
    const showDepthLabels = localStorage.getItem("showDepthLabels");
    const showPumpLabels = localStorage.getItem("showPumpLabels");
    const showBasinLabels = localStorage.getItem("showBasinLabels");

    this.showDepthLabels = showDepthLabels !== null ? showDepthLabels === "true" : true;
    this.showPumpLabels = showPumpLabels !== null ? showPumpLabels === "true" : true;
    this.showBasinLabels = showBasinLabels !== null ? showBasinLabels === "true" : false;

    this.updateUI();
  }

  saveSettings() {
    localStorage.setItem("showDepthLabels", this.showDepthLabels.toString());
    localStorage.setItem("showPumpLabels", this.showPumpLabels.toString());
    localStorage.setItem("showBasinLabels", this.showBasinLabels.toString());
  }

  updateUI() {
    const showDepthLabelsEl = document.getElementById("showDepthLabels");
    const showPumpLabelsEl = document.getElementById("showPumpLabels");
    const showBasinLabelsEl = document.getElementById("showBasinLabels");

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
    const container = document.getElementById("octaveControls");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < this.noiseSettings.octaves; i++) {
      const octaveDiv = document.createElement("div");
      octaveDiv.className = "octave-controls";

      const title = document.createElement("h5");
      title.textContent = `Octave ${i + 1}`;
      octaveDiv.appendChild(title);

      // Get or create settings for this octave
      if (!this.noiseSettings.octaveSettings[i]) {
        this.noiseSettings.octaveSettings[i] = {
          frequency: this.noiseSettings.baseFreq * Math.pow(this.noiseSettings.lacunarity, i),
          amplitude: Math.pow(this.noiseSettings.persistence, i),
        };
      }
      const settings = this.noiseSettings.octaveSettings[i];

      // Frequency control
      const freqLabel = document.createElement("label");
      freqLabel.innerHTML =
        `Frequency: <input id="octaveFreq${i}" type="range" min="0.001" max="0.5" step="0.001" value="${
          settings.frequency.toFixed(3)
        }"><span class="value-display" id="octaveFreq${i}Value">${
          settings.frequency.toFixed(3)
        }</span>`;
      octaveDiv.appendChild(freqLabel);

      // Amplitude control
      const ampLabel = document.createElement("label");
      ampLabel.innerHTML =
        `Amplitude: <input id="octaveAmp${i}" type="range" min="0" max="2" step="0.01" value="${
          settings.amplitude.toFixed(2)
        }"><span class="value-display" id="octaveAmp${i}Value">${
          settings.amplitude.toFixed(2)
        }</span>`;
      octaveDiv.appendChild(ampLabel);

      container.appendChild(octaveDiv);

      // Add event listeners for real-time updates
      document.getElementById(`octaveFreq${i}`).addEventListener("input", (e) => {
        document.getElementById(`octaveFreq${i}Value`).textContent = e.target.value;
        this.noiseSettings.octaveSettings[i].frequency = parseFloat(e.target.value);
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });

      document.getElementById(`octaveAmp${i}`).addEventListener("input", (e) => {
        document.getElementById(`octaveAmp${i}Value`).textContent = e.target.value;
        this.noiseSettings.octaveSettings[i].amplitude = parseFloat(e.target.value);
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }
  }

  setupMainNoiseControls() {
    // Enhanced noise control event listeners
    const freqEl = document.getElementById("noiseFreq");
    const octavesEl = document.getElementById("noiseOctaves");
    const persistenceEl = document.getElementById("noisePersistence");
    const lacunarityEl = document.getElementById("noiseLacunarity");
    const offsetEl = document.getElementById("noiseOffset");
    const gainEl = document.getElementById("noiseGain");
    const noiseTypeEl = document.getElementById("noiseType");
    const warpEl = document.getElementById("noiseWarpStrength");
    const warpIterationsEl = document.getElementById("noiseWarpIterations");

    if (freqEl) {
      freqEl.addEventListener("input", (e) => {
        document.getElementById("noiseFreqValue").textContent = e.target.value;
        this.noiseSettings.baseFreq = parseFloat(e.target.value);
        // Update existing octave settings with new base frequency
        for (let i = 0; i < this.noiseSettings.octaves; i++) {
          if (!this.noiseSettings.octaveSettings[i]) {
            this.noiseSettings.octaveSettings[i] = {};
          }
          this.noiseSettings.octaveSettings[i].frequency = this.noiseSettings.baseFreq *
            Math.pow(this.noiseSettings.lacunarity, i);
        }
        this.createOctaveControls(); // Recreate octave controls with new base frequency
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (octavesEl) {
      octavesEl.addEventListener("input", (e) => {
        document.getElementById("noiseOctavesValue").textContent = e.target.value;
        this.noiseSettings.octaves = parseInt(e.target.value);
        this.createOctaveControls(); // Recreate octave controls when count changes
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (persistenceEl) {
      persistenceEl.addEventListener("input", (e) => {
        document.getElementById("noisePersistenceValue").textContent = e.target.value;
        this.noiseSettings.persistence = parseFloat(e.target.value);
        // Update existing octave settings with new persistence
        for (let i = 0; i < this.noiseSettings.octaves; i++) {
          if (!this.noiseSettings.octaveSettings[i]) {
            this.noiseSettings.octaveSettings[i] = {};
          }
          this.noiseSettings.octaveSettings[i].amplitude = Math.pow(
            this.noiseSettings.persistence,
            i,
          );
        }
        this.createOctaveControls(); // Recreate octave controls with new persistence
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (offsetEl) {
      offsetEl.addEventListener("input", (e) => {
        document.getElementById("noiseOffsetValue").textContent = e.target.value;
        this.noiseSettings.offset = parseFloat(e.target.value);
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (lacunarityEl) {
      lacunarityEl.addEventListener("input", (e) => {
        document.getElementById("noiseLacunarityValue").textContent = parseFloat(e.target.value)
          .toFixed(2);
        this.noiseSettings.lacunarity = parseFloat(e.target.value);
        // Update existing octave settings with new lacunarity
        for (let i = 0; i < this.noiseSettings.octaves; i++) {
          if (!this.noiseSettings.octaveSettings[i]) {
            this.noiseSettings.octaveSettings[i] = {};
          }
          this.noiseSettings.octaveSettings[i].frequency = this.noiseSettings.baseFreq *
            Math.pow(this.noiseSettings.lacunarity, i);
        }
        this.createOctaveControls(); // Recreate octave controls with new lacunarity
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (gainEl) {
      gainEl.addEventListener("input", (e) => {
        document.getElementById("noiseGainValue").textContent = parseFloat(e.target.value).toFixed(
          2,
        );
        this.noiseSettings.gain = parseFloat(e.target.value);
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (noiseTypeEl) {
      noiseTypeEl.addEventListener("change", (e) => {
        this.noiseSettings.noiseType = e.target.value;
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (warpEl) {
      warpEl.addEventListener("input", (e) => {
        document.getElementById("noiseWarpStrengthValue").textContent = parseFloat(e.target.value)
          .toFixed(2);
        this.noiseSettings.warpStrength = parseFloat(e.target.value);
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }

    if (warpIterationsEl) {
      warpIterationsEl.addEventListener("input", (e) => {
        document.getElementById("noiseWarpIterationsValue").textContent = e.target.value;
        this.noiseSettings.warpIterations = parseInt(e.target.value);
        this.noiseSettings.saveSettings();
        this.onSettingsChange();
      });
    }
  }
}

export class DebugDisplay {
  constructor(basinManager, gameState, callbacks = {}) {
    this.basinManager = basinManager;
    this.gameState = gameState;
    this.onBasinHighlightChange = null;

    // Store callback functions
    this.callbacks = {
      removePump: callbacks.removePump || (() => console.error("removePump callback not set")),
      removeReservoir: callbacks.removeReservoir ||
        (() => console.error("removeReservoir callback not set")),
      updateControls: callbacks.updateControls ||
        (() => console.error("updateControls callback not set")),
      updateDisplays: callbacks.updateDisplays ||
        (() => console.error("updateDisplays callback not set")),
      updateDebugDisplays: callbacks.updateDebugDisplays ||
        (() => console.error("updateDebugDisplays callback not set")),
      clearSelection: callbacks.clearSelection ||
        (() => console.error("clearSelection callback not set")),
      draw: callbacks.draw || (() => console.error("draw callback not set")),
    };
  }

  // Create a styled remove button
  createRemoveButton(text = "Remove", onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = "remove-button";
    button.onclick = onClick;
    return button;
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
      basinsDbg +=
        `${indent}${id}: ${basin.tiles.size} tiles, vol=${basin.volume}/${maxCapacity}, water_lvl=${basin.level}\n`;

      // Find children (connected basins that haven't been visited)
      const children = Array.from(debugInfo.connections.get(id) || [])
        .filter((childId) => !visited.has(childId))
        .sort();

      children.forEach((childId) => {
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
    const titleEl = document.getElementById("basinsTitle");
    if (titleEl) {
      titleEl.textContent =
        `Basins (${debugInfo.basinCount}, deg≤${debugInfo.maxDegree}, d≤${debugInfo.maxDepth})`;
    }
  }

  updateReservoirsDisplay(reservoirs, pumps, selectedReservoirId) {
    let reservoirsDbg = selectedReservoirId !== null
      ? `Selected Pipe System: #${selectedReservoirId}\n\n`
      : "No pipe system selected\n\n";

    // Group pumps by reservoir (pipe system)
    const pumpsByReservoir = new Map();
    pumps.forEach((pump, index) => {
      if (!pumpsByReservoir.has(pump.reservoirId)) {
        pumpsByReservoir.set(pump.reservoirId, []);
      }
      pumpsByReservoir.get(pump.reservoirId).push({ ...pump, index });
    });

    pumpsByReservoir.forEach((pumpsInReservoir, reservoirId) => {
      const reservoir = reservoirs.get(reservoirId);
      reservoirsDbg += `Pipe System #${reservoirId}: vol=${
        reservoir ? reservoir.volume.toFixed(1) : 0
      }\n`;

      pumpsInReservoir.forEach((pump) => {
        const colorPrefix = pump.mode === "inlet" ? "🔴" : "🟢";
        reservoirsDbg += `  ${colorPrefix} P${pump.index} (${pump.x},${pump.y}) ${pump.mode} `;
        reservoirsDbg += `[Remove]\n`;
      });
      reservoirsDbg += `[Remove Pipe System #${reservoirId}]\n\n`;
    });

    const reservoirsTextEl = document.getElementById("reservoirsText");
    if (reservoirsTextEl) {
      this.createInteractiveReservoirDisplay(reservoirsDbg, reservoirs, pumps, selectedReservoirId);
    }
  }

  // Update tick counter display
  updateTickCounter(tickCount) {
    const display = document.getElementById("tickCounterDisplay");
    if (display) {
      display.textContent = `Tick: ${tickCount}`;
    }
  }

  createInteractiveReservoirDisplay(reservoirsText, reservoirs, pumps, selectedReservoirId) {
    const reservoirsContainer = document.getElementById("reservoirsText");
    if (!reservoirsContainer) return;

    reservoirsContainer.innerHTML = "";

    // Add selected pipe system info
    if (selectedReservoirId !== null) {
      const selectedDiv = document.createElement("div");
      selectedDiv.className = "selected-pipe-system";
      selectedDiv.textContent = `Selected Pipe System: #${selectedReservoirId}`;
      reservoirsContainer.appendChild(selectedDiv);
    } else {
      const noSelectionDiv = document.createElement("div");
      noSelectionDiv.className = "selected-pipe-system";
      noSelectionDiv.textContent = "No pipe system selected";
      noSelectionDiv.style.fontStyle = "italic";
      noSelectionDiv.style.color = "var(--gray-6)";
      reservoirsContainer.appendChild(noSelectionDiv);
    }

    // Group pumps by reservoir (pipe system)
    const pumpsByReservoir = new Map();
    pumps.forEach((pump, index) => {
      if (!pumpsByReservoir.has(pump.reservoirId)) {
        pumpsByReservoir.set(pump.reservoirId, []);
      }
      pumpsByReservoir.get(pump.reservoirId).push({ ...pump, index });
    });

    // Create interactive display for each pipe system
    pumpsByReservoir.forEach((pumpsInReservoir, reservoirId) => {
      const reservoir = reservoirs.get(reservoirId);

      const systemDiv = document.createElement("div");
      systemDiv.className = "pipe-system-container";

      const systemHeader = document.createElement("div");
      systemHeader.className = "pipe-system-header";

      const systemInfo = document.createElement("span");
      systemInfo.innerHTML = `<strong>Pipe System #${reservoirId}:</strong> ${
        reservoir ? Math.floor(reservoir.volume) : 0
      } units`;
      systemHeader.appendChild(systemInfo);

      // Add pipe system removal button
      const removeSystemButton = this.createRemoveButton("Remove System", () => {
        console.log(`Attempting to remove pipe system ${reservoirId}`);

        try {
          // Remove all pumps linked to this pipe system first
          const pumpsToRemove = pumps.filter((pump) => pump.reservoirId === reservoirId);
          console.log(`Found ${pumpsToRemove.length} pumps to remove`);

          pumpsToRemove.forEach((pump) => {
            const pumpIndex = pumps.findIndex((p) => p.x === pump.x && p.y === pump.y);
            console.log(`Removing pump at index ${pumpIndex}`, pump);
            if (pumpIndex >= 0) {
              this.callbacks.removePump(pumpIndex);
            }
          });

          // Remove the reservoir (pipe system)
          console.log(`Removing reservoir ${reservoirId}`);
          this.callbacks.removeReservoir(reservoirId);

          // Clear selection if this was the selected system
          if (selectedReservoirId === reservoirId) {
            console.log(`Clearing selection for removed pipe system ${reservoirId}`);
            this.callbacks.clearSelection();
          }

          // Update UI
          this.callbacks.updateControls();
          this.callbacks.updateDisplays();
          this.callbacks.draw();

          console.log(`Successfully removed pipe system ${reservoirId}`);
        } catch (error) {
          console.error(`Error removing pipe system ${reservoirId}:`, error);
        }
      });
      systemHeader.appendChild(removeSystemButton);

      systemDiv.appendChild(systemHeader);

      // Add pumps for this pipe system
      pumpsInReservoir.forEach((pump) => {
        const pumpDiv = document.createElement("div");
        pumpDiv.className = "pump-item";

        const colorPrefix = pump.mode === "inlet" ? "🔴" : "🟢";
        const pumpText = document.createElement("span");
        pumpText.textContent = `${colorPrefix} P${pump.index} (${pump.x},${pump.y}) ${pump.mode}`;
        pumpDiv.appendChild(pumpText);

        const removePumpButton = this.createRemoveButton("Remove", () => {
          console.log(
            `Attempting to remove pump at index ${pump.index}, coordinates (${pump.x},${pump.y})`,
          );

          try {
            // Try removing by index (if available)
            const pumpIndex = pumps.findIndex((p) => p.x === pump.x && p.y === pump.y);
            console.log(`Found pump at index ${pumpIndex}`);

            if (pumpIndex >= 0) {
              this.callbacks.removePump(pumpIndex);
              this.callbacks.updateControls();
              this.callbacks.updateDebugDisplays();
              this.callbacks.draw();

              console.log(`Successfully removed pump at (${pump.x},${pump.y})`);
            } else {
              console.warn(`Pump not found at (${pump.x},${pump.y})`);
            }
          } catch (error) {
            console.error(`Error removing pump at (${pump.x},${pump.y}):`, error);
          }
        });
        pumpDiv.appendChild(removePumpButton);

        systemDiv.appendChild(pumpDiv);
      });

      reservoirsContainer.appendChild(systemDiv);
    });
  }

  createInteractiveBasinDisplay(basinsText) {
    const basinsContainer = document.getElementById("basinsText");
    if (!basinsContainer) return;

    basinsContainer.innerHTML = "";

    const lines = basinsText.split("\n");
    lines.forEach((line) => {
      if (line.trim() === "") {
        basinsContainer.appendChild(document.createTextNode("\n"));
        return;
      }

      const lineDiv = document.createElement("div");
      lineDiv.textContent = line;

      // Check if this line contains a basin ID
      const basinMatch = line.match(/(\d+#\w+):/);
      if (basinMatch) {
        const basinId = basinMatch[1];
        lineDiv.className = "basin-line";
        lineDiv.dataset.basinId = basinId;

        lineDiv.addEventListener("click", () => {
          const currentHighlight = this.basinManager.getHighlightedBasin();
          const newHighlight = currentHighlight === basinId ? null : basinId;
          this.basinManager.setHighlightedBasin(newHighlight);
          this.updateBasinHighlights();
          // Trigger redraw (this should be handled by the main application)
          this.onBasinHighlightChange?.(newHighlight);
        });

        lineDiv.addEventListener("mouseenter", () => {
          const currentHighlight = this.basinManager.getHighlightedBasin();
          if (currentHighlight !== basinId) {
            this.basinManager.setHighlightedBasin(basinId);
            this.onBasinHighlightChange?.(basinId);
          }
        });

        lineDiv.addEventListener("mouseleave", () => {
          // Only clear highlight if it's not permanently selected
          const permanentHighlight = document.querySelector(".basin-line.highlighted");
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
    document.querySelectorAll(".basin-line").forEach((line) => {
      line.classList.remove("highlighted");
      if (line.dataset.basinId === highlighted) {
        line.classList.add("highlighted");
      }
    });
  }

  setBasinHighlightChangeCallback(callback) {
    this.onBasinHighlightChange = callback;
  }
}
