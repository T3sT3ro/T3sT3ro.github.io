// Configuration constants for the tilemap water pumping simulation
export const CONFIG = {
  CHUNK_SIZE: 16,
  CHUNKS_X: 10,
  CHUNKS_Y: 10,
  TILE_SIZE: 6, // pixels
  MAX_DEPTH: 9,
  VOLUME_UNIT: 1,
  PUMP_RATE: 1, // volume per tick

  // Basin computation thresholds
  BASIN_COMPUTATION: {
    INCREMENTAL_THRESHOLD: 0.1, // Fraction of world tiles changed before full recomputation
    DIRECTIONS: {
      ORTHOGONAL: [[1, 0], [-1, 0], [0, 1], [0, -1]],
      DIAGONAL: [[1, 1], [-1, -1], [1, -1], [-1, 1]],
      ALL: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    }
  },

  get WORLD_W() {
    return this.CHUNKS_X * this.CHUNK_SIZE;
  },
  get WORLD_H() {
    return this.CHUNKS_Y * this.CHUNK_SIZE;
  },
};

// Canvas configuration
export function setupCanvas() {
  const canvas = document.getElementById("canvas");
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  canvas.width = CONFIG.WORLD_W * CONFIG.TILE_SIZE;
  canvas.height = CONFIG.WORLD_H * CONFIG.TILE_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  return { canvas, ctx };
}
