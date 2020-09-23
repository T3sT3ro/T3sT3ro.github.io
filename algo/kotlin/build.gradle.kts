apply plugin: 'idea'
apply plugin: 'java'

repositories {
    mavenCentral()
}

plugins {
    kotlin("jvm")
}

group = "me.tooster"

val agent: Configuration by configurations.creating

dependencies {
    agent("org.aspectj:aspectjweaver:1.9.6")
    compileOnly("org.aspectj:aspectjrt:1.9.6")
    implementation(kotlin("stdlib-jdk8"))
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.6.2")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.6.2")
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