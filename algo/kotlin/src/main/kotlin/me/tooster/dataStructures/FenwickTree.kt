package me.tooster.dataStructures

import me.tooster.util.Group


/**
 *
 * Fenwick tree is a range query + point update data structure of O(n) memory complexity.
 * Data must be an algebraic group with reversible and associative binary function and neutral element
 *
 * Supported operations:
 * - query(l, r) -- calculating some function f on array's range in O(log n)
 * - update(i)   -- update value at index i of function on O(log n)
 */
class FenwickTree<T>(data: List<T>, val G: Group<T>) {

    private val tree = MutableList(data.size) { G.zero }

    init {
        for (idx in data.indices) update(idx, data[idx])
    }

    private fun getSegmentStart(i: Int): Int = i and (i + 1)
    private fun getSegmentEnd(i: Int): Int = i or (i + 1)

    /**
     * Returns result of collecting all values in range with our defined operation
     *
     * Complexity: O(log n)
     */
    fun query(range: IntRange): T = with(G) { prefixQuery(range.last) ADD INV(prefixQuery(range.first - 1)) }

    /**
     * Returns value at index
     *
     * Complexity: O(log n)
     */
    fun query(idx: Int) = query(idx..idx)

    private fun prefixQuery(end: Int): T = with(G) {
        var i = end
        var ret = zero
        while (i in tree.indices) {
            ret = ret ADD tree[i]
            i = getSegmentStart(i) - 1
        }
        ret
    }

    /**
     * Performs on a cell operation cell := cell + delta, where + is our operation
     *
     * Complexity: O(log n)
     */
    fun update(idx: Int, delta: T) = with(G) {
        var i = idx
        while (i in tree.indices) {
            tree[i] = tree[i] ADD delta
            i = getSegmentEnd(i)
        }
    }
}