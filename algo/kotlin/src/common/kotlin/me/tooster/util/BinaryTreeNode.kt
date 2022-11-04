package me.tooster.util

interface BinaryTreeNode<TNode : BinaryTreeNode<TNode, TData>, TData> {
    var value: TData
    var left: TNode?
    var right: TNode?

    fun isLeaf() = left == null && right == null;
}

//typealias MTNode<T> = MutableBinaryTreeNode<T> // this produces compiler error
class MutableBinaryTreeNode<T>(override var value: T,
                               override var left: MutableBinaryTreeNode<T>? = null,
                               override var right: MutableBinaryTreeNode<T>? = null)
    : BinaryTreeNode<MutableBinaryTreeNode<T>, T> {
    /** hoists and returns node up using left or right rotation in place, preserving proper reference in ancestor */
    fun hoist(parent: MutableBinaryTreeNode<T>): MutableBinaryTreeNode<T> {
        when { // swap as a = b.also{b = a} XD waitin' for destructuring assignment...
            this == parent.left  -> left = parent.right.also { parent.right = left }    // swap L, P.R
            this == parent.right -> right = parent.left.also { parent.left = right }    // swap R, P.L
            else                 -> throw AssertionError("invalid ancestor: can't rotate")
        }
        left = right.also { right = left }                                              // swap L, R
        parent.left = parent.right.also { parent.right = parent.left }                  // swap P.L, P.R
        return parent.also { it.value = value.also { value = parent.value } }           // swap val, P.val
    }

    override fun toString(): String = "[$value] (${left}, ${right})"
}

// typealias MTPNode<T> = MutableBinaryTreeNodeWithParent<T> // this produces compiler error
class MutableBinaryTreeNodeWithParent<T>(override var value: T,
                                         override var left: MutableBinaryTreeNodeWithParent<T>?,
                                         override var right: MutableBinaryTreeNodeWithParent<T>?,
                                         var parent: MutableBinaryTreeNodeWithParent<T>?)
    : BinaryTreeNode<MutableBinaryTreeNodeWithParent<T>, T> {

    fun hoist(): MutableBinaryTreeNodeWithParent<T> {
        when {
            parent == null         -> return this
            this == parent!!.left  -> left = parent!!.right.also { parent!!.right = left }    // swap L, P.R
            this == parent!!.right -> right = parent!!.left.also { parent!!.left = right }    // swap R, P.L
        }
        left?.parent = this; right?.parent = this                     // reparent
        parent?.left?.parent = this; parent?.right?.parent = parent   // reparent

        left = right.also { right = left }                                                  // swap L, R
        parent!!.left = parent!!.right.also { parent!!.right = parent!!.left }              // swap P.L, P.R
        return parent!!.also { it.value = value.also { value = parent!!.value } }           // swap val, P.val
    }
}
