import utils.kotlinmath.INF


class SplayTree {

    class Node(var value: Int, var left: Node? = null, var right: Node? = null) {
        // hoists the node up using left or right rotation in place, preserving proper reference in ancestor
        fun hoist(parent: Node): Node {
            // swap as a = b.also{b = a} XD waitin' for destructuring assignment...
            when {
                this == parent.left -> this.left = parent.right.also { parent.right = this.left }
                this == parent.right -> this.right = parent.left.also { parent.left = this.right }
                else -> throw AssertionError("invalid hoist parent")
            }
            this.left = this.right.also { this.right = this.left }
            parent.left = parent.right.also { parent.right = parent.left }
            return parent.also { it.value = this.value.also { this.value = parent.value } }
        }

        override fun toString(): String = "[$value] (${left}, ${right})"
    }

    private var root: Node? = null

    fun splay(x: Int) {

        fun doSplay(current: Node): Pair<Node, Node?> {
            val (child, grandchild) = when {
                x < current.value -> doSplay(current.left ?: return current to null)
                x > current.value -> doSplay(current.right ?: return current to null)
                else -> return current to null // handles missing and present nodes
            }

            return when {
                grandchild == null && current == root -> (current to null).also { child.hoist(root!!) }
                grandchild != null -> {
                    if (grandchild == current.left?.left || grandchild == current.right?.right) {
                        child.hoist(current)
                        grandchild.hoist(current)
                    } else {
                        grandchild.hoist(child)
                        child.hoist(current)
                    }
                    return current to null
                }
                else -> (current to child)
            }
        }

        root = doSplay(root!!).first
    }

    /** BST node insertion (go low, insert, then splay) */
    fun insert(x: Int) {
        fun doInsert(current: Node?): Node {
            return when {
                current == null -> Node(x)
                x < current.value -> current.also { it.left = doInsert(current.left) }
                x > current.value -> current.also { it.right = doInsert(current.right) }
                else -> current
            }
        }
        root = doInsert(root)
        splay(x)
    }

    fun split(x: Int): Pair<SplayTree, SplayTree> {
        splay(x)
        return this to SplayTree().also { it.root = root?.right; root?.right = null }
    }

    fun join(bigger: SplayTree, noAssert :Boolean = true): SplayTree {
        this.splay(Int.MAX_VALUE)
        if(!noAssert) {
            bigger.splay(Int.MIN_VALUE)
            assert(root == null || bigger.root == null || root!!.value < bigger.root!!.value)
        }
        return this
    }

    fun delete(x: Int) {
        val (L, R) = split(x)
        if(L.root?.value == x) L.also { it.root = root?.left }.join(R)
        else L.root?.right = R.root
    }

}

fun main() {
    val splay = SplayTree()
    (1..20).shuffled().forEach { splay.insert(it) }
    splay.splay(5)
    print(splay)
}