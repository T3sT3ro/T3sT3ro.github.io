package me.tooster.util.graph

import java.util.*

typealias Vertex = Int

class Edge(val target: Vertex, val cost: Int = 1){
    override fun toString(): String = "━━$cost━━⯈ $target"
}

class Graph(vararg graph: Pair<Vertex, List<Edge>>) : HashMap<Vertex, List<Edge>>(mapOf(*graph))