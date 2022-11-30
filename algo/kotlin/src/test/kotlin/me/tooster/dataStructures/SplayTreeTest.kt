package me.tooster.dataStructures

import me.tooster.TreePrinter
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Order
import org.junit.jupiter.api.Test
internal class SplayTreeTest {
    fun Node<Int>.isHeapOrder(): Boolean {
        val isNodeOrdered = (left == null || left!!.value <= value)
                && (right == null || right!!.value > value)
        return (isNodeOrdered && (left?.isHeapOrder() ?: true) && (right?.isHeapOrder() ?: true))
    }

    @Test
    @Order(1)
    fun min() {
        val tree = SplayTree<Int>()

        assertNull(tree.min())
        tree.insert(1); assertEquals(tree.min(), 1)
        tree.insert(10); assertEquals(tree.min(), 1)
        tree.insert(2); assertEquals(tree.min(), 1)
        tree.insert(5); tree.insert(6); tree.insert(7)
        assertEquals(tree.min(), 1)
        tree.delete(1); assertEquals(tree.min(), 2)

        tree.clear()
        listOf(17, 18, 12, 8, 2, 3, 14, 4, 7, 13, 10, 5, 6, 20, 1, 15, 11, 19, 9, 16).forEach { tree.insert(it) }
        (1..20).forEach {
            assertEquals(tree.min(), it)
            tree.delete(it)
        }
    }

    @Test
    @Order(1)
    fun max() {
        val tree = SplayTree<Int>()

        assertNull(tree.max())
        tree.insert(1); assertEquals(tree.max(), 1)
        tree.insert(10); assertEquals(tree.max(), 10)
        tree.insert(2); assertEquals(tree.max(), 10)
        tree.insert(5); tree.insert(6); tree.insert(7)
        assertEquals(tree.max(), 10)
        tree.delete(10); assertEquals(tree.max(), 7)

        tree.clear()
        listOf(17, 18, 12, 8, 2, 3, 14, 4, 7, 13, 10, 5, 6, 20, 1, 15, 11, 19, 9, 16).forEach { tree.insert(it) }
        (20 downTo 1).forEach {
            assertEquals(tree.max(), it)
            tree.delete(it)
        }
    }

    @Test
    @Order(2)
    fun split() {
        val tree = SplayTree<Int>()
        listOf(17, 18, 12, 8, 2, 3, 14, 4, 7, 13, 10, 5, 6, 20, 1, 15, 11, 19, 9, 16).forEach { tree.insert(it) }
        val greater = tree.split(10)
        assertTrue(tree.max()!! <= 10)
        assertTrue(greater.min()!! > 10)
        assertTrue(tree.root?.isHeapOrder() ?: true)
        assertTrue(greater.root?.isHeapOrder() ?: true)
    }

    @Test
    @Order(1)
    fun isHeapOrderPreserved() {
        val tree = SplayTree<Int>()
        listOf(17, 18, 12, 8, 2, 3, 14, 4, 7, 13, 10, 5, 6, 20, 1, 15, 11, 19, 9, 16).forEach {
            tree.insert(it)
            assertTrue(tree.root?.isHeapOrder() ?: true);
        }

    }

    @Test
    fun verbose() {
        val printer = TreePrinter<Node<Int>>({ it.value.toString() }, { it.left }, { it.right }).withSquareBranches()
        val tree = SplayTree<Int>()
        val seq = (1..20).shuffled()

        seq.also { println(it) }.forEach {
            println("\u001b[32m[$it]\u001b[0m")
            tree.insert(it)
            printer.printTree(tree.root)
        }

        seq.also { println(it) }.forEach {
            println("\u001b[31m[$it]\u001b[0m")
            tree.delete(it)
            assert(!tree.find(it))
            printer.printTree(tree.root)
        }
    }
}