import org.apache.commons.text.similarity.JaroWinklerDistance
import org.apache.commons.text.similarity.LevenshteinDistance
import kotlin.math.sign

val a = "testing kabana"
val b = "testing banana"


LevenshteinDistance().apply(a, b)

JaroWinklerDistance().apply(a, b)

fun plusMinus(arr: Array<Int>): Unit {
    val groups = arr.groupBy { it.sign }
    val n = arr.size.toFloat();
    listOf(groups[-1], groups[1], groups[0])
        .map { (it?.size ?: 0).toFloat() / n }
        .forEach { println("%.6f".format(it)) }
}

plusMinus(arrayOf(1, 2, 3, 4));