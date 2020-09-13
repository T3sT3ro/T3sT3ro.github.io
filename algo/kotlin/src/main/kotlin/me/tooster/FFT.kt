package main.me.tooster.kotlin

import kotlin.math.roundToInt
import me.tooster.util.bitReversalPermutation
import me.tooster.util.kotlinmath.Complex
import me.tooster.util.kotlinmath.I
import me.tooster.util.kotlinmath.R
import me.tooster.util.kotlinmath.exp

// finds smallest power of 2 greater or equal to n
fun logcap(n: Int) = Integer.highestOneBit(n + Integer.highestOneBit(n) - 1)

/**
 * @param input coefficients for FFT/IFFT. Must be a power of two
 * @param inverse if ftrue, calculates the inverse of FFT
 */
//
fun fft(input: List<Complex>, inverse: Boolean = false): List<Complex> {
    assert(Integer.bitCount(input.size) == 1)
    // in-place bit-reversal permutation
    val permutation = bitReversalPermutation(Integer.numberOfTrailingZeros(input.size))

    val n = permutation.size
    var output = MutableList(n) { input[permutation[it]] }

    var len = 2
    while (len <= output.size) {
        val stride = len / 2
        for (block in output.indices step len) {
            val w = exp(2.I * kotlin.math.PI / len * if (inverse) -1 else 1)
            var wn = 1.R
            (block until block+stride).forEach {
                val a = output[it]
                val b = output[it + stride] * wn
                wn *= w
                output[it] = a + b
                output[it + stride] = a - b
            }
        }
        len *= 2
    }

    return if (inverse) output.map { it / n } else output
}


// a and b are polynomials of
fun polynomialMultiplication(a: IntArray, b: IntArray): List<Complex> {

    val size = logcap(a.size + b.size)
    val afft = fft((a + IntArray(size - a.size)).map { it.R })
    val bfft = fft((b + IntArray(size - b.size)).map { it.R })
    val cfft = afft.zip(bfft) { ai, bi -> ai*bi}
    return fft(cfft, inverse = true)
}

fun main() {
    println(polynomialMultiplication(intArrayOf(3,1,5), intArrayOf(2,1)).map {it.re.roundToInt()})
}