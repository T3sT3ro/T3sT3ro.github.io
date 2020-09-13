package main.me.tooster.kotlin

import java.lang.Integer.min

fun getArticulationPoints(V: Array<MutableList<Int>>): Int {
    val n = V.size
    val discoveryTime = IntArray(n + 1)
    val low = IntArray(n + 1)
    val artPoints = mutableSetOf<Int>()

    discoveryTime[0] = 0 // indices begin at 1 and root has dt=1

    fun DFS(p: Int, v: Int) {
        discoveryTime[v] = discoveryTime[p] + 1
        low[v] = discoveryTime[v]
        var children = 0;
        V[v]
                .filter { it != p }
                .forEach { w ->
                    if (p == w)
                        return
                    when {
                        discoveryTime[w] > 0 -> low[v] = min(low[v], discoveryTime[w])
                        else -> {
                            DFS(v, w)
                            low[v] = min(low[v], low[w])
                            if (low[w] >= discoveryTime[v] && p != 0)
                                artPoints.add(v) // non-root w is articulation point
                            children++
                        }
                    }
                }
//        println("${v}: in:${discoveryTime[v]} low:${low[v]}")
        if (p == 0 && children > 1) artPoints.add(1) // root case
    }

    DFS(0, 1)
    return artPoints.size
}

fun parseGraph(): Array<MutableList<Int>>? {
    val (n, m) = readLine()!!.split(" ").map { it.toInt() }
    if (n == 0) return null

    val V = Array(n + 1) { mutableListOf<Int>(it) }

    (1..m).forEach {
        val (a, b) = readLine()!!.split(" ").map { it.toInt() }
        V[a].add(b)
        V[b].add(a)
    }
    return V
}

fun main() {
    while (true) {
        val V = parseGraph() ?: return
        println(getArticulationPoints(V))
    }
}