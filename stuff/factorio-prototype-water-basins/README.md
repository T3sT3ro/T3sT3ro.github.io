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

### Prerequisites

- [Deno](https://deno.land/) 2.4.5 or later

### Quick Start

```bash
# Start development server
deno task dev

# Start server with debugging enabled  
deno task debug

# Format code
deno task fmt

# Lint code
deno task lint

# Type check
deno task check
```

The development server runs on http://localhost:8000

### Available Tasks

| Task    | Command           | Description                                 |
| ------- | ----------------- | ------------------------------------------- |
| `dev`   | `deno task dev`   | Start development server                    |
| `debug` | `deno task debug` | Start server with Chrome DevTools debugging |
| `serve` | `deno task serve` | Production server                           |
| `fmt`   | `deno task fmt`   | Format code with Deno formatter             |
| `lint`  | `deno task lint`  | Lint code with Deno linter                  |
| `check` | `deno task check` | Type check JavaScript files                 |

### Debugging

#### Chrome DevTools Debugging

1. **Frontend debugging**: Use VS Code's "Launch Chrome against localhost" configuration
2. **Server debugging**: Use VS Code's "Debug Deno Server" configuration
3. **Full debugging**: Use the "Launch Chrome + Debug Deno" compound configuration

#### Manual Chrome DevTools

```bash
# Start server with inspect flag
deno task debug

# Open Chrome and go to chrome://inspect
# Click "Configure" and add localhost:9229
# Click "inspect" on the target
```

### VS Code Launch Configurations

The project includes several debugging configurations:

- **Launch Chrome against localhost**: Opens Chrome with the app and enables frontend debugging
- **Debug Deno Server**: Launches the Deno server with debugging enabled
- **Launch Chrome + Debug Deno**: Compound configuration that starts both server and Chrome

### Cache Busting

The application includes automatic cache busting to prevent browser caching issues:

1. **Development mode**: Automatic timestamp-based cache busting when running on localhost
2. **Production mode**: Fixed version numbers for proper caching
3. **No manual intervention needed**: Cache busting is handled automatically by the HTML

The system automatically detects whether you're running in development (localhost) or production and applies appropriate caching strategies.

### Project Structure

```
├── server.js          # Deno HTTP server with static file serving
├── deno.json          # Deno configuration and tasks
├── index.html         # Main HTML with automatic cache busting
├── app.js             # Main application controller
├── styles.css         # Application styles
├── modules/           # ES6 modules
│   ├── config.js      # Configuration and canvas setup
│   ├── game.js        # Game state and height generation
│   ├── renderer.js    # Canvas rendering and camera system
│   ├── basins.js      # Hierarchical basin detection
│   ├── labels.js      # Smart label positioning
│   ├── pumps.js       # Water pump simulation
│   ├── ui.js          # User interface controls
│   ├── noise.js       # Terrain generation
│   └── constants.js   # Shared constants
└── .vscode/           # VS Code debugging configurations
    ├── launch.json    # Debug launch configurations
    └── tasks.json     # VS Code tasks
```

### Technology Stack

- **Runtime**: Deno 2.4.5+
- **Frontend**: Vanilla JavaScript ES6 modules
- **Server**: Deno built-in HTTP server with static file serving
- **Graphics**: HTML5 Canvas with hardware-accelerated transforms
- **Debugging**: Chrome DevTools integration

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
