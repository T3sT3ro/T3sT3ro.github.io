package me.tooster

import java.util.*
import kotlin.collections.HashMap

internal class HuffmanNode<SigmaT> : Comparable<HuffmanNode<SigmaT>> {
    val character: SigmaT?
    val priority: Int
    val left: HuffmanNode<SigmaT>?
    val right: HuffmanNode<SigmaT>?

    constructor(character: SigmaT, priority: Int) {
        this.character = character
        this.priority = priority
        this.left = null
        this.right = null
    }

    constructor(left: HuffmanNode<SigmaT>, right: HuffmanNode<SigmaT>) {
        this.character = null
        this.priority = left.priority + right.priority
        this.left = left;
        this.right = right
    }

    override fun compareTo(other: HuffmanNode<SigmaT>): Int = this.priority - other.priority
    fun isLeaf() = left == null && right == null
}

interface HuffmanDictionary<SigmaT> {
    /// Returns code for character
    operator fun get(character: SigmaT): Int

    /// returns character for code
    operator fun get(code: Int): SigmaT

    fun encode(character: SigmaT): Int = this[character]
    fun decode(code: Int): SigmaT = this[code]
}

class StaticHuffmanDictionary<SigmaT>(alphabet: Map<SigmaT, Int>): HuffmanDictionary<SigmaT> {

    // TODO: replace with BIDI-map/dict, idk.
    private val encoder: MutableMap<SigmaT, Int> = HashMap()
    private val decoder: MutableMap<Int, SigmaT> = HashMap()

    private val root: HuffmanNode<SigmaT>

    init {
        val trees = PriorityQueue<HuffmanNode<SigmaT>>()
        alphabet.forEach { (k, v) -> trees.add(HuffmanNode(k, v)) }

        while (trees.size > 1)
            trees.add(HuffmanNode(trees.poll(), trees.poll()))

        root = trees.poll()
        fun buildCodes(current: HuffmanNode<SigmaT>, code: Int) {
            if (current.isLeaf()) {
                encoder[current.character!!] = code
                decoder[code] = current.character
            }
            else {
                buildCodes(current.left!!, (code shl 1) or 0)
                buildCodes(current.right!!, (code shl 1) or 1)
            }
        }
        buildCodes(root, 0)
    }

    override fun get(character: SigmaT): Int = encode(character)
    override fun get(code: Int): SigmaT = decode(code)

    override fun toString(): String = encoder.toString()
}

fun main(){
    val h = StaticHuffmanDictionary<Char>(mapOf('a' to 1, 'b' to 2, 'c' to 3))
}