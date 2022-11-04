import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "me.tooster"

repositories {
    mavenCentral()
}

plugins {
    kotlin("jvm") version "1.7.20"
    idea
    id("org.sonarqube") version "3.0"
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
    testRuntimeOnly(libs.junit.runtime)


    val commonImplementation by configurations
    val sandboxImplementation by configurations

    commonImplementation("org.jgrapht:jgrapht-core:1.5.0")
    commonImplementation(kotlin("script-runtime"))


    sandboxImplementation(libs.bundles.apache)
    sandboxImplementation(kotlin("script-runtime"))


}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

val test by tasks.getting(Test::class) {
    useJUnitPlatform()

//    doFirst {
//        jvmArgs("-javaagent:${agent.singleFile}")
//    }
}