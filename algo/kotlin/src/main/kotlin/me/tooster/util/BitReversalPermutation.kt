package me.tooster.util

/**
 * Returns bit reversal permutation of given order.
 * @param order order of permutation, such that permutation length is 2^order
 */
fun bitReversalPermutation(order: Int): IntArray {
    var permutation = listOf(0)
    (0 until order).forEach {
        permutation = permutation.map {p -> p*2} + permutation.map{p -> p*2 + 1}
    }
    return permutation.toIntArray()
}