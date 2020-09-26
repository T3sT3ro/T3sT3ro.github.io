import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "me.tooster"

repositories {
    mavenCentral()
}

plugins {
    kotlin("jvm") version "1.4.10"
    idea

}

val agent: Configuration by configurations.creating

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.6.2")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.6.2")
    implementation(kotlin("script-runtime"))
    implementation("org.jgrapht:jgrapht-core:1.5.0")
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

val test by tasks.getting(Test::class) {
    useJUnitPlatform()

    doFirst {
        jvmArgs("-javaagent:${agent.singleFile}")
    }
}