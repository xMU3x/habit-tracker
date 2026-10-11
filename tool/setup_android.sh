#!/usr/bin/env bash
# يولّد مجلد android بواسطة أداة Flutter الحالية (لتتوافق إعدادات Gradle/AGP/Kotlin مع إصدار Flutter المثبّت)
# ثم يطبّق إعدادات التطبيق: معرّف الحزمة com.werd.habittracker (نفس هوية تطبيق Capacitor السابق)،
# ومانيفست الأذونات ورابط تسجيل الدخول، وإعدادات desugaring.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d android ]; then
  flutter create --platforms=android --org com.werd --project-name habittracker --no-pub .
fi

# لا نكتب فوق lib/ أو test/ أو pubspec.yaml (flutter create لا يلمس الموجود منها لكن نتأكد)
cp android_overlay/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
python3 tool/patch_gradle.py

APPID=$(grep -R "applicationId" android/app/build.gradle* | head -1 || true)
echo "$APPID"
echo "$APPID" | grep -q "com.werd.habittracker" || { echo "معرّف الحزمة غير مطابق (المتوقع com.werd.habittracker)"; exit 1; }
