#!/usr/bin/env python3
"""يعدّل مشروع android المُولَّد بواسطة `flutter create` ليناسب الاعتماديات:
- تفعيل core library desugaring (مطلوب لـ flutter_local_notifications).
يعمل مع Gradle بصيغة Kotlin (.kts) أو Groovy. يفشل بوضوح إن لم يجد الأنماط المتوقعة."""
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
print(f"patched {f}")
