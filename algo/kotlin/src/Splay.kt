import utils.TreePrinter
import java.util.function.Function

class SplayTree {

    // TODO size of subtree
    internal class Node(var value: Int, var left: Node? = null, var right: Node? = null) {
        /** hoists the node up using left or right rotation in place, preserving proper reference in ancestor */
        internal fun hoist(parent: Node): Node {
            when { // swap as a = b.also{b = a} XD waitin' for destructuring assignment...
                this == parent.left  -> left = parent.right.also { parent.right = left }
                this == parent.right -> right = parent.left.also { parent.left = right }
                else                 -> throw AssertionError("invalid hoist parent")
            }
            left = right.also { right = left }
            parent.left = parent.right.also { parent.right = parent.left }
            return parent.also { it.value = value.also { value = parent.value } }
        }

        fun splay(x: Int, isRoot: Boolean = true): Pair<Node, Node?> {

            val (child, grandchild) = when {
                x < value -> left?.splay(x, false)  ?: return (this to null)
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

        override fun toString(): String = "[$value] (${left}, ${right})"
    }

    internal var root: Node? = null

    /** Preserves only elements <= than x in this tree and returns tree with elements only greater*/
    internal fun split(x: Int): SplayTree {
        if (root?.splay(x) == null) return SplayTree() // handle when tree is empty
        if (x < root!!.value) return SplayTree().also { it.root = root; root = root?.left; it.root?.left = null; }
        return SplayTree().also { it.root = root?.right; root?.right = null }
    }

    /** Joins greater tree to this tree, assuming all elementsin greater are greater than in this */
    internal fun join(greater: SplayTree): SplayTree {
        this.root?.splay(Int.MAX_VALUE)
        return this.apply { if (root != null) root!!.right = greater.root else root = greater.root }
    }

    /** BST node insertion (go low, insert, then splay) */
    fun insert(x: Int) {
        val greater = split(x)
        if (root?.value == x) root!!.right = greater.root // reassign if already exists in tree
        else root = Node(x, root, greater.root)
    }

    fun delete(x: Int) {
        val R = split(x)
        if (root?.value == x) this.also { it.root = root?.left }.join(R)
        else this.root?.right = R.root
    }

    fun find(x: Int) = root?.splay(x)?.first?.value == x
}

fun main() {
    val printer = TreePrinter<SplayTree.Node>({ it.value.toString() }, { it.left }, { it.right })
//    printer.setSquareBranches(true)
    val T = SplayTree()
    val seq = if (false)
        listOf(19, 5, 10, 4, 15, 1, 18, 14, 3, 20, 11, 8, 9, 2, 6, 7, 16, 17, 12, 13)
    else (1..20).shuffled()
    seq.also { println(it) }.forEach {
        println("\u001b[32m[$it]\u001b[0m")
        T.insert(it)
        printer.printTree(T.root)
    }

    seq.also { println(it) }.forEach {
        println("\u001b[31m[$it]\u001b[0m")
        T.delete(it)
        assert(!T.find(it))
        printer.printTree(T.root);
    }

}