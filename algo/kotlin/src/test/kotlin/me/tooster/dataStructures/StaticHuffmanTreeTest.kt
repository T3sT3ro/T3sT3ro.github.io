package me.tooster.dataStructures

import me.tooster.TreePrinter
import org.junit.jupiter.api.Test
import java.io.File

internal class StaticHuffmanTreeTest {

    @Test
    fun nonemptyDictionary() {
        val f = File("src/test/resources/slaughterhouse_5_fragment.txt")
        val sigma = HashMap<Char, Int>()
        f.readText().toCharArray().forEach { sigma[it] = (sigma[it] ?: 0) + 1 }
        val huffman = huffmanTreeOf(sigma)
        val treePrinter = TreePrinter<HuffmanTree>(
                { node -> if (node is HuffmanLeafNode) printChar(node.character) else "|"},
                { node -> if (node is HuffmanInternalNode) node.left else null},
                { node -> if (node is HuffmanInternalNode) node.right else null}
        ).withSquareBranches()
        treePrinter.printTree(huffman)
        print(huffman.getDictionary().toList()
                .sortedBy { (_, v) -> codeLengthOf(v) }
                .joinToString("\n") { (k, v) ->
                    "${printChar(k)}(${codeLengthOf(v).toUInt()}): \t${
                        (codeValueOf(v) shr 32).toString(2).padStart(codeLengthOf(v).toInt(), '0')
                    }"
                })
    }

    private fun printChar(c: Char): String = when (c) {
        '\u0000' -> "\u001b[7m[0]\u001b[27m"
        '\n' -> "\u001b[7m[n]\u001b[27m"
        '\r' -> "\u001b[7[m]r\u001b[27m"
        '\t' -> "\u001b[7[m]t\u001b[27m"
        '\b' -> "\u001b[7[m]b\u001b[27m"
        else     -> "[$c]"
    }
}