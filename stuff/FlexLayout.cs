// By Tooster
// easily ported to any other language
// based on unity classes

// todo: stretch for justify 
public class Flex
{

    public interface Widget
    {
        float Width { get; set; }
        float Height { get; set; }
        Vector2 Origin { get; set; }

    }

    // ! do not change bit values ! algorithm uses bitmasks to determine proper directions of widgets

    /// orientation: main axis parallel to 0:x 1:y
    /// flow: 0:axis points towards negative cartesian halfplane 1:--||-- positive halfplane 
    /// 0b[mainAxisOrientation][mainAxisFlow][crossAxisFlow]
    private const int _PAD = 128; // mask for ALIGN* enums to specify if they should take element/line separation into account
    public enum FLEX_DIRECTION { ROW = 0b010, ROW_REVERSED = 0b000, COLUMN = 0b101, COLUMN_REVERSED = 0b111 }
    public enum FLEX_ALIGN { START = _PAD | 0, CENTER = _PAD | 1, END = _PAD | 2, SPACE_BETWEEN = 2, SPACE_AROUND = 1, SPACE_EVENLY = 0 }
    public enum FLEX_ALIGN_ITEMS { START = 0, CENTER = 1, END = 2, [Tooltip("all origins on the same line")] BASELINE = 4 }
    public enum FLEX_WRAP { NORMAL = 0b000, REVERSED = 0b001 }
    private enum FLEX_AXIS { MAIN_AXIS = 0b010, CROSS_AXIS = 0b101 }

    [Tooltip("Direction of main axis (direction of adding items)")]
    public FLEX_DIRECTION direction = FLEX_DIRECTION.ROW;

    [Tooltip("Alignment of the whole flexbox along cross axis (direction of adding lines)")]
    public FLEX_ALIGN alignContent = FLEX_ALIGN.START;

    [Tooltip("Alignment of items along main axis in current line")]
    public FLEX_ALIGN justifyContent = FLEX_ALIGN.START;

    [Tooltip("Alignment of items along cross axis of current line. Origins mark baseline")]
    public FLEX_ALIGN_ITEMS alignItems = FLEX_ALIGN_ITEMS.START;

    [Tooltip("Direction of cross axis - default for row is down and for column is right")]
    public FLEX_WRAP wrap = FLEX_WRAP.NORMAL;

    // ignored in automatic margin calculation modes such as space around etc.
    public float itemSeparation = 0;
    public float lineSeparation = 0;

    #region FLEX - helper bitmask operations

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private bool IsAxisHorizontal(FLEX_AXIS axis) { return (((int)direction ^ (int)axis) & 0b100) == 0; }

    // returns size along axis, so if for example direction is COLUMN and axis is MAIN_AXIS then width is widget's height
    // width is always positive.
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private float GetSizeAlongAxis(Widget widget, FLEX_AXIS axis) { return IsAxisHorizontal(axis) ? widget.Width : widget.Height; }

    // returns +1 if axis points towards cartesian positives and -1 otherwise FIXME: think about replacing it
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private int GetAxisFlow(FLEX_AXIS axis) { return (0b011 & (int)axis & ((int)direction ^ (int)wrap)) == 0 ? -1 : 1; }

    // returns the multiplier p for size along axis so that origin is D=p*size away from the first edge along the axis 
    // <-----1[   +--D--]0-----main-axis--------   aka origin but counted from the item-start edge
    // reverse specifies if the other direction along axis should be taken 
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private float GetOriginAlongAxis(Widget widget, FLEX_AXIS axis, bool reverse = false)
    {
        var origin = (IsAxisHorizontal(axis) ? widget.Origin.x : widget.Origin.y);
        return (GetAxisFlow(axis) > 0) ^ reverse ? origin : 1 - origin;
    }

    // returns offset from origin of the second edge in axis direction.
    // reverse is for flipping the axis direction.
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private float GetExtentAlongAxis(Widget widget, FLEX_AXIS axis, bool reverse = false)
    {
        var size = GetSizeAlongAxis(widget, axis);
        return size - size * GetOriginAlongAxis(widget, axis, reverse);
    }

    // returns the extent from origin to the second edge in direction of axis of the box bounding widget and it's origin
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private float GetBoundingExtentAlongAxis(Widget widget, FLEX_AXIS axis, bool reverse = false)
    {
        return Mathf.Max(0, GetExtentAlongAxis(widget, axis, reverse));
    }

