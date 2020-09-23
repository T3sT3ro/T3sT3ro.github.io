package me.tooster.dataStructures

import me.tooster.util.MutableBinaryTreeNodeWithParent

class AVLTree<T: Comparable<T>>{


    var root: MutableBinaryTreeNodeWithParent<T>? = null
    var <T: Comparable<T>>MutableBinaryTreeNodeWithParent<T>.balance: Int
        set(value) {balance = value}
        get() = balance

    fun insert(x: T){
        if(root == null) {
            root = MutableBinaryTreeNodeWithParent(x, null, null, null)
            return
        } else {
            
        }
    }
}