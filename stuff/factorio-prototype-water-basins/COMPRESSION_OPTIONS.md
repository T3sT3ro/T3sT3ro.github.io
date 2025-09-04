# Tilemap and Basin Encoding Options

## Height Data Compression

### Current Implementation: 2D Array Format

- **Pros**: Human-readable, easy to debug
- **Format**: Each row on a new line, digits concatenated
- **Example**:
  ```
  0123456789
  1234567890
  2345678901
  ```

### Alternative 1: Run-Length Encoding (RLE)

- **Best for**: Maps with large uniform areas
- **Compression ratio**: Very high for sparse/uniform data
- **Format**: Array of [value, count] pairs
- **Example**: `[[0,50], [1,10], [2,5]]` means 50 zeros, 10 ones, 5 twos

### Alternative 2: Base64 + Bit Packing

- **Best for**: Maximum compression regardless of content
- **Compression ratio**: ~50% (2 height values per byte)
- **Format**: Base64 encoded binary data
- **Trade-off**: Not human-readable

## Basin Data Compression (New Optimized Format)

### Current Implementation: Optimized Tree + 2D Map

- **Basin ID Map**: 2D array where each cell contains the basin ID for that tile
- **Basin Tree**: Hierarchical structure showing outlet relationships between basins
- **Basin Metadata**: Volume, water level, and other properties per basin

#### Format Structure:

```json
{
  "format": "optimized_v1",
  "basinIdMap": {
    "format": "string_rows",
    "data": "0|0|1A|1A|2A\n0|1A|1A|2A|2A\n..."
  },
  "basinTree": {
    "1A": { "outlets": ["2A"], "height": 1 },
    "2A": { "outlets": [], "height": 2 }
  },
  "basinMetadata": {
    "1A": { "volume": 100, "level": 2, "tileCount": 15 },
    "2A": { "volume": 50, "level": 1, "tileCount": 8 }
  }
}
```

#### Benefits:

- **Space Efficient**: Stores basin topology once, not per tile
- **Fast Reconstruction**: Direct 2D array mapping
- **Tree Structure**: Preserves outlet/overflow relationships
- **Scalable**: Works well with large maps and many basins

### Legacy Format (Backward Compatible)

- Individual basin objects with tile coordinate lists
- Still supported for existing save files

## Usage

### Height Compression

To switch compression methods, modify the `compressHeights()` method:

```javascript
// Current: Readable format
return this.compressHeights2DArray(heights);

// For sparse maps: Run-length encoding
return this.runLengthEncode(heights);

// For maximum compression: Base64 packed
return this.base64Encode(heights);
```

### Basin Compression

Basin compression is automatically optimized and uses the new format by default. The system automatically detects and handles legacy formats during import.

All formats are automatically detected and handled during import.
