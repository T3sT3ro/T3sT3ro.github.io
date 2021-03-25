package me.tooster.dataStructures

import me.tooster.util.AdditiveIntGroup
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import kotlin.random.Random

internal class FenwickTreeTest {

    @Test
    fun testQuerySingle() {
        val elements = listOf(1, 10, 100, 1000, 10000)
        val tree = FenwickTree(elements, AdditiveIntGroup)

        assertArrayEquals(elements.toIntArray(), elements.indices.map { tree.query(it) }.toIntArray())
    }

    @Test
    fun testQueryRange() {
        val elements = listOf(1, 10, 100, 1000, 10000)
        val tree = FenwickTree(elements, AdditiveIntGroup)
        tree.assertWithData(elements)
    }

    private fun <T> FenwickTree<T>.assertWithData(data: List<T>) {
        with(G) {
            for (d in 1..data.size) {
                for (i in 0..data.size - 1 - d) {
                    assertEquals(
                        data.subList(i, i + d).reduce { acc, t -> acc ADD t },
                        query(i until i + d)
                    )
                }
            }
        }
    }

    @Test
    fun update() {
        val elements = listOf(1, 10, 100, 1000, 10000)
        val tree = FenwickTree(elements, AdditiveIntGroup)

        elements.indices.forEach { tree.update(it, elements[it]) }
        tree.assertWithData(elements.map { 2 * it })
    }

    @Test
    fun randomRangeQueryTest() {
        val rng = Random(42)
        val elements = List(100) { rng.nextInt() }
        val tree = FenwickTree(elements, AdditiveIntGroup)

        tree.assertWithData(elements)
    }
}