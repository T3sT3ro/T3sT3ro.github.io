package me.tooster.dataStructures

import me.tooster.util.algebra.Group
import me.tooster.util.algebra.sum
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import kotlin.random.Random

internal class FenwickTreeTest {

    val intGroup = object : Group<Int> {
        override val zero: Int = 0
        override fun Int.unaryMinus(): Int = -this
        override fun Int.plus(other: Int): Int = this + other
    }


    @Test
    fun testQuerySingle() = with (intGroup) {
        val elements = listOf(1, 10, 100, 1000, 10000)
        val tree = FenwickTree(elements)

        assertArrayEquals(elements.toIntArray(), elements.indices.map { tree.query(it) }.toIntArray())
    }

    @Test
    fun testQueryRange() = with (intGroup) {
        val elements = listOf(1, 10, 100, 1000, 10000)
        val tree = FenwickTree(elements)
        tree.assertWithData(elements)
    }

    context(Group<T>)
    private fun <T> FenwickTree<T>.assertWithData(data: List<T>) {
        for (d in 1..data.size) {
            data.windowed(d).withIndex().forEach { (i, list) ->
                assertEquals(list.sum(), query(i until i + d))
            }
        }
    }

    @Test
    fun update() = with (intGroup) {
        val elements = listOf(1, 10, 100, 1000, 10000)
        val tree = FenwickTree(elements)

        elements.indices.forEach { tree.update(it, elements[it]) }
        tree.assertWithData(elements.map { 2 * it })
    }

    @Test
    fun randomRangeQueryTest()  = with (intGroup) {
        val rng = Random(42)
        val elements = List(100) { rng.nextInt() }
        val tree = FenwickTree(elements)

        tree.assertWithData(elements)
    }
}