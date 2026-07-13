plugins {
    kotlin("jvm") version "2.3.0"
}

group = "com.devdasx"
version = "0.2.1"

kotlin {
    jvmToolchain(17)
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
