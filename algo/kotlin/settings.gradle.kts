// version catalog for bundling deps docs: https://docs.gradle.org/current/userguide/platforms.html
dependencyResolutionManagement {
    versionCatalogs {
        create("libs") {
            library("lang", "org.apache.commons:commons-lang3:3.11")
            library("collections", "org.apache.commons:commons-collections4:4.4")
            library("text", "org.apache.commons:commons-text:1.9")

            bundle("apache", listOf("lang", "collections", "text"))
            version("junit", "5.7.2")
            library("junit.implementation", "org.junit.jupiter", "junit-jupiter-api").versionRef("junit")
            library("junit.runtime", "org.junit.jupiter", "junit-jupiter-engine").versionRef("junit")

        }
    }
}