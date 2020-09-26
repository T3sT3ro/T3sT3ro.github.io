package me.tooster.algorithms// kotlin.KMP string pattern searching

fun testcase() {
    readLine() // trunc
    val pattern = readLine()!!
    val text = readLine()!!
    kmp(text, pattern)
}

fun pi(pat: String): IntArray { // longest prefix-suffix
    val pi = IntArray(pat.length)
    for (i in 1 until pat.length) {
        var j = pi[i - 1] // length of best suffix
        while (j > 0 && pat[i] != pat[j])
            j = pi[j - 1]
        if (pat[i] == pat[j])
            j++
        pi[i] = j
    }
    return pi
}


fun kmp(text: String, pattern: String): MutableList<Int> {
    val pi = pi(pattern) // pattern#text version ain't online
    var (i, j) = 0 to 0
    val positions = mutableListOf<Int>()
    while (i < text.length) {
        while (i < text.length && j < pattern.length && text[i] == pattern[j]) {
            i++
            j++
        }
        if (j == pattern.length)
            positions.add(i - j)
        if (j > 0)
            j = pi[j - 1]
        else
            i++
    }
    return positions
}