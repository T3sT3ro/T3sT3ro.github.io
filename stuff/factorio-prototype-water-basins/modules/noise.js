// Advanced noise implementation for terrain generation

// Enhanced permutation table for better quality
const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
           190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
           174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
           133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
           89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
           5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
           248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,
           232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,
           249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,
           236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

// Duplicate permutation table
for(let i = 0; i < 256; i++) p[256 + i] = p[i];

// Improved noise utility functions
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

// Simplex noise for better quality (optional alternative)
export function simplex2D(x, y) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    
    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    
    let n = 0.0;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 >= 0) {
        const gi0 = p[ii + p[jj]] & 7;
        n += t0 * t0 * t0 * t0 * (grad2(gi0, x0, y0));
    }
    
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 >= 0) {
        const gi1 = p[ii + i1 + p[jj + j1]] & 7;
        n += t1 * t1 * t1 * t1 * (grad2(gi1, x1, y1));
    }
    
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 >= 0) {
        const gi2 = p[ii + 1 + p[jj + 1]] & 7;
        n += t2 * t2 * t2 * t2 * (grad2(gi2, x2, y2));
    }
    
    return 70.0 * n;
}

function grad2(hash, x, y) {
    const grad2lut = [
        [1,1], [-1,1], [1,-1], [-1,-1],
        [1,0], [-1,0], [0,1], [0,-1]
    ];
    return grad2lut[hash][0] * x + grad2lut[hash][1] * y;
}

// Ridged noise for terrain features
export function ridgedNoise2D(x, y) {
    return 1.0 - Math.abs(noise2D(x, y));
}

// Billowy noise for cloud-like features  
export function billowyNoise2D(x, y) {
    return Math.abs(noise2D(x, y));
}

// Recursive domain warping (Book of Shaders style)
// f(p) = fbm( p + fbm( p + fbm( p ) ) )
export function warpedNoise2D(x, y, noiseFunc, octaves, lacunarity, persistence, gain, iterations = 2, warpStrength = 1.0, baseFreq = 1.0) {
    let px = x * baseFreq;
    let py = y * baseFreq;
    
    // Apply recursive domain warping
    for (let i = 0; i < iterations; i++) {
        const warpScale = warpStrength / Math.pow(2, i); // Reduce strength each iteration
        const freq = baseFreq * Math.pow(2, i); // Increase frequency each iteration
        
        // Generate warp offsets using noise
        const warpX = noise2D(px * freq, py * freq) * warpScale;
        const warpY = noise2D(px * freq + 100, py * freq + 100) * warpScale;
        
        // Apply warp
        px += warpX;
        py += warpY;
    }
    
    // Now generate octaves of noise at the warped coordinates
    let value = 0;
    let maxValue = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    
    for (let i = 0; i < octaves; i++) {
        const n = noiseFunc(px * frequency, py * frequency);
        value += n * amplitude * gain;
        maxValue += amplitude;
        
        frequency *= lacunarity;
        amplitude *= persistence;
    }
    
    return maxValue > 0 ? value / maxValue : 0;
}

// Enhanced noise settings management
export class NoiseSettings {
    constructor() {
        this.loadSettings();
    }
    
    loadSettings() {
        const freq = localStorage.getItem('noiseFreq');
        const octaves = localStorage.getItem('noiseOctaves');
        const persistence = localStorage.getItem('noisePersistence');
        const lacunarity = localStorage.getItem('noiseLacunarity');
        const offset = localStorage.getItem('noiseOffset');
        const gain = localStorage.getItem('noiseGain');
        const noiseType = localStorage.getItem('noiseType');
        const warpStrength = localStorage.getItem('noiseWarpStrength');
        const warpIterations = localStorage.getItem('noiseWarpIterations');
        
        this.baseFreq = freq ? parseFloat(freq) : 0.02;
        this.octaves = octaves ? parseInt(octaves) : 3;
        this.persistence = persistence ? parseFloat(persistence) : 0.5;
        this.lacunarity = lacunarity ? parseFloat(lacunarity) : 2.0;
        this.offset = offset ? parseFloat(offset) : 0.3;
        this.gain = gain ? parseFloat(gain) : 1.0;
        this.noiseType = noiseType || 'perlin'; // perlin, simplex, ridged, billowy
        this.warpStrength = warpStrength ? parseFloat(warpStrength) : 0.0;
        this.warpIterations = warpIterations ? parseInt(warpIterations) : 1;
        
        // Update UI elements if they exist
        this.updateUI();
        
        // Load octave-specific settings
        this.octaveSettings = [];
        for (let i = 0; i < this.octaves; i++) {
            const savedFreq = localStorage.getItem(`octaveFreq${i}`);
            const savedAmp = localStorage.getItem(`octaveAmp${i}`);
            
            this.octaveSettings[i] = {
                frequency: savedFreq ? parseFloat(savedFreq) : this.baseFreq * Math.pow(this.lacunarity, i),
                amplitude: savedAmp ? parseFloat(savedAmp) : Math.pow(this.persistence, i)
            };
        }
    }
    
