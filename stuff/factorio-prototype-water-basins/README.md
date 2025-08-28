# Tilemap Water Pumping - Refactored

This project has been refactored to separate concerns and improve maintainability.

## File Structure

- **`visualization.html`** - Main HTML structure with minimal inline content
- **`styles.css`** - All CSS styles separated from HTML
- **`logic.js`** - All JavaScript logic and functionality
- **`pumping.js`** - Original monolithic file (kept for reference)

## Features

- **Separation of Concerns**: Styles, logic, and presentation are now in separate files
- **Cache Busting**: JavaScript-based cache busting prevents browser caching issues
- **Maintainability**: Code is easier to read, debug, and modify
- **Same Functionality**: All original features are preserved

## Cache Busting

The application uses timestamp-based cache busting to ensure browsers always load the latest versions of CSS and JavaScript files:

```javascript
const cacheBuster = Date.now();
document.write(`<link rel="stylesheet" href="styles.css?v=${cacheBuster}">`);
```

This approach works in static environments without server-side processing.

## Development

To modify the application:

1. **Styles**: Edit `styles.css` for visual changes
2. **Logic**: Edit `logic.js` for functionality changes  
3. **Structure**: Edit `visualization.html` for layout changes

The cache busting ensures changes are immediately visible without manual cache clearing.
