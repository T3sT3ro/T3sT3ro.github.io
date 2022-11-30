
import me.tooster.util.IntRange2D
import java.io.File
import java.util.*
import kotlin.random.Random

typealias Tile = Pair<Int, Int>
operator fun Tile.plus(other: Tile): Tile = first + other.first to second + other.second

open class Tilemap(val width: Int, val height: Int, val weights: Map<Tile, Int>) {
    val rowRange get() = 1..height
    val colRange get() = 1..width
    val range2D get() = IntRange2D(rowRange, colRange)

    /** Create tilemap with random positive weights. */ // Not the best spot to generate random map but whatevs
    constructor(width: Int, height: Int) : this(width, height, mutableMapOf<Tile, Int>()) {
        weights as MutableMap
        for (r in rowRange) for (c in colRange) weights[r to c] = Random.nextInt(1, 100)
    }

    // to check `tile in tilemap` -- if a tile is in bounds of the map
    operator fun contains(tile: Tile) = tile.first in 1..height && tile.second in 1..width
    override fun toString(): String {
        val sb = StringBuilder()
        for ((r, c) in range2D) {
            sb.append("[%02d]".format(weights[r to c]!!))
            if (c == colRange.last) sb.append('\n')
        }
        return sb.toString()
    }
}

class Dijkstra(tilemap: Map<Tile, Int>, source: Tile) {
//    val d: Map<Tile, Int>
//    val predecessor: Map<Tile, Tile>

    init {
        // init the distance function, priority queue and path
        val d = mutableMapOf<Tile, Int>().withDefault { Int.MAX_VALUE } // distance from source
        val predecessor: MutableMap<Tile, Tile> = mutableMapOf()

        d[source] = tilemap[source]!! // `!!` converts nullable (Int?) to non-nullable (Int)
        predecessor[source] = source
        val Q = PriorityQueue<Tile> { t1, t2 -> d[t1]!! - d[t2]!! } // priority queue by distance from source
        Q.add(source) // we start solely with source in the queue


        while (Q.isNotEmpty()) {
            val tile = Q.poll()
            for (delta in listOf(0 to 1, 0 to -1, 1 to 0, -1 to 0)) {
                val neighbor = tile + delta
                if (neighbor in tilemap && d[tile]!! + d[neighbor]!! < d[neighbor]!!) { // relax by crossing current tile
                    d[neighbor] = d[tile]!! + d[neighbor]!!
                    predecessor[neighbor] = tile
                }
            }
        }
    }

//    fun asciArt(map: Map<Tile, Int>): String {
//        val sb = StringBuilder()
//        val colRange = map.minByOrNull { it.key.first }!!.key.first .. map.maxByOrNull { it.key.first }!!.key.first
//        val rowRange = map.minByOrNull { it.key.second }!!.key.second .. map.maxByOrNull { it.key.second }!!.key.second
//
//        for ((r, c) in IntRange2D(rowRange, colRange)) {
//            val pred = predecessor[r to c]!!
//            sb.append(
//                when {
//                    pred.first < r  -> '↑'
//                    pred.first > r  -> '↓'
//                    pred.second < c -> '←'
//                    pred.second > c -> '→'
//                    else            -> '+'
//                }
//            )
//
//            if (c == colRange.last) sb.append('\n')
//        }
//        return sb.toString()
//    }
}

fun main() {
    val map = File("/home/tooster/workspace/ttr/T3sT3ro.github.io/algo/AoC/2021/IN/15")
        .readLines()
        .flatMapIndexed { r: Int, line: String ->
            line.split("").mapIndexed { c, char -> (r to c) to char.toInt()}
        }.toMap()

    val dijkstra = Dijkstra(map, 0 to 0)
    println(dijkstra)
}