    saveSettings() {
        localStorage.setItem('noiseFreq', this.baseFreq.toString());
        localStorage.setItem('noiseOctaves', this.octaves.toString());
        localStorage.setItem('noisePersistence', this.persistence.toString());
        localStorage.setItem('noiseLacunarity', this.lacunarity.toString());
        localStorage.setItem('noiseOffset', this.offset.toString());
        localStorage.setItem('noiseGain', this.gain.toString());
        localStorage.setItem('noiseType', this.noiseType);
        localStorage.setItem('noiseWarpStrength', this.warpStrength.toString());
        localStorage.setItem('noiseWarpIterations', this.warpIterations.toString());
        
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
        const lacunarityEl = document.getElementById('noiseLacunarity');
        const offsetEl = document.getElementById('noiseOffset');
        const gainEl = document.getElementById('noiseGain');
        const noiseTypeEl = document.getElementById('noiseType');
        const warpEl = document.getElementById('noiseWarpStrength');
        const warpIterationsEl = document.getElementById('noiseWarpIterations');
        
        if (freqEl) freqEl.value = this.baseFreq;
        if (octavesEl) octavesEl.value = this.octaves;
        if (persistenceEl) persistenceEl.value = this.persistence;
        if (lacunarityEl) lacunarityEl.value = this.lacunarity;
        if (offsetEl) offsetEl.value = this.offset;
        if (gainEl) gainEl.value = this.gain;
        if (noiseTypeEl) noiseTypeEl.value = this.noiseType;
        if (warpEl) warpEl.value = this.warpStrength;
        if (warpIterationsEl) warpIterationsEl.value = this.warpIterations;
        
        // Update value displays
        const freqValueEl = document.getElementById('noiseFreqValue');
        const octavesValueEl = document.getElementById('noiseOctavesValue');
        const persistenceValueEl = document.getElementById('noisePersistenceValue');
        const lacunarityValueEl = document.getElementById('noiseLacunarityValue');
        const offsetValueEl = document.getElementById('noiseOffsetValue');
        const gainValueEl = document.getElementById('noiseGainValue');
        const warpValueEl = document.getElementById('noiseWarpStrengthValue');
        const warpIterationsValueEl = document.getElementById('noiseWarpIterationsValue');
        
        if (freqValueEl) freqValueEl.textContent = this.baseFreq;
        if (octavesValueEl) octavesValueEl.textContent = this.octaves;
        if (persistenceValueEl) persistenceValueEl.textContent = this.persistence;
        if (lacunarityValueEl) lacunarityValueEl.textContent = this.lacunarity.toFixed(2);
        if (offsetValueEl) offsetValueEl.textContent = this.offset;
        if (gainValueEl) gainValueEl.textContent = this.gain.toFixed(2);
        if (warpValueEl) warpValueEl.textContent = this.warpStrength.toFixed(2);
        if (warpIterationsValueEl) warpIterationsValueEl.textContent = this.warpIterations;
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
        performance.mark('noise-generation-start');
        
        const heights = new Array(this.worldH);
        for (let y = 0; y < this.worldH; y++) {
            heights[y] = new Array(this.worldW).fill(0);
        }
        
        performance.mark('noise-function-selection-start');
        // Select noise function based on type
        let noiseFunc;
        switch(this.noiseSettings.noiseType) {
            case 'simplex': noiseFunc = simplex2D; break;
            case 'ridged': noiseFunc = ridgedNoise2D; break;
            case 'billowy': noiseFunc = billowyNoise2D; break;
            default: noiseFunc = noise2D; break;
        }
        performance.mark('noise-function-selection-end');
        
        performance.mark('noise-calculation-start');
        let warpedPixels = 0;
        let standardPixels = 0;
        
        for (let y = 0; y < this.worldH; y++) {
            for (let x = 0; x < this.worldW; x++) {
                let value = 0;
                
                // Apply recursive domain warping if enabled
                if (this.noiseSettings.warpStrength > 0 && this.noiseSettings.warpIterations > 1) {
                    warpedPixels++;
                    // Use recursive warping with proper octaves
                    value = warpedNoise2D(
                        x, y,
                        noiseFunc,
                        this.noiseSettings.octaves,
                        this.noiseSettings.lacunarity,
                        this.noiseSettings.persistence,
                        this.noiseSettings.gain,
                        this.noiseSettings.warpIterations,
                        this.noiseSettings.warpStrength,
                        this.noiseSettings.baseFreq
                    );
                } else {
                    standardPixels++;
                    // Standard octave generation with optional simple warping
                    let warpX = x;
                    let warpY = y;
                    if (this.noiseSettings.warpStrength > 0) {
                        warpX += noise2D(x * 0.01 + seedOffset, y * 0.01) * this.noiseSettings.warpStrength;
                        warpY += noise2D(x * 0.01, y * 0.01 + seedOffset) * this.noiseSettings.warpStrength;
                    }
                    
                    // Generate octaves with enhanced controls
                    let maxValue = 0;
                    let frequency = this.noiseSettings.baseFreq;
                    let amplitude = 1.0;
                    
                    for (let i = 0; i < this.noiseSettings.octaves; i++) {
                        // Use custom octave settings if available
                        if (this.noiseSettings.octaveSettings[i]) {
                            frequency = this.noiseSettings.octaveSettings[i].frequency;
                            amplitude = this.noiseSettings.octaveSettings[i].amplitude;
                        } else {
                            // Use lacunarity and persistence
                            frequency = this.noiseSettings.baseFreq * Math.pow(this.noiseSettings.lacunarity, i);
                            amplitude = Math.pow(this.noiseSettings.persistence, i);
                        }
                        
                        const n = noiseFunc(warpX * frequency + seedOffset, warpY * frequency - seedOffset);
                        value += n * amplitude * this.noiseSettings.gain;
                        maxValue += amplitude;
                    }
                    
                    // Normalize 
                    if (maxValue > 0) {
                        value = value / maxValue;
                    }
                }
                
                // Apply offset and final scaling
                value = (value + this.noiseSettings.offset) * 0.5 + 0.5; // Apply offset and normalize to 0..1
                value = Math.max(0, Math.min(1, value)); // Clamp to 0-1 range
                heights[y][x] = Math.floor(value * (this.maxDepth + 1));
            }
        }
        performance.mark('noise-calculation-end');
        
        performance.mark('noise-generation-end');
        
        // Measure performance
        performance.measure('Noise Function Selection', 'noise-function-selection-start', 'noise-function-selection-end');
        performance.measure('Noise Calculation', 'noise-calculation-start', 'noise-calculation-end');
        performance.measure('Total Noise Generation', 'noise-generation-start', 'noise-generation-end');
        
        // Log detailed performance info
        const measures = performance.getEntriesByType('measure');
        const recentMeasures = measures.slice(-3);
        console.log(`      └─ Noise Performance (${this.worldW}x${this.worldH}, ${this.noiseSettings.octaves} octaves):`);
        recentMeasures.forEach(measure => {
            console.log(`         ${measure.name}: ${measure.duration.toFixed(2)}ms`);
        });
        
        if (warpedPixels > 0) {
            console.log(`         Warped pixels: ${warpedPixels} (${(warpedPixels/(this.worldW*this.worldH)*100).toFixed(1)}%)`);
        }
        if (standardPixels > 0) {
            console.log(`         Standard pixels: ${standardPixels} (${(standardPixels/(this.worldW*this.worldH)*100).toFixed(1)}%)`);
        }
        
        return heights;
    }
    
    getNoiseSettings() {
        return this.noiseSettings;
    }
}
