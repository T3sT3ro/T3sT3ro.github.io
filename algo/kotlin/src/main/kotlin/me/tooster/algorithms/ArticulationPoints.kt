package me.tooster.algorithms

import me.tooster.util.graph.Graph
import me.tooster.util.graph.Vertex
import java.lang.Integer.min

fun Graph.articulationPoints(): List<Int> {
    val n = size
    val discoveryTime = IntArray(n + 1)
    val low = IntArray(n + 1)
    val artPoints = mutableSetOf<Int>()

    discoveryTime[0] = 0 // indices begin at 1 and root has dt=1
    var time = 0
    fun DFS(parent: Vertex, v: Vertex) {
        discoveryTime[v] = ++time
        low[v] = discoveryTime[v]
        var children = 0
        neighborsOf(v)
                .filter { it != parent }
                .forEach { w ->
                    when {
                        discoveryTime[w] > 0 -> low[v] = min(low[v], discoveryTime[w])
                        else                 -> {
                            DFS(v, w)
                            low[v] = min(low[v], low[w])
                            if (low[w] >= discoveryTime[v] && parent != 0)
                                artPoints.add(v) // non-root w is articulation point
                            children++
                        }
                    }
                }
//        println("${v}: in:${discoveryTime[v]} low:${low[v]}")
        if (parent == 0 && children > 1) artPoints.add(1) // root case
    }

    DFS(0, 1)
    return artPoints.toList()
}


fun main() {
    val graph = Graph(System.`in`)
    println(graph.articulationPoints())
}