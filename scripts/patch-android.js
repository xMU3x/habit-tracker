// يضيف Deep Link لعودة تسجيل الدخول بجوجل (com.werd.habittracker://auth) إلى AndroidManifest بعد cap add
const fs = require('fs'), p = 'android/app/src/main/AndroidManifest.xml';
if (!fs.existsSync(p)) { console.log('لا يوجد android/ بعد'); process.exit(0) }
let x = fs.readFileSync(p, 'utf8');
if (!x.includes('android:scheme="com.werd.habittracker"')) {
  x = x.replace(/(<activity[\s\S]*?<\/intent-filter>)/, `$1
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="com.werd.habittracker" android:host="auth" />
            </intent-filter>`);
}
for (const perm of ['POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM', 'RECEIVE_BOOT_COMPLETED', 'VIBRATE', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'])
  if (!x.includes(`android.permission.${perm}`)) x = x.replace('</manifest>', `    <uses-permission android:name="android.permission.${perm}" />\n</manifest>`);
fs.writeFileSync(p, x); console.log('AndroidManifest محدَّث ✔');
