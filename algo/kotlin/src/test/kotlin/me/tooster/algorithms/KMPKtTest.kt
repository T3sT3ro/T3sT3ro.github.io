package me.tooster.algorithms

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtensionContext
import org.junit.jupiter.api.extension.InvocationInterceptor
import org.junit.jupiter.api.extension.ReflectiveInvocationContext
import java.io.File
import java.lang.reflect.Method

internal class KMPKtTest : InvocationInterceptor{

    @Override
    override fun interceptTestMethod(
            invocation: InvocationInterceptor.Invocation<Void>?,
            invocationContext: ReflectiveInvocationContext<Method>?,
            extensionContext: ExtensionContext?) {

    }

    fun displayPi(pattern: String) {
        println(pattern.chunked(1).joinToString("|"))
        println(pi(pattern).joinToString("|"))
    }

    @Test
    fun piEmpty() {
        assertTrue(pi("").isEmpty())
    }

    @Test
    fun piUnique() {
        assertEquals(pi("abcdefABCDEF").toList(), listOf(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0))
    }

    @Test
    fun piFractal() {
        assertEquals(pi("aaaaaa").toList(), listOf(0, 1, 2, 3, 4, 5))
    }

    fun bruteFindPositions(text: String, pattern: String): MutableList<Int> {
        val positions = mutableListOf<Int>()
        var found = text.indexOf(pattern)
        while (found != -1) {
            positions.add(found)
            found = text.indexOf(pattern, found + 1)
        }
        return positions
    }

    @Test
    fun kmpTest() {
        val f = File("src/test/resources/slaughterhouse_5_fragment.txt")
        val text = f.readText()
        val PAT_THE = "the"
        assertEquals(kmp(text, PAT_THE), bruteFindPositions(text, PAT_THE))

    }
}