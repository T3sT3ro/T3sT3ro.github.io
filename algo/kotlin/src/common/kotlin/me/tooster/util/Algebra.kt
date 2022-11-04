package me.tooster.util

abstract class Group<T> /*(
    val neutral: T,
    val add: (T, T) -> T,
    val inverse: (T) -> T
)*/ {
    abstract val zero: T
    abstract infix fun T.ADD(other: T): T
    abstract fun INV(a: T): T
}

object AdditiveIntGroup : Group<Int>() {
    override val zero = 0
    override infix fun Int.ADD(other: Int): Int = this + other
    override fun INV(a: Int) = -a
}