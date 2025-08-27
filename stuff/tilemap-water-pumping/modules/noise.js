// Perlin noise implementation for terrain generation

// Permutation table for Perlin noise
const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
           190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
           174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
           133,230,220,105,92,41,55,46,245,40,244,102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208,
           89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
           5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
           248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,129,22,39,253, 19,98,108,110,79,113,224,
           232,178,185, 112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,
           249,14,239,107,49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,138,
           236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

// Duplicate permutation table
for(let i = 0; i < 256; i++) p[256 + i] = p[i];

// Noise utility functions
function fade(t) { 
    return t * t * t * (t * (t * 6 - 15) + 10); 
}

function lerp(t, a, b) { 
    return a + t * (b - a); 
}

function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h == 12 || h == 14 ? x : 0;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}

// 2D Perlin noise function
export function noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = p[X] + Y, AA = p[A], AB = p[A + 1];
    const B = p[X + 1] + Y, BA = p[B], BB = p[B + 1];
    return lerp(v, lerp(u, grad(p[AA], x, y), grad(p[BA], x - 1, y)),
                  lerp(u, grad(p[AB], x, y - 1), grad(p[BB], x - 1, y - 1)));
}

// Noise settings management
export class NoiseSettings {
    constructor() {
        this.loadSettings();
    }
    
    loadSettings() {
        const freq = localStorage.getItem('noiseFreq');
        const octaves = localStorage.getItem('noiseOctaves');
        const persistence = localStorage.getItem('noisePersistence');
        const offset = localStorage.getItem('noiseOffset');
        
        this.baseFreq = freq ? parseFloat(freq) : 0.02;
        this.octaves = octaves ? parseInt(octaves) : 3;
        this.persistence = persistence ? parseFloat(persistence) : 0.5;
        this.offset = offset ? parseFloat(offset) : 0.3;
        
        // Update UI elements if they exist
        this.updateUI();
        
        // Load octave-specific settings
        this.octaveSettings = [];
        for (let i = 0; i < this.octaves; i++) {
            const savedFreq = localStorage.getItem(`octaveFreq${i}`);
            const savedAmp = localStorage.getItem(`octaveAmp${i}`);
            
            this.octaveSettings[i] = {
                frequency: savedFreq ? parseFloat(savedFreq) : this.baseFreq * Math.pow(2, i),
                amplitude: savedAmp ? parseFloat(savedAmp) : Math.pow(this.persistence, i)
            };
        }
    }
    
    saveSettings() {
        localStorage.setItem('noiseFreq', this.baseFreq.toString());
        localStorage.setItem('noiseOctaves', this.octaves.toString());
        localStorage.setItem('noisePersistence', this.persistence.toString());
        localStorage.setItem('noiseOffset', this.offset.toString());
        
        // Save octave-specific settings
        for (let i = 0; i < this.octaves; i++) {
            if (this.octaveSettings[i]) {
                localStorage.setItem(`octaveFreq${i}`, this.octaveSettings[i].frequency.toString());
                localStorage.setItem(`octaveAmp${i}`, this.octaveSettings[i].amplitude.toString());
            }
        }
    }
    
    updateUI() {
        const freqEl = document.getElementById('noiseFreq');
        const octavesEl = document.getElementById('noiseOctaves');
        const persistenceEl = document.getElementById('noisePersistence');
        const offsetEl = document.getElementById('noiseOffset');
        
        if (freqEl) freqEl.value = this.baseFreq;
        if (octavesEl) octavesEl.value = this.octaves;
        if (persistenceEl) persistenceEl.value = this.persistence;
        if (offsetEl) offsetEl.value = this.offset;
        
        // Update value displays
        const freqValueEl = document.getElementById('noiseFreqValue');
        const octavesValueEl = document.getElementById('noiseOctavesValue');
        const persistenceValueEl = document.getElementById('noisePersistenceValue');
        const offsetValueEl = document.getElementById('noiseOffsetValue');
        
        if (freqValueEl) freqValueEl.textContent = this.baseFreq;
        if (octavesValueEl) octavesValueEl.textContent = this.octaves;
        if (persistenceValueEl) persistenceValueEl.textContent = this.persistence;
        if (offsetValueEl) offsetValueEl.textContent = this.offset;
    }
}

// Height generation using Perlin noise
export class HeightGenerator {
    constructor(worldW, worldH, maxDepth) {
        this.worldW = worldW;
        this.worldH = worldH;
        this.maxDepth = maxDepth;
        this.noiseSettings = new NoiseSettings();
    }
    
    generate(seedOffset = 0) {
        const heights = new Array(this.worldH);
        for (let y = 0; y < this.worldH; y++) {
            heights[y] = new Array(this.worldW).fill(0);
        }
        
        for (let y = 0; y < this.worldH; y++) {
            for (let x = 0; x < this.worldW; x++) {
                let value = 0;
                let maxValue = 0;
                
                // Generate octaves of noise with individual controls
                for (let i = 0; i < this.noiseSettings.octaves; i++) {
                    let frequency, amplitude;
                    
                    if (this.noiseSettings.octaveSettings[i]) {
                        frequency = this.noiseSettings.octaveSettings[i].frequency;
                        amplitude = this.noiseSettings.octaveSettings[i].amplitude;
                    } else {
                        frequency = this.noiseSettings.baseFreq * Math.pow(2, i);
                        amplitude = Math.pow(this.noiseSettings.persistence, i);
                    }
                    
                    const n = noise2D(x * frequency + seedOffset, y * frequency - seedOffset);
                    value += n * amplitude;
                    maxValue += amplitude;
                }
                
                // Normalize and scale with offset
                value = value / maxValue; // -1..1
                value = (value + this.noiseSettings.offset) * 0.5 + 0.5; // Apply offset and normalize to 0..1
                value = Math.max(0, Math.min(1, value)); // Clamp to 0-1 range
                heights[y][x] = Math.floor(value * (this.maxDepth + 1));
            }
        }
        
        return heights;
    }
    
    getNoiseSettings() {
        return this.noiseSettings;
    }
}