    // returns size of bounding box of widget (widget and origin) along axis. If origin is inside box, the BB = size
    // Otherwise it is size + offset of origin in given axis; unused -maybe for stretch ? idk, leaving it in case...
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private float GetBoundingSizeAlongAxis(Widget widget, FLEX_AXIS axis)
    {
        var origin = GetOriginAlongAxis(widget, axis);
        return GetSizeAlongAxis(widget, axis) * Mathf.Max(1.0f, origin > 0 ? origin : 1 - origin);
    }

    // returns true if padding from line/element separation should be applied according to layout rules 
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private bool ShouldPad(FLEX_ALIGN align)
    {
        return ((int)align & _PAD) == _PAD;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private Vector2 AxisToVector2(FLEX_AXIS axis)
    {
        return (IsAxisHorizontal(axis) ? Vector2.right : Vector2.up) * GetAxisFlow(axis);
    }

    #endregion

    public class Line
    {
        // baseline marks the snapping point for widgets in line. for START it snaps START edge of widget in crossAxis direction,
        // for END analogous, CENTER for widget's volume center and BASELINE for origin directly on baseline
        internal float startToBaseline = 0;
        internal float baselineToEnd = 0;
        internal float mainAxisSize = 0;
        internal readonly List<Widget> widgets = new List<Widget>();

        public static Line NextLine() { return new Line(); } // replace with Pool fetch
        public void Reset() { startToBaseline = baselineToEnd = mainAxisSize = 0; widgets.Clear(); }
        public float CrossSize => startToBaseline + baselineToEnd;
    }

    private readonly List<Line> flexLines = new List<Line>(16); // initial capacity: 16
    private Vector2 flexMainAxisVector; // maps main axis flow to cartesian vector
    private Vector2 flexCrossAxisVector; // maps cross axis flow to cartesian vector

    // elementSeparation and distanceBetweenRows functions as margins 
    void FlexRevalidate(Widget containerWidget)
    {
        flexMainAxisVector = AxisToVector2(FLEX_AXIS.MAIN_AXIS);
        flexCrossAxisVector = AxisToVector2(FLEX_AXIS.CROSS_AXIS);

        float containerWidgetMainAxisSize = GetSizeAlongAxis(containerWidget, FLEX_AXIS.MAIN_AXIS); // available space in main axis
        float containerWidgetCrossAxisSize = GetSizeAlongAxis(containerWidget, FLEX_AXIS.CROSS_AXIS); // available space in cross axis

        float itemPad = ShouldPad(justifyContent) ? elementSeparation : 0.0f;

        float contentCrossAxisSize = 0; // height of all rows in ROW mode

        { // determining lines and in-line positioning
            var line = Line.NextLine();
            float compulsoryItemPad = 0;
            // cross axis align items and lines setup
            foreach (Transform child in transform)
            {
                var item = child.gameObject;
                var widget = GetWidget(item);
                if (widget == null || !item.activeSelf)
                { // could be replaced for unsafe elvis operator but bypass unity lifetime check
                    if (item.name == "--br--")
                    {
                        contentCrossAxisSize += AlignLineItems(ref line, containerWidgetMainAxisSize).CrossSize;
                        line = Line.NextLine(); // lines are not expensive
                    }

                    continue; // add --br-- elements that ProcessLine and don't increase contentCrossAxisSize
                }

                widget.Revalidate();

                var itemSize = GetSizeAlongAxis(widget, FLEX_AXIS.MAIN_AXIS);
                // next widget would overflow
                if (line.mainAxisSize + itemSize + compulsoryItemPad > containerWidgetMainAxisSize + lineOverflowTolerance && line.widgets.Count > 0)
                {
                    contentCrossAxisSize += AlignLineItems(ref line, containerWidgetMainAxisSize).CrossSize;
                    line = Line.NextLine();
                    compulsoryItemPad = 0;
                }

                // determine the baseline and size of widget. It may be convertible to another bitmask ops. but branch predictor should do great job
                switch (alignItems)
                {
                    case FLEX_ALIGN_ITEMS.START:
                        line.startToBaseline = 0;
                        line.baselineToEnd = Mathf.Max(line.baselineToEnd, GetSizeAlongAxis(widget, FLEX_AXIS.CROSS_AXIS));
                        break;
                    case FLEX_ALIGN_ITEMS.CENTER:
                        line.startToBaseline = line.baselineToEnd = Mathf.Max(line.startToBaseline, GetSizeAlongAxis(widget, FLEX_AXIS.CROSS_AXIS) / 2);
                        break;
                    case FLEX_ALIGN_ITEMS.END:
                        line.startToBaseline = Mathf.Max(line.startToBaseline, GetSizeAlongAxis(widget, FLEX_AXIS.CROSS_AXIS));
                        line.baselineToEnd = 0;
                        break;
                    case FLEX_ALIGN_ITEMS.BASELINE:
                        line.startToBaseline = Mathf.Max(line.startToBaseline, GetBoundingExtentAlongAxis(widget, FLEX_AXIS.CROSS_AXIS, true));
                        line.baselineToEnd = Mathf.Max(line.baselineToEnd, GetBoundingExtentAlongAxis(widget, FLEX_AXIS.CROSS_AXIS, false));
                        break;
                }
                line.mainAxisSize += itemSize;
                line.widgets.Add(widget);
                compulsoryItemPad += itemPad;
            }

            // process leftover line
            if (line.widgets.Count > 0)
                contentCrossAxisSize += AlignLineItems(ref line, containerWidgetMainAxisSize).CrossSize;
            // else return to Pool
        }

        // main axis align lines and content
        SetupAlignCursor(alignContent, flexLines.Count, containerWidgetCrossAxisSize - contentCrossAxisSize,
                         lineSeparation, out var crossCursor, out var padding);
        crossCursor -= GetExtentAlongAxis(containerWidget, FLEX_AXIS.CROSS_AXIS, true);
        float mainCursor = -GetExtentAlongAxis(containerWidget, FLEX_AXIS.MAIN_AXIS, true);
        foreach (var line in flexLines)
        {
            foreach (var widget in line.widgets)
            {
                var pos = widget.GetLocalPosition();
                widget.SetLocalPosition(pos + flexMainAxisVector * (mainCursor) + flexCrossAxisVector * (crossCursor));
            }

            crossCursor += padding + line.CrossSize;
            // return line to Pool
        }

        containerWidget.RevalidateHierarchy();
        flexLines.Clear();
    }

    // sets startOffset for cursor from the beginning of axis so that placing item and later pad results in proper layout
    private void SetupAlignCursor(FLEX_ALIGN align, int itemCount, float freeSpace, float preferredPadding, out float startOffset, out float pad)
    {
        pad = ShouldPad(align)
            ? preferredPadding
            : freeSpace / (itemCount == 1 ? 1.0f : itemCount + (1 - (int)align)); // for 1 item pad=freeSpace
        startOffset = pad + (ShouldPad(align)
            ? (freeSpace - (itemCount - 1) * pad) * ((int)align & ~_PAD) / 2.0f - pad
            : -pad * (itemCount == 1 ? .5f : (int)align / 2.0f));
    }

    // aligns items properly in lines according to line start and baseline
    private Line AlignLineItems(ref Line line, in float availableMainSize)
    {
        SetupAlignCursor(justifyContent, line.widgets.Count, availableMainSize - line.mainAxisSize, elementSeparation,
                                     out var mainCursor, out var padding);

        foreach (Widget widget in line.widgets)
        {
            widget.SetLocalPosition(flexMainAxisVector * (mainCursor + GetExtentAlongAxis(widget, FLEX_AXIS.MAIN_AXIS, true)) // main axis align
                                    + flexCrossAxisVector  // cross axis align
                                    * (line.startToBaseline + (1 - (int)alignItems / (int)FLEX_ALIGN_ITEMS.BASELINE) // baseline mode cancels origin offset 
                                       * (GetExtentAlongAxis(widget, FLEX_AXIS.CROSS_AXIS, true) // snaps begin edge of widget to baseline 
                                          - GetSizeAlongAxis(widget, FLEX_AXIS.CROSS_AXIS) * (int)alignItems / 2.0f)));
            mainCursor += padding + GetSizeAlongAxis(widget, FLEX_AXIS.MAIN_AXIS);
        }
        flexLines.Add(line);
        return line;
    }
}