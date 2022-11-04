package me.tooster.util

import me.tooster.util.AXIS.COLS
import me.tooster.util.AXIS.ROWS
import java.lang.Integer.max
import java.util.*
import kotlin.math.abs

// region AXIS
enum class AXIS {
    ROWS, COLS;
}

fun AXIS.other() = when (this) {
    ROWS -> COLS
    COLS -> ROWS
}
// endregion


/**
 * Rose of 8 directions. by default directions assume movement in euclidean space, so vector <code>N</code> would be
 * <code>(0, +1)</code>
 */
enum class Direction {
    /*
            ↑ +Y
      [7]  [0]  [1]
         NW N NE
     [6] W  +  E [2] → +X
         SW S SE
      [5]  [4]  [3]
    */
    N, NE, E, SE, S, SW, W, NW;

    enum class Relative {
        LEFT_FRONT, RIGHT_FRONT, LEFT, RIGHT, LEFT_BACK, RIGHT_BACK, BACK;
    }

    companion object {
        private val values = values()
        val cardinals = values.filter { it.cardinal }
        val diagonals = values.filter { it.diagonal }
        val deltaX = listOf(0, 1, 1, 1, 0, -1, -1, -1)
        val deltaY = listOf(1, 1, 0, -1, -1, -1, 0, 1)
        val cwOffset = listOf(-1, +1, -2, +2, -3, +3, +4)

        /** value from rose, where 0=N, 1=NE ... and other are relative to N */
        fun getRose(index: Int) = values[Math.floorMod(index, values.size)]
    }

    val cardinal get() = this.ordinal % 2 == 0
    val diagonal get() = !cardinal
    infix fun orthogonalTo(other: Direction): Boolean = abs(this.ordinal - other.ordinal) == 2

    fun get(relative: Relative): Direction = getRose(this.ordinal + cwOffset[relative.ordinal])

    val deltaX get() = Companion.deltaX[this.ordinal]
    val deltaY get() = Companion.deltaY[this.ordinal]
    val delta get() = Vec2Int(deltaX, deltaY)
}

class IntRange2D(val rowRange: IntRange, val colRange: IntRange) : Iterable<Vec2Int> {
    val width = colRange.last - colRange.first
    val height = rowRange.last - rowRange.first
    val x = colRange.first
    val y = rowRange.first

    constructor(start: Vec2Int, end: Vec2Int) : this(start.x..end.x, start.y..end.y)

    operator fun contains(point: Pair<Int, Int>): Boolean = point.first in colRange && point.second in rowRange
    override fun iterator() = iterator { for (r in rowRange) for (c in colRange) yield(Vec2Int(r, c)) }
}

data class Vec2Int(val x: Int, val y: Int) {

    constructor(pair: Pair<Int, Int>) : this(pair.first, pair.second)

    operator fun unaryMinus(): Vec2Int = Vec2Int(-x, -y)

    operator fun plus(other: Vec2Int): Vec2Int = Vec2Int(x + other.x, y + other.y)
    operator fun minus(other: Vec2Int): Vec2Int = Vec2Int(x - other.x, y - other.y)
    operator fun times(scalar: Int): Vec2Int = Vec2Int(x * scalar, y * scalar)
    operator fun div(scalar: Int): Vec2Int = Vec2Int(x / scalar, y / scalar)
    operator fun Int.times(other: Vec2Int): Vec2Int = other * this

    /** Squared euclidean norm */
    fun norm2(): Int = (x * x + y * y)

    /** Taxicab norm */
    fun normTaxi(): Int = abs(x) + abs(y)

    /** Chebyshev norm */
    fun normMax(): Int = max(x, y)

    fun translated(d: Direction): Vec2Int = this + d.delta

    fun encoded(): Long = (x.toLong() shl 32) or (y.toLong() and 0xFFFFFFFF)

    override fun hashCode() = (x shl 16) or (y and 0xFFFF)
    fun toPair() = x to y

    override fun toString(): String = "$x $y"
    operator fun rangeTo(other: Vec2Int) = IntRange2D(this, other)
    infix fun until(other: Vec2Int) = this..Vec2Int(other.x - 1, other.y - 1)

    companion object {
        fun decoded(encoded: Long) = Vec2Int((encoded ushr 32).toInt(), (encoded and 0xFFFFFFFF).toInt())
    }
}

class TreePath<T>() {
    var length: Int = 0; private set
    private var head: Node<T>? = null

    constructor(data: T, other: TreePath<T>) : this() {
        length = other.length + 1
        head = Node(data, other.head)
    }

    private data class Node<T>(val data: T, val prev: Node<T>?)

    fun toList(): List<T> = generateSequence(head) { it.prev }.map { it.data }.toList().asReversed()
}

// This would normally be implemented on Long, but Longs don't support shifts, which makes them less robust
// Instead, this one uses Longs to store 64bits of data and truncates bits that are outside of bounds
data class BitMap2D(val rows: Int, val cols: Int) {
    // lazy cache for operations - to postpone looping through all perpendicular axes when setting bitset
    private val data: EnumMap<AXIS, MutableList<Long>> = EnumMap<AXIS, MutableList<Long>>(mapOf(
        ROWS to MutableList(cols) { 0L },
        COLS to MutableList(rows) { 0L },
    ))

    operator fun get(row: Int, col: Int): Boolean = data[ROWS]!![row] and (1L shl col) != 0L

    /**
     * Returns
     */
    operator fun get(axis: AXIS): Sequence<Long> = sequence { for (b in data[axis]!!) yield(b) }

    /**
     *  For example [ROWS, 2] returns NEW bitset corresponding to 3rd row (0-indexed)
     */
    operator fun get(axis: AXIS, idx: Int): Long = data[axis]!![idx]

    fun setBit(number: Long, idx: Int, value: Boolean): Long =
        (number and (1L shl idx).inv()) or ((if (value) 1L else 0L) shl idx)

    operator fun set(row: Int, col: Int, value: Boolean) {
        data[ROWS]!![row] = setBit(data[ROWS]!![row], col, value)
        data[COLS]!![col] = setBit(data[COLS]!![col], row, value)
    }

    operator fun set(axis: AXIS, idx: Int, value: Long) {
        data[axis]!![idx] = value
        for (crossIdx in data[axis.other()]!!.indices)
            data[axis.other()]!![idx] = setBit(data[axis.other()]!![idx], crossIdx, value and (1L shl crossIdx) != 0L)
    }

    /**
     * Returns count of bits set to true
     */
    fun cardinality(): Int = data[ROWS]!!.sumBy { it.countOneBits() }

    fun clone(): BitMap2D {
        val clone = BitMap2D(rows, cols)
        for ((ix, b) in this[ROWS].withIndex()) clone[ROWS, ix] = b
        return clone
    }
}