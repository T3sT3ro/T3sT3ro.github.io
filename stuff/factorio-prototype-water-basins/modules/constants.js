// UI Constants and styling configuration

export const UI_CONSTANTS = {
  // Legend selection styling
  LEGEND_SELECTION: {
    BORDER_COLOR: "orange",
    BORDER_WIDTH: "3px",
    BORDER_RADIUS: "4px",
    PADDING: "2px",
    CSS_CLASS: "legend-item-selected",
  },

  // Brush constants
  BRUSH: {
    MIN_SIZE: 1,
    MAX_SIZE: 16,
    PREVIEW_DASH: [2, 2],
    PREVIEW_COLOR: "rgba(255, 255, 0, 0.8)",
    OVERLAY_FILL: "rgba(255, 255, 255, 0.1)",
    OVERLAY_LINE_WIDTH: 2,
  },

  // Performance monitoring
  PERFORMANCE: {
    LOG_ENABLED: true,
    INDENT: {
      LEVEL_1: "  └─ ",
      LEVEL_2: "    └─ ",
      LEVEL_3: "      └─ ",
      LEVEL_4: "         ",
    },
  },

  // Rendering constants
  RENDERING: {
    // Camera and zoom settings
    CAMERA: {
      MIN_ZOOM: 0.25,
      MAX_ZOOM: 4,
      INITIAL_ZOOM: 1,
      INITIAL_X: 0,
      INITIAL_Y: 0,
    },

    // Terrain colors
    COLORS: {
      TERRAIN: {
        SURFACE: "rgb(139, 69, 19)", // Brown for surface (depth 0)
        DEPTH_LIGHT_GRAY: 220, // Light gray value for shallow water
        DEPTH_DARK_GRAY: 40,   // Dark gray value for deep water  
        DEPTH_GRAY_RANGE: 180, // Range between light and dark gray
      },
      
      WATER: {
        BASE_COLOR: "50,120,200", // RGB values for water (used in rgba)
        MIN_ALPHA: 0.12,
        ALPHA_PER_LEVEL: 0.06,
        MAX_ALPHA: 0.7,
      },

      INFRASTRUCTURE: {
        CHUNK_BOUNDARIES: "rgba(255,0,0,0.2)",
        PUMP_CONNECTIONS: "red",
      },

      PUMPS: {
        INLET: "rgba(200, 0, 0, 0.7)",     // Red for inlet pumps
        OUTLET: "rgba(0, 255, 0, 0.7)",   // Green for outlet pumps  
        SELECTED_HIGHLIGHT: "rgba(255, 255, 0, 0.5)", // Yellow highlight for selected reservoir
        
        // Solid colors for labels
        INLET_LABEL: "red",
        OUTLET_LABEL: "green",
      },

      BASIN_HIGHLIGHT: {
        FILL: "rgba(255, 255, 0, 0.5)",   // Yellow fill for highlighted basins
        STROKE: "orange",                 // Orange outline for highlighted basins
      },

      LABELS: {
        TEXT_LIGHT_BG: "black",    // Text color on light backgrounds
        TEXT_DARK_BG: "white",     // Text color on dark backgrounds
        STROKE_LIGHT_BG: "white",  // Text stroke on light backgrounds
        STROKE_DARK_BG: "black",   // Text stroke on dark backgrounds
        GRAY_THRESHOLD: 130,       // Threshold for switching text colors
      },
    },

    // Scaling and sizing
    SCALING: {
      FONT: {
        BASE_SIZE: 10,
        MIN_SIZE: 8,
        MAX_SIZE: 16,
        SCALE_THRESHOLD_MIN: 0.5, // Below this zoom, scale font
        SCALE_THRESHOLD_MAX: 2,   // Above this zoom, cap font size
      },
      
      LINE_WIDTH: {
        BASE_WIDTH: 1,
        MIN_WIDTH: 0.5,
        SCALE_THRESHOLD: 0.5, // Below this zoom, scale line width
        PUMP_BASE_WIDTH: 2,
        HIGHLIGHT_BASE_WIDTH: 3,
        LABEL_STROKE_MULTIPLIER: 2, // Multiplier for label stroke width
      },

      PUMP: {
        RADIUS_MULTIPLIER: 1,    // Multiplier for pump circle radius (times TILE_SIZE)
        HIGHLIGHT_RADIUS_MULTIPLIER: 1.8, // Multiplier for highlighted pump radius
        LABEL_Y_OFFSET_MULTIPLIER: -2,    // Y offset for pump labels (times TILE_SIZE)
      },
    },

    // Line patterns
    PATTERNS: {
      PUMP_CONNECTIONS: {
        DASH_NORMAL: [5, 3],  // Dash pattern for normal zoom
        DASH_ZOOMED_OUT: [10, 6], // Dash pattern for zoomed out view
        DASH_THRESHOLD: 0.5,  // Zoom threshold for switching patterns
      },
    },
  },

  // Control mappings for display
  CONTROLS: {
    PAINTING: [
      { keys: "0-9", action: "Select depth level" },
      { keys: "LMB drag", action: "Paint terrain with selected depth" },
      { keys: "ALT + Mouse wheel", action: "Change selected depth" },
      { keys: "ALT + RMB", action: "Pipette tool (pick depth)" },
      { keys: "SHIFT + Mouse wheel", action: "Change brush size (1-8)" },
    ],
    PUMPS: [
      { keys: "SHIFT + LMB", action: "Add outlet pump" },
      { keys: "SHIFT + RMB", action: "Add inlet pump" },
      { keys: "SHIFT + CTRL + LMB", action: "Link pump to pipe system" },
    ],
    TERRAIN: [
      { keys: "CTRL + LMB", action: "Flood fill" },
      { keys: "CTRL + RMB", action: "Flood empty" },
    ],
    NAVIGATION: [
      { keys: "MMB drag", action: "Pan view" },
      { keys: "Mouse wheel", action: "Zoom in/out" },
    ],
  },

  // Button styling
  BUTTONS: {
    REMOVE: {
      BACKGROUND_COLOR: "#dc3545",
      BACKGROUND_COLOR_HOVER: "#c82333",
      TEXT_COLOR: "white",
      BORDER_RADIUS: "4px",
      PADDING: "2px 6px",
      FONT_SIZE: "0.75rem",
      BORDER: "none",
      CURSOR: "pointer",
    },
  },
};

// CSS class names for consistent styling
export const CSS_CLASSES = {
  LEGEND_ITEM: "legend-item",
  LEGEND_ITEM_SELECTED: "legend-item-selected",
  LEGEND_COLOR: "legend-color",
  CONTROL_ITEM: "control-item",
  CONTROL_BOX: "control-box",
};

