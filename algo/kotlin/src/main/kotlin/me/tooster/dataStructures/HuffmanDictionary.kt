package me.tooster.dataStructures

import java.util.*

internal typealias HuffmanNode = HuffmanTree
internal sealed interface HuffmanTree : Comparable<HuffmanNode> {
    val priority: Int
    override fun compareTo(other: HuffmanNode) = this.priority - other.priority
}
internal class HuffmanLeafNode(val character: Char, override val priority: Int) : HuffmanNode
internal class HuffmanInternalNode(val left: HuffmanNode, val right: HuffmanNode) : HuffmanNode {
    override val priority: Int = left.priority + right.priority
}

private const val EOF = '\u0000'

internal fun huffmanTreeOf(vararg alphabet: Pair<Char, Int>): HuffmanTree = huffmanTreeOf(alphabet.toMap())

internal fun huffmanTreeOf(alphabet: Map<Char, Int>): HuffmanTree {
    val trees = PriorityQueue<HuffmanTree>()
    trees.add(HuffmanLeafNode(EOF, 0)) // fictional EOF character
    alphabet.forEach { (k, v) -> trees.add(HuffmanLeafNode(k, v)) }
    while (trees.size > 1)
        trees.add(HuffmanInternalNode(trees.poll(), trees.poll()))
    return trees.poll()
}

fun codeValueOf(code: ULong)  :ULong = code and 0xffffffff00000000UL // kotlin bug for hex decimals KT-4749
fun codeLengthOf(code: ULong) :ULong = code and 0x00000000ffffffffUL

// code is packed so that the highest 32 bits are the code itself and lowest 32 bits are the code length
private fun HuffmanTree.buildDict(code: ULong, dictionary: HashMap<Char, ULong> = hashMapOf()): Map<Char, ULong> {
    when (this) {
        is HuffmanLeafNode     ->
            dictionary[this.character] = code
        is HuffmanInternalNode -> {
            left.buildDict((codeValueOf(code) shl 1) or (0UL shl 32) or (codeLengthOf(code) + 1UL), dictionary)
            right.buildDict((codeValueOf(code) shl 1) or (1UL shl 32) or (codeLengthOf(code) + 1UL), dictionary)
        }
    }
    return dictionary
}

internal fun HuffmanTree.getDictionary() = this.buildDict(code = 0UL)