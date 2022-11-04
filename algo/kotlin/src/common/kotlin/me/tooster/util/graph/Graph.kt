package me.tooster.util.graph

import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader

typealias Vertex = Int
//data class Vertex(val id: Int)


class Edge(val target: Vertex, val cost: Int = 1) {
    override fun toString(): String = "$target$$cost"
}

typealias MutableGraph = HashMap<Vertex, MutableList<Edge>>

/*
 * TODO: make Graph class that stores metadata for calculations e.g. shortest path from source to target etc.
 *  make extensions to Graph.lca(a, b) that finds lowest common ancestor etc.
 */
class Graph : HashMap<Vertex, List<Edge>> {
    constructor(vararg graph: Pair<Vertex, List<Edge>>) : super(mapOf(*graph))
    constructor(n: Int) : super(n)

    /**
     * Parses the graph that matches the following formats:
     *
     * legacy format:
     * ```
     * (verts edges? )?             // summary, arrows show if graph is directed
     * source target {cost=1}       // edges list
     * ...                          // end of data indicated by end of stream
     * ```
     *
     * compact format:
     * ```
     * (verts#edges? (->|<-)? )?    // summary, arrows show if and how the graph is directed
     * v (w${cost=1})+              // edge list in compact form, arrow points from source to target
     * ...                          // end of data indicated by end of stream
     * ```
     */
    constructor(inputStream: InputStream = System.`in`) {
        var lines = BufferedReader(InputStreamReader(inputStream))
                .readLines().map { it.trim() }.filter { it.isNotBlank() }
        assert(lines.isNotEmpty()) { "nothing to parse" }


        val summary = Regex("""^(<->|<-|->)?$""").find(lines[0])
        val (IN, INOUT, OUT) = Triple(-1, 0, 1)
        val directionality = when (summary?.groups?.get(1)?.value) {
            "<-" -> IN
            "->" -> OUT
            else -> INOUT // graph is not directed
        }
        if (summary != null) lines = lines.drop(1) // header processed - drop it

        fun addEdge(v: Vertex, w: Vertex, c: Int) {
            // those cases handle TRUE, FALSE and NULL cases
            if (directionality >= INOUT) (this.getOrPut(v, { mutableListOf() }) as MutableList<Edge>).add(Edge(w, c))
            if (directionality <= INOUT) (this.getOrPut(w, { mutableListOf() }) as MutableList<Edge>).add(Edge(v, c))
        }

        lines.forEach { line ->
            val edgeMatch = Regex("""^(\d+)((?:\s+)\d+(?:\s+\d+)?|(?:\s+(?:\d+\$(?:\d+)?))+)${'$'}""")
                    .find(line) ?: throw RuntimeException("nonconformant graph format: $line")
            val vertex = edgeMatch.groupValues[1].toInt()
            val neighbors = edgeMatch.groupValues[2].trim()
            Regex("""(?:(\d+)\$(\d+))|(\d+)(?:\s+(\d+))?""").findAll(neighbors).forEach { match ->
                val neighbor = match.groupValues[1]+match.groupValues[3] // one is always an empty string
                val cost = match.groupValues[2]+match.groupValues[4] // one is always an empty string
                addEdge(vertex, neighbor.toInt(), if (cost.isEmpty()) 1 else cost.toInt())
            }
        }
    }

    constructor(representation: String) : this(representation.byteInputStream())

    /** Returns list of neighbors of vertex `v` in the graph */
    fun neighborsOf(v: Vertex): List<Vertex> = this@Graph[v]?.map { it.target } ?: emptyList()

}