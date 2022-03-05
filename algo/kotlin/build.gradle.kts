import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "me.tooster"

repositories {
    mavenCentral()
}

plugins {
    kotlin("jvm") version "1.6.10"
    idea
    id("org.sonarqube") version "3.0"
}

//val agent: Configuration by configurations.creating

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.7.2")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.7.2")
    implementation(kotlin("script-runtime"))
    implementation("org.jgrapht:jgrapht-core:1.5.0")
    implementation("org.apache.commons:commons-lang3:3.11")
    implementation("org.apache.commons:commons-collections4:4.4")
    implementation("org.apache.commons:commons-text:1.9")
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
