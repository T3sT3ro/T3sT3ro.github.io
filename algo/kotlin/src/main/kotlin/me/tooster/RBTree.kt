package main.me.tooster.kotlin

import main.me.tooster.kotlin.util.MutableBinaryTreeNode

class RBTree<T: Comparable<T>> {

    data class RBNodeData<T>(val red: Boolean = false, val value: T)
    var root: MutableBinaryTreeNode<RBNodeData<T>>? = null;


    fun insert(x: T) {
        if(root == null) root = MutableBinaryTreeNode(RBNodeData(true, x))
        else {

        }
    }
}