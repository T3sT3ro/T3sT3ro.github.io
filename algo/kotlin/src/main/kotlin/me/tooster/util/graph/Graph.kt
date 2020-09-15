package me.tooster.util.graph

typealias Vertex = Int
typealias Graph = Map<Vertex, List<Edge>>

class Edge(val target: Vertex, val cost: Int = 1){
    override fun toString(): String = "━━$cost━━⯈ $target"
}