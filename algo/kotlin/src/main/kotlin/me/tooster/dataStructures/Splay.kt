package me.tooster.dataStructures

import me.tooster.util.MutableBinaryTreeNode

typealias Node<T> = MutableBinaryTreeNode<T>

class SplayTree<T: Comparable<T>> {

    /** extension function to splay on kotlin.Node */
    // faster splay would be a top-down that reorganizes tree during search into left, middle and right
    private fun Node<T>.splay(x: Comparable<T>, isRoot: Boolean = true): Pair<Node<T>, Node<T>?> {

        // bottom-up splay resolving. child and grandchild are used to recognize ZigZig ZigZag steps
        val (child, grandchild) = when {
            x < value -> left?.splay(x, false) ?: return (this to null)
            x > value -> right?.splay(x, false) ?: return (this to null)
            else -> return (this to null) // handles missing and present nodes (x == value)
        }

        return when {
            grandchild == null && isRoot -> (this to null).also { child.hoist(this) } // Zig
            grandchild != null           -> when (grandchild) {
                left?.left, right?.right -> (grandchild.hoist(child.hoist(this)) to null) // ZigZig
                else                     -> (grandchild.hoist(child).hoist(this) to null) // ZigZag
            }
            else                         -> (this to child) // postpone
        }
    }

    internal var root: Node<T>? = null

    fun clear() { root = null }

    // min and max functions try to splay an object that compares less/greater than all elements in the tree
    fun min() = root?.splay(object : Comparable<T> { override fun compareTo(other: T) = -1 })?.first?.value
    fun max() = root?.splay(object : Comparable<T> { override fun compareTo(other: T) = 1 })?.first?.value

    /** Preserves only elements <= than x in this tree and returns tree with elements only greater */
    fun split(x: T): SplayTree<T> {
        if (root?.splay(x) == null) return SplayTree() // handle when tree is empty
        if (x < root!!.value) return SplayTree<T>().also { it.root = root; root = root?.left; it.root?.left = null; }
        return SplayTree<T>().also { it.root = root?.right; root?.right = null }
    }

    /** Joins greater tree to this tree, assuming all elements in greater are in fact greater than in this */
    fun join(greater: SplayTree<T>): SplayTree<T> {
        this.max() // splay the maximum to make root's right son empty
        return this.apply { if (root != null) root!!.right = greater.root else root = greater.root }
    }

    /** BST node insertion (go low, insert, then splay) */
    // faster insert (constant constraints) would use BTS insert, than splay
    fun insert(x: T) {
        val greater = split(x)
        if (root?.value == x) root!!.right = greater.root // reassign if already exists in tree
        else root = Node(x, root, greater.root)
    }

    fun delete(x: T) {
        val greater = split(x)
        if (root?.value == x) this.also { it.root = root?.left }.join(greater)
        else this.root?.right = greater.root
    }

    fun find(x: Comparable<T>) = root?.splay(x)?.first?.value == x
}