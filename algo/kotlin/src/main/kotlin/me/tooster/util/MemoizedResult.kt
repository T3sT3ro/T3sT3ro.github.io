package me.tooster.util

/**
 * Stores intermediate results of expensive computations to later
 * NOT THREAD SAFE
 */
class MemoizedResult<DataT> {
    var memoized = false
    var data: DataT? = null
        set(value) {field = value; memoized = true}
}

