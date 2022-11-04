package me.tooster.util

infix fun <T> List<T>.cartesianProduct(other: List<T>) =
    this.flatMap { first -> other.map { second -> first to second } }

infix fun <K, T : Iterable<K>> T.cartesianProduct(other: T) = sequence {
    val b = other.toList()
    yieldAll(this@cartesianProduct.flatMap { a -> b.map { b -> a to b }})
}

fun Pair<Int, Int>.toVec2Int(): Vec2Int = Vec2Int(first, second)

infix fun IntRange.cross(other: IntRange): IntRange2D = IntRange2D(this, other)