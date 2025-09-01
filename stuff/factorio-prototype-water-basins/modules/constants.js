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
    PREVIEW_DASH: [1, 2],
    PREVIEW_COLOR: "rgba(255, 255, 255, 0.8)",
    OVERLAY_FILL: "rgba(255, 255, 255, 0.6)",
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

// Utility function to generate control list HTML
export function generateControlsHTML() {
  let html = "";

  // Add terrain painting controls
  html += "<h4>Terrain Painting</h4>";
  UI_CONSTANTS.CONTROLS.PAINTING.forEach((control) => {
    html +=
      `<div class="${CSS_CLASSES.CONTROL_ITEM}"><code>${control.keys}</code> ${control.action}</div>`;
  });

  // Add pump controls
  html += "<h4>Pumps & Water</h4>";
  UI_CONSTANTS.CONTROLS.PUMPS.forEach((control) => {
    html +=
      `<div class="${CSS_CLASSES.CONTROL_ITEM}"><code>${control.keys}</code> ${control.action}</div>`;
  });
  UI_CONSTANTS.CONTROLS.TERRAIN.forEach((control) => {
    html +=
      `<div class="${CSS_CLASSES.CONTROL_ITEM}"><code>${control.keys}</code> ${control.action}</div>`;
  });

  // Add navigation controls
  html += "<h4>Navigation</h4>";
  UI_CONSTANTS.CONTROLS.NAVIGATION.forEach((control) => {
    html +=
      `<div class="${CSS_CLASSES.CONTROL_ITEM}"><code>${control.keys}</code> ${control.action}</div>`;
  });

  return html;
}
