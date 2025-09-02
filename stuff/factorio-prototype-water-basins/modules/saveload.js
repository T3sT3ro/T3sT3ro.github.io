// Save/Load UI management

export class SaveLoadManager {
  constructor(gameState, onStateChanged) {
    this.gameState = gameState;
    this.onStateChanged = onStateChanged;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Load button
    const loadBtn = document.getElementById("loadBtn");
    if (loadBtn) {
      loadBtn.onclick = () => this.showLoadModal();
    }

    // Export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.onclick = () => this.showExportModal();
    }

    // Help button
    const helpBtn = document.getElementById("helpBtn");
    if (helpBtn) {
      helpBtn.onclick = () => this.showHelpModal();
    }

    // Load modal handlers
    const loadFromTextBtn = document.getElementById("loadFromTextBtn");
    if (loadFromTextBtn) {
      loadFromTextBtn.onclick = () => this.loadFromText();
    }

    const jsonFileInput = document.getElementById("jsonFileInput");
    if (jsonFileInput) {
      jsonFileInput.onchange = (event) => this.loadFromFile(event);
    }

    // Export modal handlers
    const saveToBrowserBtn = document.getElementById("saveToBrowserBtn");
    if (saveToBrowserBtn) {
      saveToBrowserBtn.onclick = () => this.saveToBrowser();
    }

    const copyJsonBtn = document.getElementById("copyJsonBtn");
    if (copyJsonBtn) {
      copyJsonBtn.onclick = () => this.copyJsonToClipboard();
    }

    const downloadJsonBtn = document.getElementById("downloadJsonBtn");
    if (downloadJsonBtn) {
      downloadJsonBtn.onclick = () => this.downloadJson();
    }
  }

  showLoadModal() {
    const modal = document.getElementById("loadModal");
    if (modal) {
      this.populateSavedMapsList();
      modal.showModal();
    }
  }

  showExportModal() {
    const modal = document.getElementById("exportModal");
    if (modal) {
      this.generateExportJson();
      modal.showModal();
    }
  }

  showHelpModal() {
    const modal = document.getElementById("helpModal");
    if (modal) {
      modal.showModal();
    }
  }

  populateSavedMapsList() {
    const container = document.getElementById("savedMaps");
    if (!container) return;

    const saves = this.getSavedMaps();
    
    if (saves.length === 0) {
      container.innerHTML = '<p class="no-saves">No saved maps found</p>';
      return;
    }

    container.innerHTML = saves.map(save => `
      <div class="saved-map-item">
        <div class="saved-map-info">
          <div class="saved-map-name">${this.escapeHtml(save.name)}</div>
          <div class="saved-map-date">${new Date(save.timestamp).toLocaleString()}</div>
        </div>
        <div class="saved-map-actions">
          <button onclick="window.saveLoadManager.loadFromBrowser('${this.escapeHtml(save.key)}')">Load</button>
          <button class="delete-btn" onclick="window.saveLoadManager.deleteFromBrowser('${this.escapeHtml(save.key)}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  generateExportJson() {
    const output = document.getElementById("exportJsonOutput");
    if (output) {
      try {
        const jsonData = this.gameState.exportToJSON();
        output.value = jsonData;
      } catch (error) {
        output.value = `Error generating export data: ${error.message}`;
        console.error("Export error:", error);
      }
    }
  }

  loadFromText() {
    const textInput = document.getElementById("jsonTextInput");
    if (!textInput || !textInput.value.trim()) {
      alert("Please paste JSON data first.");
      return;
    }

    try {
      this.gameState.importFromJSON(textInput.value);
      this.onStateChanged();
      document.getElementById("loadModal").close();
      textInput.value = "";
      alert("Map loaded successfully!");
    } catch (error) {
      alert(`Failed to load map: ${error.message}`);
    }
  }

  loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.gameState.importFromJSON(e.target.result);
        this.onStateChanged();
        document.getElementById("loadModal").close();
        event.target.value = "";
        alert("Map loaded successfully!");
      } catch (error) {
        alert(`Failed to load map: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  saveToBrowser() {
    const nameInput = document.getElementById("saveNameInput");
    if (!nameInput || !nameInput.value.trim()) {
      alert("Please enter a save name.");
      return;
    }

    const saveName = nameInput.value.trim();
    const saveKey = `mapSave_${Date.now()}_${saveName}`;
    
    try {
      const jsonData = this.gameState.exportToJSON();
      const saveData = {
        name: saveName,
        timestamp: new Date().toISOString(),
        data: jsonData
      };
      
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      nameInput.value = "";
      alert(`Map saved as "${saveName}"!`);
      
      // Refresh the saved maps list if the load modal is open
      if (document.getElementById("loadModal").open) {
        this.populateSavedMapsList();
      }
    } catch (error) {
      alert(`Failed to save map: ${error.message}`);
      console.error("Save error:", error);
    }
  }

  loadFromBrowser(saveKey) {
    try {
      const saveData = localStorage.getItem(saveKey);
      if (!saveData) {
        alert("Save not found.");
        return;
      }

      const parsed = JSON.parse(saveData);
      this.gameState.importFromJSON(parsed.data);
      this.onStateChanged();
      document.getElementById("loadModal").close();
      alert(`Map "${parsed.name}" loaded successfully!`);
    } catch (error) {
      alert(`Failed to load map: ${error.message}`);
      console.error("Load error:", error);
    }
  }

  deleteFromBrowser(saveKey) {
    if (!confirm("Are you sure you want to delete this save?")) {
      return;
    }

    try {
      localStorage.removeItem(saveKey);
      this.populateSavedMapsList();
      alert("Save deleted successfully!");
    } catch (error) {
      alert(`Failed to delete save: ${error.message}`);
      console.error("Delete error:", error);
    }
  }

  copyJsonToClipboard() {
    const output = document.getElementById("exportJsonOutput");
    if (!output) return;

    output.select();
    output.setSelectionRange(0, 99999); // For mobile devices

    try {
      document.execCommand('copy');
      alert("JSON data copied to clipboard!");
    } catch (error) {
      // Fallback for modern browsers
      navigator.clipboard.writeText(output.value).then(() => {
        alert("JSON data copied to clipboard!");
      }).catch(() => {
        alert("Failed to copy to clipboard. Please copy manually.");
      });
    }
  }

  downloadJson() {
    const output = document.getElementById("exportJsonOutput");
    if (!output || !output.value) return;

    const blob = new Blob([output.value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `water-basins-map-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getSavedMaps() {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mapSave_")) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key));
          saves.push({
            key: key,
            name: saveData.name,
            timestamp: saveData.timestamp
          });
        } catch (_error) {
          console.warn(`Invalid save data for key ${key}:`, _error);
        }
      }
    }
    
    // Sort by timestamp, newest first
    saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return saves;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
