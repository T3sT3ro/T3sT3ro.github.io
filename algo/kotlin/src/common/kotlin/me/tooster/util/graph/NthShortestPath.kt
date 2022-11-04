package me.tooster.util.graph

import me.tooster.util.MemoizedResult
import java.util.*
import kotlin.math.abs
import kotlin.math.sign

/* Idea in O(V+kE):
    Process vertices in topological order. Each vertex stores a list of top n paths (either shortest or longest).
    If processed vertex is the target -> return nth path or null if it doesn't exist (list to short for example)
    While processing a vertex (call it v), for all out edges to vertices (call them w):
        Merge the list of vertex _w_ with list of vertex _v_ (+cost of of e(v, w) taking only top _n_ paths;
        Decrease degrees of vertices _w_ and if their degree is 0, push them onto stack for topological order
*/

internal typealias TopPaths = Map<Vertex, List<Int>>

/** Finds nth shortest/longest path in a graph.
 * @receiver        DAG (directed acyclic graph) as a list of weighted edges for every vertex
 * @param source    source vertex
 * @param target    target vertex
 * @param n         nth shortest path (1 is shortest, -1 is longest, negative numbers invert the ordering)
 *                  it's better to choose n based on heuristic of how many paths there are ("closer")
 * @return          length of the path or null if path doesn't exist
 * @throws IllegalArgumentException when n is equal to 0
 * */
fun Graph.nthShortestPath(source: Vertex, target: Vertex, n: Int = 1, resultsCache: MemoizedResult<TopPaths>): Int? {

    if (n == 0) throw IllegalArgumentException("n cannot be 0")

    val graph = this
    val inDegree = HashMap<Vertex, Int>(graph.count())
    graph.forEach { (_, es) -> es.forEach { inDegree[it.target] = (inDegree[it.target] ?: 0) + 1 } }
    val topologicalOrder = LinkedList(listOf(source))

    // meld two sorted arrays into one sorted without duplicates of size at most n
    fun meldTopPaths(A: List<Int>, B: List<Int>): LinkedList<Int> {
        val result = LinkedList<Int>()
        var (a, b) = 0 to 0
        while (result.size < abs(n) && (a < A.size || b < B.size)) {
            val nextElement = when {
                a == A.size                    -> B[b++] // list A ended, append rest of list B
                b == B.size                    -> A[a++] // list B ended, append rest of list A
                n.sign == A[a].compareTo(B[b]) -> B[b++] // smallest(1) biggest(-1) == A<B(-1) A>B(1) A=B(0)
                else                           -> A[a++]
            }
            if (result.lastOrNull() != nextElement) result.add(nextElement)
        }
        return result
    }

    val topPaths = hashMapOf(source to listOf(0)) // source vertex is start of path of length 0

    while (topologicalOrder.isNotEmpty()) {
        val v = topologicalOrder.pop() // next vertex to process
        if (v == target) break

        graph[v]?.forEach { edge -> // fix the top lists of all neighbors and push on topological stack if needed
            topPaths[edge.target] = meldTopPaths(
                    topPaths[v]!!.map { x -> x + edge.cost }, // current node MUST have some paths already
                    topPaths.getOrDefault(edge.target, emptyList()))

            inDegree[edge.target] = inDegree[edge.target]!! - 1
            if (inDegree[edge.target] == 0)
                topologicalOrder.add(edge.target.also { inDegree.remove(it) })
        }
    }
    resultsCache.data = topPaths
    return topPaths[target]?.getOrNull(abs(n) - 1) // target reached - return nth path
}

fun main() {
    val diamond = Graph("""->
        1 2$1 3$7 4$20
        2     3$5 4$9
        3         4$10
    """.trimIndent())

    val results = MemoizedResult<TopPaths>()
    println(diamond.nthShortestPath(1, 4, n = 4, results))
    println(results.data)
}
