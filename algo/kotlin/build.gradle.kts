import org.gradle.api.tasks.testing.logging.TestLogEvent
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "me.tooster"

repositories {
    mavenCentral()
    mavenLocal()
}

plugins {
    kotlin("jvm") version "1.7.20"
    idea
    id("org.sonarqube") version "3.0"
}


kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        freeCompilerArgs += "-Xcontext-receivers"
    }
}

val sandbox = sourceSets.create("sandbox")
val common = sourceSets.create("common")

sourceSets {
    main {
        compileClasspath += common.output
        runtimeClasspath += common.output
    }

    test {
        compileClasspath += common.output
        runtimeClasspath += common.output
    }
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation(kotlin("script-runtime"))

    testImplementation(libs.junit.implementation)
    testImplementation("hu.webarticum:tree-printer:3.0.0")
    testImplementation("tech.vanyo:tree_printer")
    testRuntimeOnly(libs.junit.runtime)

    // https://blog.jetbrains.com/kotlin/2021/02/multik-multidimensional-arrays-in-kotlin/
    implementation("org.jetbrains.kotlinx:multik-core:0.2.0")
    implementation("org.jetbrains.kotlinx:multik-default:0.2.0")

    val commonImplementation by configurations
    val sandboxImplementation by configurations

    commonImplementation("org.jgrapht:jgrapht-core:1.5.0")
    commonImplementation(kotlin("script-runtime"))


    sandboxImplementation(libs.bundles.apache)
    sandboxImplementation(kotlin("script-runtime"))
}


tasks.register<Test>("testLogging") {
    description = "Run test task with stdout/stderr logged"
    group = "verification"
    testLogging {
        outputs.upToDateWhen { false }
        events = setOf(TestLogEvent.PASSED, TestLogEvent.FAILED, TestLogEvent.STANDARD_OUT, TestLogEvent.STARTED)
    }
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}