package me.tooster.algorithms

import me.tooster.util.bitReversalPermutation
import me.tooster.util.complex.Complex
import me.tooster.util.complex.I
import me.tooster.util.complex.R
import me.tooster.util.complex.exp

/** returns smallest power of 2 greater or equal than *n* (`k: n<=2^k`) AKA power of 2 "capping" *n* thus - logCap */
private fun logCap(n: Int) = Integer.highestOneBit(n + Integer.highestOneBit(n) - 1)

/**
 * @param input coefficients for FFT/IFFT. Must be a power of two
 * @param inverse if true, calculates the inverse of FFT
 */
//
fun fft(input: List<Complex>, inverse: Boolean = false): List<Complex> {
    assert(Integer.bitCount(input.size) == 1)
    // in-place bit-reversal permutation
    val permutation = bitReversalPermutation(Integer.numberOfTrailingZeros(input.size))

    val n = permutation.size
    val output = MutableList(n) { input[permutation[it]] }

    var len = 2
    while (len <= output.size) {
        val stride = len / 2
        for (block in output.indices step len) {
            val w = exp(2.I * kotlin.math.PI / len * if (inverse) -1 else 1)
            var wn = 1.R
            (block until block + stride).forEach {
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


/**
 * Performs polynomial multiplication in O(n log n)
 * @param a list `(a0, a1, ...)` of polynomial coefficients `A(x) = a0*x^0 + a1*x^1 + ...`
 * @param b list `(b0, b1, ...)` of polynomial coefficients `B(x) = b0*x^0 + b1*x^1 + ...`
 * @return list `(c0, c1, ...)` of coefficients of polynomial `C(x)=A(x)*B(x) = c0*x^0 + c1*x^1 + ...`
 *          the
 */
fun polynomialMultiplication(a: IntArray, b: IntArray): List<Complex> {

    val size = logCap(a.size + b.size)
    val afft = fft((a + IntArray(size - a.size)).map { it.R }) // to value at root representation
    val bfft = fft((b + IntArray(size - b.size)).map { it.R }) // to value at root representation
    val cfft = afft.zip(bfft) { ai, bi -> ai * bi } // point-by-point multiplication in O(n)
    return fft(cfft, inverse = true) // back to coefficients from point at root representation
}