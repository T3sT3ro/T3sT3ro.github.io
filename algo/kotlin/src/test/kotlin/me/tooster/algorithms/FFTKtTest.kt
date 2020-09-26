package me.tooster.algorithms

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import kotlin.math.roundToInt

internal class FFTKtTest {

    fun multiplyAndPrint(A: IntArray, B: IntArray): List<Int> {
        val C = polynomialMultiplication(A, B).map { it.re.roundToInt() }
        println("${A.toList()} x ${B.toList()} = $C")
        return C
    }

    @Test
    fun polyMultiplyEvenLists() {

        assertEquals(
                multiplyAndPrint(
                        intArrayOf(3, 7),  // 3 + 7x
                        intArrayOf(9, 11)),// 9 + 11x
                listOf(3 * 9, 3 * 11 + 9 * 7, 7 * 11, 0) // 27 + 96x + 77x^2
        )
    }

    @Test
    fun polyMultiplyUnevenLists() {
        assertEquals(
                multiplyAndPrint(
                        intArrayOf(3, 1, 5), // A= 3 + x + 5x^2
                        intArrayOf(2, 1)),    // B= 2 + x
                listOf(6, 5, 11, 5, 0, 0, 0, 0) // C= 6 + 5x + 11x^2 + 5x^3
        )
    }

    @Test
    fun polyMultiplyByZero() {
        assertEquals(
                multiplyAndPrint(
                        intArrayOf(6, 12, 232, 31, 123, 1, 12, 6, 12),
                        intArrayOf(0)).distinct(),
                listOf(0)
        )
    }
}