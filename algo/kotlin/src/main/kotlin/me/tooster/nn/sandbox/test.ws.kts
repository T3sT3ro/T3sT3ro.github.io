package me.tooster.nn.sandbox

import org.apache.commons.text.similarity.JaroWinklerDistance
import org.apache.commons.text.similarity.LevenshteinDistance

val a = "testing kabana"
val b = "testing banana"


LevenshteinDistance().apply(a, b)

JaroWinklerDistance().apply(a,b)

