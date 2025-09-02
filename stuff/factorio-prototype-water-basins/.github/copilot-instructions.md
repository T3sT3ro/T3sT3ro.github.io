# Factorio Water Basins - AI Developer Guide

## Architecture Overview

This is a **canvas-based water simulation** using vanilla ES6 modules with a **dependency injection pattern**. The main controller (`app.js`) orchestrates 6 core modules through constructor injection, not typical import/export chains.

### Module Dependency Flow
- **app.js** → loads all modules via dynamic imports with cache busting → injects dependencies via constructors
- **GameState** manages simulation state and coordinates: BasinManager, PumpManager, ReservoirManager
- **Renderer** uses layered off-screen canvases for performance (terrain/infrastructure/water/interactive)
- **UI modules** handle controls and debug displays with callback-based communication

### Key Pattern: Constructor Dependency Injection
```javascript
// In app.js - this is the core pattern
const app = new TilemapWaterPumpingApp(
  setupCanvas, CONFIG, GameState, Renderer, /* ... */
);
```

## Development Workflow

### Essential Commands
```bash
# Development with auto-reload
deno task dev

# Full debugging (server + browser DevTools)  
deno task debug  # then chrome://inspect

# Code maintenance
deno task fmt && deno task lint && deno task check
```

### Cache Busting System
- **Development**: Automatic timestamp-based (`Date.now()`)
- **Production**: Manual version bump in `index.html` (`window.moduleVersion = "1.0.2"`)
- **Critical**: When modules change, increment `moduleVersion` to prevent stale imports

## Code Patterns & Conventions

### Configuration System
- **`modules/config.js`**: Core simulation constants (world size, tile size, pump rates)
- **`modules/constants.js`**: UI constants, styling, control mappings, performance settings
- **Key constants**: `CONFIG.WORLD_W/H` (160x160), `CONFIG.MAX_DEPTH` (9), `CONFIG.PUMP_RATE` (1)

### CSS Modern Patterns
```css
/* Uses Open Props design tokens + custom semantic variables */
:root {
  --brand: var(--brand-light);
  --surface-1: var(--surface-1-light);
}

/* Modern CSS nesting and logical properties */
.control-box {
  & h4 {
    margin: 0 0 var(--size-2) 0;
    display: flex;
    justify-content: space-between;
  }
}
```

### Basin Tree Structure - **CRITICAL CONCEPT**
- **Forest structure**: Multiple disconnected basin trees (not single tree)
- **Bottom-up flow**: Water flows from deeper (higher ID) to shallower (lower ID) basins
- **Outlet relationships**: `outlets[]` contains IDs of deeper basins this basin can overflow to
- **Pump references**: Each pump holds `reservoirId` and operates on basin at pump location
- **Overflow cascade**: When basin fills beyond capacity, water distributes equally to all outlets

```javascript
// Basin structure example:
{
  "1#A": { outlets: ["2#A"], height: 1 },  // Shallow, receives from 2#A
  "2#A": { outlets: [], height: 2 }        // Deep, overflows to 1#A
}
```

### Basin System Architecture
- **Hierarchical flood-fill**: Basins computed by depth, with outlet connections to lower depths
- **Smart diagonal blocking**: Land tiles prevent diagonal water flow (see `basins.js:91`)
- **ID format**: `{depth}#{letter}` (e.g., "3#A", "3#B" for multiple basins at depth 3)
- **3-pass algorithm**: flood-fill → outlet detection → ID assignment

### Rendering Performance Pattern
```javascript
// Layered rendering - only dirty layers redrawn
this.layerDirty = {
  terrain: true,
  infrastructure: true, 
  water: true,
  interactive: true
};
this.markLayerDirty('all'); // or specific layer
```

### Event Handling Pattern
- **Mouse interaction**: Complex state machine in `app.js:402-590`
- **UI callbacks**: Modules communicate via callback injection (see `DebugDisplay.constructor`)
- **State coordination**: GameState methods trigger renderer updates via `this.draw()`

### Save/Load Data Compression
Two compression schemes available:
- **Basin optimization**: 2D spatial mapping vs coordinate lists (see `BASIN_OPTIMIZATION_EXAMPLE.md`)
- **Height encoding**: 2D arrays, RLE, or Base64 packing (see `COMPRESSION_OPTIONS.md`)

## Module Responsibilities

### `modules/game.js` - Simulation State
- Orchestrates BasinManager, PumpManager, ReservoirManager
- Handles save/load with multiple format versions
- **Key method**: `computeBasins(heights)` - rebuilds entire basin hierarchy

### `modules/renderer.js` - Layered Rendering  
- 4-layer off-screen canvas system for 60fps performance
- Camera transforms with zoom constraints (0.25x - 4x)
- **Performance critical**: Only redraws dirty layers

### `modules/basins.js` - Hierarchical Water Bodies
- Flood-fill algorithm with diagonal blocking logic
- Basin outlet detection for water flow simulation  
- **Complex**: Multi-pass algorithm (flood-fill → outlet detection → ID assignment)
- Tree structure accelerating tick queries

### `modules/pumps.js` - Water Transfer System
- ReservoirManager: Water storage separate from basins
- PumpManager: Transfers water between basins and reservoirs
- **Pump linking**: Selected reservoir ID drives pump assignments

## Critical Edge Cases

### Basin Flow Edge Cases
- **Disconnected basin forests**: Multiple independent basin trees can coexist
- **Circular overflow**: Basin A → B → A cycles prevented by depth-based flow direction
- **Empty outlet basins**: If outlet basin doesn't exist, overflow is lost (safe failure)
- **Multi-outlet distribution**: Overflow splits equally among all valid outlets

### Boundary Conditions
- **World boundaries**: All coordinate checks include `x < 0 || x >= CONFIG.WORLD_W` validation
- **Diagonal blocking validation**: Requires both orthogonal crossing tiles to be land
- **Basin existence**: All basin lookups check `this.basins.get(id)` for null

### Performance Edge Cases
- **Large basin computation**: Performance tracking via `performance.mark()` in basin computation
- **Rendering performance**: Layers only redraw when marked dirty via `markLayerDirty()`
- **Memory leaks**: Basin maps cleared on each terrain change via `this.basins.clear()`

### Save/Load Edge Cases
- **Version compatibility**: Multiple format versions (v1, v2, legacy) with fallback handling
- **Basin ID conflicts**: Letter sequence generation handles overflow (a-z, then aa-ab...)
- **Missing data**: All imports include null checks and default values

## Coding Guidelines

- Follow DRY patterns
- Apply SOLID conventions
- Don't leave dead code
- Focus on performance and comment with expected complexity

## Common Tasks

### Adding New UI Controls
1. Add HTML in `index.html` 
2. Add event handler in `app.js:setupEventHandlers()`
3. Update `styles.css` with `.control-box` pattern
4. Wire callbacks through constructor injection

### Performance Debugging
- Use `performance.mark()` and `performance.measure()` (see basin computation)
- Check layer dirty flags: `renderer.layerDirty` 
- Monitor flood-fill performance in console logs

### Extending Save Format
1. Add new encoding in `modules/saveload.js`
2. Update `GameState.exportToJSON()` and `importFromJSON()`
3. Handle version compatibility in import logic
4. Document in COMPRESSION_OPTIONS.md

## Debugging Setup

VS Code configurations available:
- **"Launch Chrome against localhost"**: Frontend debugging
- **"Attach to Deno"**: Server-side debugging  
- **"Launch Chrome + Debug Deno"**: Full-stack debugging

The layered architecture and dependency injection make this codebase highly modular but require understanding the orchestration pattern in `app.js` to be effective.
