#!/usr/bin/env python3
"""Patch generated Android Gradle files for desugaring and compatible JVM targets."""
import pathlib
import re
import sys

app = pathlib.Path("android/app")
kts, groovy = app / "build.gradle.kts", app / "build.gradle"
DESUGAR = "2.1.4"

if kts.exists():
    f = kts
    s = f.read_text(encoding="utf8")
    if "isCoreLibraryDesugaringEnabled" not in s:
        s, n = re.subn(r"(compileOptions\s*\{)", r"\1\n        isCoreLibraryDesugaringEnabled = true", s, count=1)
        if n != 1:
            sys.exit("patch_gradle: compileOptions غير موجود في build.gradle.kts")
    if "coreLibraryDesugaring(" not in s:
        s += f'\ndependencies {{\n    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:{DESUGAR}")\n}}\n'
elif groovy.exists():
    f = groovy
    s = f.read_text(encoding="utf8")
    if "coreLibraryDesugaringEnabled" not in s:
        s, n = re.subn(r"(compileOptions\s*\{)", r"\1\n        coreLibraryDesugaringEnabled true", s, count=1)
        if n != 1:
            sys.exit("patch_gradle: compileOptions غير موجود في build.gradle")
    if "coreLibraryDesugaring '" not in s:
        s += f"\ndependencies {{\n    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:{DESUGAR}'\n}}\n"
else:
    sys.exit("patch_gradle: لم يُعثر على android/app/build.gradle(.kts) — شغّل tool/setup_android.sh أولًا")

f.write_text(s, encoding="utf8")

# Align Kotlin compilation with Java 11. Use the modern compilerOptions DSL for
# Kotlin Gradle plugin versions where deprecated kotlinOptions is a build error.
root_kts = pathlib.Path("android/build.gradle.kts")
if root_kts.exists():
    root = root_kts.read_text(encoding="utf8")
    marker = "tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>()"
    if marker not in root:
        root += """
\n// Keep Kotlin bytecode compatible with Android Java compileOptions (Java 11).
subprojects {
    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
        }
    }
}
"""
        root_kts.write_text(root, encoding="utf8")
elif pathlib.Path("android/build.gradle").exists():
    root_groovy = pathlib.Path("android/build.gradle")
    root = root_groovy.read_text(encoding="utf8")
    marker = "tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile)"
    if marker not in root:
        root += """
\n// Keep Kotlin bytecode compatible with Android Java compileOptions (Java 11).
subprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions { jvmTarget = '11' }
    }
}
"""
        root_groovy.write_text(root, encoding="utf8")
print(f"patched {f} and Kotlin JVM target")
