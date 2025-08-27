// --- CONFIG ---
const CHUNK_SIZE = 32;
const MAX_DEPTH = 9;
const VOLUME_UNIT = 100; // cubic units per depth-step
const PUMP_RATE = 10; // units per tick

// --- MAP HEIGHT GENERATOR (lazy per chunk) ---
import { createNoise2D } from "simplex-noise";
const noise2D = createNoise2D();

function generateChunkHeights(cx, cy) {
  let arr = Array.from({ length: CHUNK_SIZE }, () => Array(CHUNK_SIZE).fill(0));
  for (let y = 0; y < CHUNK_SIZE; y++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      let wx = cx * CHUNK_SIZE + x;
      let wy = cy * CHUNK_SIZE + y;
      let val = noise2D(wx / 100, wy / 100);
      arr[y][x] = Math.floor(((val + 1) / 2) * MAX_DEPTH); // 0..9
    }
  }
  return arr;
}

// --- GLOBAL STATE ---
let chunks = new Map();      // key: "cx,cy" -> heightmap
let basins = new Map();      // basinId -> Basin object
let basinOfTile = new Map(); // key: "x,y" -> basinId
let pumps = [];              // list of Pump objects
let reservoirs = new Map();  // reservoirId -> Reservoir

let basinCounter = 1;
let reservoirCounter = 1;

// --- STRUCTURES ---
class Basin {
  constructor(id, tiles) {
    this.id = id;
    this.tiles = new Set(tiles); // keys "x,y"
    this.waterLevel = 0;         // depth index [0-9]
    this.volume = 0;
  }
}

class Reservoir {
  constructor(id) {
    this.id = id;
    this.volume = 0;
  }
}

class Pump {
  constructor(x, y, basinId, reservoirId, mode) {
    this.x = x; this.y = y;
    this.basinId = basinId;
    this.reservoirId = reservoirId;
    this.mode = mode; // "inlet" or "outlet"
  }
}

// --- HELPERS ---
function getChunk(cx, cy) {
  let key = `${cx},${cy}`;
  if (!chunks.has(key)) chunks.set(key, generateChunkHeights(cx, cy));
  return chunks.get(key);
}

function getTileHeight(x, y) {
  let cx = Math.floor(x / CHUNK_SIZE);
  let cy = Math.floor(y / CHUNK_SIZE);
  let chunk = getChunk(cx, cy);
  let lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  let ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  return chunk[ly][lx];
}

function setTileHeight(x, y, h) {
  let cx = Math.floor(x / CHUNK_SIZE);
  let cy = Math.floor(y / CHUNK_SIZE);
  let chunk = getChunk(cx, cy);
  let lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  let ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  chunk[ly][lx] = h;
  // trigger basin recomputation (may cause split/merge)
  recalcBasinsAround(x, y);
}

// --- BASIN CALCULATIONS ---
function recalcBasinsAround(x, y) {
  // Simple version: flood fill recompute in neighborhood
  // For production, use dynamic connectivity (Union-Find + cuts)
  let visited = new Set();
  let key = `${x},${y}`;
  floodFill(key, visited);
  // clear old
  for (let k of visited) basinOfTile.delete(k);
  // assign new basin
  let id = basinCounter++;
  let basin = new Basin(id, visited);
  for (let k of visited) basinOfTile.set(k, id);
  basins.set(id, basin);
}

function floodFill(startKey, visited) {
  let stack = [startKey];
  while (stack.length) {
    let k = stack.pop();
    if (visited.has(k)) continue;
    visited.add(k);
    let [x, y] = k.split(",").map(Number);
    let h = getTileHeight(x, y);
    // consider neighbors same height or lower for water region
    for (let [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      let nx = x + dx, ny = y + dy;
      let nk = `${nx},${ny}`;
      if (!visited.has(nk)) {
        let nh = getTileHeight(nx, ny);
        if (nh <= h) stack.push(nk);
      }
    }
  }
}

// --- RESERVOIRS ---
function createReservoir() {
  let id = reservoirCounter++;
  let res = new Reservoir(id);
  reservoirs.set(id, res);
  return id;
}

// --- PUMPS ---
function addPump(x, y, basinId, reservoirId, mode) {
  pumps.push(new Pump(x, y, basinId, reservoirId, mode));
}

// --- TICK ---
function tick() {
  for (let pump of pumps) {
    let basin = basins.get(pump.basinId);
    let reservoir = reservoirs.get(pump.reservoirId);
    if (!basin || !reservoir) continue;

    if (pump.mode === "inlet") {
      if (basin.volume >= PUMP_RATE) {
        basin.volume -= PUMP_RATE;
        reservoir.volume += PUMP_RATE;
      }
    } else { // outlet
      if (reservoir.volume >= PUMP_RATE) {
        reservoir.volume -= PUMP_RATE;
        basin.volume += PUMP_RATE;
      }
    }
  }
  // update water levels from volumes
  for (let basin of basins.values()) {
    basin.waterLevel = Math.floor(basin.volume / (basin.tiles.size * VOLUME_UNIT));
  }
}

// --- DEMO ---
function demo() {
  // init around (0,0)
  recalcBasinsAround(0, 0);
  let b = Array.from(basins.values())[0];
  let r = createReservoir();
  addPump(0, 0, b.id, r, "inlet");
  addPump(10, 10, b.id, r, "outlet");

  // simulate
  for (let i = 0; i < 10; i++) {
    tick();
    console.log("Tick", i, "Basin volume:", b.volume, "Reservoir:", reservoirs.get(r).volume);
  }
}

demo();
