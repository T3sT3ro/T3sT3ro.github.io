# Factorio Water Basins Prototype

A canvas-based water basin simulation inspired by Factorio, featuring hierarchical basin detection, pan/zoom controls, and real-time water flow dynamics.

## Features

- **Hierarchical Basin Detection**: Smart basin grouping that handles nested depth scenarios
- **Interactive Canvas**: Pan with middle mouse, zoom with scroll wheel
- **Real-time Water Flow**: Pumps and water level simulation
- **Smart Labels**: Basin labels with collision avoidance and proper anchoring
- **Performance Optimized**: Integrated rendering pipeline for smooth 60fps performance
- **Modular Architecture**: Clean separation of concerns across multiple ES6 modules

## Development

### Quick Start
```bash
# Install dependencies
pnpm install

# Start development server (with cache busting)
pnpm dev

# Or just serve files
pnpm start
```

### Cache Busting

The application includes automatic cache busting to prevent browser caching issues during development:

1. **Automatic versioning**: HTML includes dynamic module versioning
2. **Development server**: http-server with `-c-1` flag disables caching  
3. **Manual cache bust**: Run `pnpm refresh` to increment version number

```bash
# Force cache refresh when making JS module changes
pnpm refresh
```

### File Structure

- **`index.html`** - Main HTML with cache-busting system
- **`app.js`** - Main application controller with dynamic imports
- **`modules/`** - Core ES6 modules:
  - `config.js` - Configuration and canvas setup
  - `game.js` - Game state and height generation
  - `renderer.js` - Canvas rendering and camera system
  - `basins.js` - Hierarchical basin detection algorithm
  - `labels.js` - Smart label positioning system
  - `pumps.js` - Water pump simulation
  - `ui.js` - User interface controls and settings
  - `noise.js` - Terrain generation with noise functions

## Technical Details

### Basin Detection Algorithm

The hierarchical basin system properly handles complex terrain:
- **Same-depth connectivity**: Basins connect only to tiles of identical depth
- **Diagonal blocking**: Land tiles prevent diagonal water connections
- **Outlet mapping**: Higher depth basins can overflow into lower ones
- **Tree structure**: Basins form a proper hierarchy for water flow simulation

### Performance Optimizations

- **Integrated highlighting**: Single-pass terrain and highlight rendering
- **Efficient lookups**: Spatial indexing for O(1) basin queries
- **Canvas transforms**: Hardware-accelerated pan/zoom using CSS transforms
