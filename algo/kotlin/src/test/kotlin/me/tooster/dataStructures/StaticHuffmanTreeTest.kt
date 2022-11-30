package me.tooster.dataStructures

import hu.webarticum.treeprinter.TreeNode
import hu.webarticum.treeprinter.printer.traditional.TraditionalTreePrinter
import hu.webarticum.treeprinter.text.ConsoleText
import org.junit.jupiter.api.Test
import tech.vanyo.treePrinter.TreePrinter
import java.io.File

internal class StaticHuffmanTreeTest {

    @Test
    fun nonemptyDictionary() {
        val f = File("src/test/resources/slaughterhouse_5_fragment.txt")
        val sigma = f.readText().groupingBy { it }.eachCount()
        val huffman = huffmanTreeOf(sigma)

        class HuffmanTreeAdapter(val node: HuffmanTree) : TreeNode {
            override fun content(): ConsoleText =
                ConsoleText.ofAnsi(if (node is HuffmanLeafNode) printChar(node.character) else "\u2502")
            override fun children(): MutableList<TreeNode> = when (node) {
                is HuffmanLeafNode -> mutableListOf()
                is HuffmanInternalNode -> mutableListOf(HuffmanTreeAdapter(node.left), HuffmanTreeAdapter(node.right))
            }

            override fun toString() = if (node is HuffmanLeafNode) "<${node.character}>" else "(internal)"
        }


        val treePrinter = TraditionalTreePrinter(false).print(HuffmanTreeAdapter(huffman))

        val minifiedTreePrinter = TreePrinter<HuffmanTree>(
            { node -> if (node is HuffmanLeafNode) printChar(node.character) else "" },
            { node -> if (node is HuffmanInternalNode) node.left else null },
            { node -> if (node is HuffmanInternalNode) node.right else null }
        )

        println()

        minifiedTreePrinter.printTree(huffman)
        print(huffman.getDictionary().toList()
            .sortedBy { (_, v) -> codeLengthOf(v) }
            .joinToString("\n") { (k, v) ->
                "${printChar(k)}(${codeLengthOf(v).toUInt()}): \t${
                    (codeValueOf(v) shr 32).toString(2).padStart(codeLengthOf(v).toInt(), '0')
                }"
            })
    }

    private fun printChar(c: Char): String = when (c) {
        '\u0000' -> "\u001b[7m[0]\u001b[0m"
        '\n'     -> "\u001b[7m[n]\u001b[0m"
        '\r'     -> "\u001b[7m[]r\u001b[0m"
        '\t'     -> "\u001b[7m[]t\u001b[0m"
        '\b'     -> "\u001b[7m[]b\u001b[0m"
        else     -> "[$c]"
    }
}