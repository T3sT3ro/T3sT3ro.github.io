package me.tooster.util.algebra

interface Monoid<T> {
    val zero: T
    operator fun T.plus(other: T): T
}

interface Group<T> : Monoid<T> {
    operator fun T.unaryMinus(): T
}

context(Monoid<T>) fun <T> Iterable<T>.sum(): T = this.fold(zero) { acc, t -> acc + t }
