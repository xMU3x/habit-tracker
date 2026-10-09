// يجهّز مجلد www من ملفات الويب الحالية ويضيف طبقة توصيل الـ API للتطبيق الأصلي
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = fs.existsSync(path.join(ROOT, 'habit-tracker-bilal', 'index.html'))
  ? path.join(ROOT, 'habit-tracker-bilal')
  : ROOT;
const OUT = path.join(ROOT, 'www');
const API_BASE = (process.env.API_BASE_URL || '').replace(/\/+$/, '');

if (!fs.existsSync(path.join(SRC, 'index.html'))) {
  console.error('index.html غير موجود في: ' + SRC);
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of ['index.html', 'offline.html', 'manifest.json', 'service-worker.js', 'favicon.ico']) {
  const p = path.join(SRC, f);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(OUT, f));
}
fs.cpSync(path.join(SRC, 'icons'), path.join(OUT, 'icons'), { recursive: true });

// الواجهة بتنادي مسارات نسبية مثل /api/data، وده مش هيشتغل داخل التطبيق الأصلي
const shim = `(function(){
  var BASE = ${JSON.stringify(API_BASE)};
  var native = location.protocol === 'https:' && location.hostname === 'localhost';
  if (!native || !BASE) return;
  var of = window.fetch.bind(window);
  window.fetch = function(input, init){
    if (typeof input === 'string' && input.indexOf('/api/') === 0) input = BASE + input;
    return of(input, init);
  };
})();`;
fs.writeFileSync(path.join(OUT, 'api-base.js'), shim);

let html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
html = html.replace('<head>', '<head>\n<script src="api-base.js"></script>');
// لا حاجة لـ Service Worker داخل التطبيق (الملفات محلية أصلاً)
html = html.replace("if('serviceWorker' in navigator)", "if('serviceWorker' in navigator&&!window.Capacitor)");
fs.writeFileSync(path.join(OUT, 'index.html'), html);

console.log('www جاهز من: ' + SRC + ' | API_BASE=' + (API_BASE || '(غير محدد — التطبيق يعمل محلياً فقط)'));
