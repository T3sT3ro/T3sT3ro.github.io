package me.tooster

import me.tooster.algorithms.polynomialMultiplication
import org.junit.jupiter.api.Test
import kotlin.math.roundToInt
import kotlin.test.assertEquals

internal class FFTKtTest {

    @Test
    fun fft() {
    }

    @Test
    fun polynomialMultiplicationEvenLists() {
        assertEquals(
                polynomialMultiplication(
                        intArrayOf(3, 7),  // 3 + 7x
                        intArrayOf(9, 11)) // 9 + 11x
                        .map { it.re.roundToInt() }.also { print(it) },
                listOf(3 * 9, 3 * 11 + 9 * 7, 7 * 11, 0) // 27 + 96x + 77x^2
        )
    }

    @Test
    fun polynomialMultiplicationUnevenLists() {
        assertEquals(
                polynomialMultiplication(
                        intArrayOf(3, 1, 5), // A= 3 + x + 5x^2
                        intArrayOf(2, 1))    // B= 2 + x
                        .map { it.re.roundToInt() }.also { print(it) },
                listOf(6, 5, 11, 5, 0, 0, 0, 0) // C= 6 + 5x + 11x^2 + 5x^3
        )
    }
}