// KMP string pattern searching

fun testcase() {
    readLine() // trunc
    val pattern = readLine()!!
    val text = readLine()!!
    KMP(text, pattern)
}

fun PI(pat: String): IntArray { // longest prefix-suffix
    val pi = IntArray(pat.length)
    for (i in 1 until pat.length) {
        var j = pi[i-1] // length of best suffix
        while(j > 0 && pat[i] != pat[j])
            j = pi[j-1]
        if(pat[i] == pat[j])
            j++
        pi[i] = j
    }
    return pi
}


fun KMP(text: String, pattern: String) {
    val pi = PI(pattern) // pattern#text version ain't online
    var i = 0
    var j = 0
    while(i < text.length){
        while(i < text.length && j < pattern.length && text[i] == pattern[j]) {
            i++
            j++
        }
        if(j == pattern.length)
            println("${i-j}")
        if(j > 0)
            j = pi[j-1]
        else
            i++
    }

//    println(pattern.chunked(1).joinToString("|"))
//    println(pi.joinToString("|"))
}

fun main(){
    val tests = readLine()!!.toInt()
    (1..tests).forEach{_ -> testcase()}
}