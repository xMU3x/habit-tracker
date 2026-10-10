/* الصفحات 1: الرئيسية، الصلاة، القبلة، القرّاء، الراديو */
const HADITH = [
  ['إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', 'متفق عليه · البخاري ١ ومسلم ١٩٠٧'], ['مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ', 'الترمذي ٢٣١٧'],
  ['لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', 'متفق عليه · البخاري ١٣ ومسلم ٤٥'], ['مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ', 'متفق عليه'],
  ['الدِّينُ النَّصِيحَةُ', 'مسلم ٥٥'], ['أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', 'متفق عليه · البخاري ٦٤٦٤ ومسلم ٧٨٣'],
  ['كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', 'متفق عليه · البخاري ٦٤٠٦ ومسلم ٢٦٩٤'],
  ['تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ', 'الترمذي ١٩٥٦'], ['خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'البخاري ٥٠٢٧'], ['الطُّهُورُ شَطْرُ الْإِيمَانِ', 'مسلم ٢٢٣'],
  ['مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', 'مسلم ٢٦٩٩'], ['لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ', 'متفق عليه · البخاري ٦١١٤ ومسلم ٢٦٠٩']
];
const dayN = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
const fmtCD = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}` };
let cdT; const stopCD = () => clearInterval(cdT);
const accBtn = () => `<button class="ib p" data-go="account" aria-label="حسابي">${W.sync.user ? `<b>${esc((W.sync.user.user_metadata?.full_name || W.sync.user.email || 'M')[0].toUpperCase())}</b>` : ico('user')}</button>`;

/* ---------- الرئيسية ---------- */
W.pages.home = {
  live: true,
  async render(el) {
    const { next, list, diff } = D.next(), kh = W.khatma.get(), pg = D.pagesToday(), st = D.streak(), h = HADITH[dayN() % HADITH.length], q = await D.quran(), ai = (dayN() * 37) % q.ayahs.length, ay = q.ayahs[ai];
    const ch = await W.chal.today(), qa = [['book', 'المصحف', 'quran'], ['spark', 'التسبيح', 'tasbih'], ['hand', 'السبحة', 'sebha'], ['trophy', 'التحديات', 'challenges'], ['flag', 'خطة الختمة', 'khatma'], ['compass', 'القبلة', 'qibla'], ['water', 'الرقية', 'ruqya'], ['bell', 'الإشعارات', 'notif']];
    el.innerHTML = `<div class="top start"><div class="g" style="flex:1"><div class="sub">${esc(D.hijri())}</div><h1 style="font-size:24px">السلام عليكم 👋</h1></div><button class="ib" data-go="settings" aria-label="الإعدادات">${ico('tune')}</button>${accBtn()}</div>
    <button class="hero" data-go="prayer" style="margin-top:6px"><div class="row"><div class="g"><div class="row" style="gap:8px;font-weight:700">${ico('clock')}مواقيت الصلاة</div><div class="sub" style="margin-top:4px">${ico('pin')} ${esc(D.loc().name)}</div></div></div>
      <div class="row" style="margin:18px 0 14px"><div class="big" id="hcd">${fmtCD(diff)}</div><div class="g" style="text-align:end"><div class="sub">الصلاة القادمة</div><div style="font-size:32px;font-weight:700">${next.n}</div></div></div>
      <div class="row" style="gap:5px">${list.map(x => `<div class="pill" style="flex:1;min-width:0;flex-direction:column;gap:2px;padding:8px 2px;border-radius:14px;font-size:11px;${x.k === next.k ? 'background:rgba(255,255,255,.25)' : ''}"><small class="sub">${x.n}</small><b style="font-size:11px;white-space:nowrap">${D.fmt(x.t, W.cfg.get('arDigits'))}</b></div>`).join('')}</div></button>
    <button class="card" data-go="khatma" style="margin-top:14px"><div class="row"><div class="ring">${W.ring(kh.read / 604, 72, 8, 'var(--pri)')}<div class="t">${Math.round(kh.read / 604 * 100)}%</div></div><div class="g"><div class="sub">ختمتي الحالية</div><div style="font-size:20px;font-weight:700">${kh.read} من 604 صفحة</div><div class="sub">ورد اليوم: ${pg}/${kh.goal} صفحة</div><div class="bar"><i style="width:${Math.min(100, pg / kh.goal * 100)}%"></i></div></div>${ico('chev', 'chev')}</div></button>
    <button class="card" data-go="challenges" style="margin-top:14px"><div class="row"><div class="ic">${ico('trophy')}</div><div class="g"><b>تحديات اليوم</b><div class="sub">${ch.done} من ${ch.total} · ${ico('fire')} ${num(st.cur)} يوم متواصل</div></div>${ico('chev', 'chev')}</div></button>
    <div class="hero" style="margin-top:14px"><div class="row" style="font-weight:700;margin-bottom:10px">${ico('spark')} حديث اليوم</div><p style="font-family:var(--a);font-size:22px;line-height:2">${esc(h[0])}</p><div class="sub" style="margin-top:8px">${esc(h[1])}</div></div>
    <div class="card" style="margin-top:14px"><div class="row" style="margin-bottom:8px"><b class="g">آية اليوم</b><button class="ib" id="hshare" style="width:40px;height:40px">${ico('share')}</button></div><p class="mushaf" style="font-size:24px;text-align:center">${esc(ay[2])} <span class="an">﴿${num(ay[1])}﴾</span></p><div class="sub" style="text-align:center">${esc(D.sName(q, ay[0]))} · الآية ${num(ay[1])}</div></div>
    <h2>الوصول السريع</h2><div class="grid3" style="grid-template-columns:repeat(4,1fr)">${qa.map(x => `<button class="card qa" data-go="${x[2]}" style="padding:14px 4px"><span class="ic">${ico(x[0])}</span>${x[1]}</button>`).join('')}</div>`;
    $('#hshare').onclick = e => { e.stopPropagation(); W.share(`﴿${ay[2]}﴾\n— ${D.sName(q, ay[0])}: ${ay[1]}`) };
    stopCD(); cdT = setInterval(() => { const n = D.next(); const e = $('#hcd'); if (!e) return stopCD(); e.textContent = fmtCD(n.diff); if (n.diff < 1500) W.refresh() }, 1000);
  }
};

/* ---------- مواقيت الصلاة ---------- */
W.pages.prayer = {
  live: true,
  async render(el) {
    const { next, list, diff } = D.next(), n = W.notify.get(), t = D.today();
    el.innerHTML = `<div class="top"><button class="ib p" id="loc" aria-label="الموقع">${ico('pin')}</button><button class="ib p" data-go="qibla" aria-label="القبلة">${ico('compass')}</button><div style="flex:1;text-align:center"><h1 style="font-size:24px">مواقيت الصلاة</h1><div class="sub">صلّ في وقتها واطمئن</div></div><span class="sp"></span></div>
    <div class="hero" style="background:var(--hero);color:#fff;${W.cfg.get('pal') === 'green' ? 'background:linear-gradient(135deg,#2B4D2D,#3C6A3E)' : ''}"><div class="row"><span style="opacity:.8">${ico('pin')}</span><div class="sub g">${esc(D.loc().auto ? 'موقعك الحالي' : D.loc().name)}</div></div>
      <div class="sub" style="margin-top:22px;text-align:end">الصلاة القادمة</div><div class="row"><div class="big" style="font-size:30px;opacity:.9">${D.fmt(next.t, W.cfg.get('arDigits'))}</div><div class="g" style="text-align:end;font-size:44px;font-weight:700">${next.n}</div></div>
      <div class="pill" style="margin-top:16px"><span class="big" style="font-size:30px" id="pcd">${fmtCD(diff)}</span><span class="sub">متبقي على ${next.k === 'sunrise' ? 'الشروق' : 'الأذان'}</span></div></div>
    <h2>مواعيد اليوم <small>${num(6)} صلوات</small></h2>
    <div class="prc">${list.map(x => { const isn = x.k === next.k, on = x.k !== 'sunrise' && n.master && n.prayers[x.k] !== 'off'; return `<div class="pc ${isn ? 'nx' : ''}" data-k="${x.k}"><div class="row">${isn ? '<span class="tg">القادمة</span>' : ''}<span style="flex:1"></span>${x.k === 'sunrise' ? `<span class="bell">${ico('clock')}</span>` : `<button class="bell ${on ? 'on' : ''}" data-b="${x.k}" aria-label="تنبيه">${ico(on ? 'bell' : 'clock')}</button>`}</div><div class="tm"><b>${x.n}</b><span>${D.fmt(x.t, W.cfg.get('arDigits'))}</span></div></div>` }).join('')}</div>
    <div class="card" style="margin-top:16px"><div class="row"><div class="g"><b>طريقة الحساب</b><div class="sub">${D.METHODS[W.cfg.get('method')].n} · ${W.cfg.get('asr') === 'hanafi' ? 'العصر بالمذهب الحنفي' : 'العصر (الجمهور)'}</div></div><button class="ib p" id="meth">${ico('tune')}</button></div></div>`;
    $('#loc').onclick = openLoc; $('#meth').onclick = openMethod;
    $$('[data-b]', el).forEach(b => b.onclick = async () => { const k = b.dataset.b, cur = W.notify.get().prayers[k]; if (!(await W.notify.perm())) W.toast('اسمح بالإشعارات من إعدادات النظام أولًا.'); W.notify.set(x => { x.master = true; x.prayers[k] = cur === 'off' ? 'adhan' : 'off' }); W.toast(cur === 'off' ? `تم تفعيل الأذان لصلاة ${W.notify.NAMES[k]}` : 'تم إيقاف التنبيه'); W.refresh() });
    stopCD(); cdT = setInterval(() => { const x = D.next(), e = $('#pcd'); if (!e) return stopCD(); e.textContent = fmtCD(x.diff); if (x.diff < 1200) W.refresh() }, 1000);
  }
};
function openLoc() {
  const s = W.sheet(`<h3>مصدر الموقع</h3><div class="sub" style="margin:-8px 0 14px">اختر كيف نحدد موقعك لحساب أوقات الصلاة بدقة</div>
  <button class="item" id="lg" style="border:1.5px solid var(--pri);background:var(--pc)"><span class="g"><b style="color:var(--pri)">استخدام موقعي الحالي</b><span class="sub">تحديد الموقع تلقائيًا عبر GPS</span></span>${ico('pin')}</button>
  <div class="sub" style="margin:18px 4px 8px">أو أدخل اسم مدينتك يدويًا</div><div class="row"><input id="lq" placeholder="مثال: القاهرة، مصر" autocomplete="off"><button class="btn" id="ls" style="width:64px;min-height:54px;padding:0">${ico('search')}</button></div><div class="list" id="lr" style="margin-top:12px"></div>`);
  const show = arr => { $('#lr', s).innerHTML = arr.length ? arr.map((c, i) => `<button class="item" data-c="${i}"><span class="g"><b>${esc(c[0])}</b><span class="sub">${esc(c[1])}</span></span></button>`).join('') : '<p class="tip">لا توجد نتائج مطابقة</p>'; $$('[data-c]', s).forEach(b => b.onclick = () => { const c = arr[b.dataset.c]; W.cfg.set('loc', { name: `${c[0]}${c[1] ? '، ' + c[1] : ''}`, lat: c[2], lng: c[3], auto: false }); W.closeSheet(); W.notify.schedule(); W.refresh() }) };
  show(D.CITIES.slice(0, 8));
  $('#lg', s).onclick = async () => { try { W.toast('جارٍ التحديد…'); const p = await D.gps(); W.cfg.set('loc', { name: 'موقعك الحالي', lat: p.lat, lng: p.lng, auto: true }); W.closeSheet(); W.notify.schedule(); W.refresh() } catch (e) { W.toast(e === 'denied' ? 'إذن الموقع مرفوض. اختر مدينتك يدويًا.' : 'تعذّر تحديد موقعك. اختر مدينتك يدويًا.') } };
  const q = async () => { const v = $('#lq', s).value.trim(); if (!v) return show(D.CITIES.slice(0, 8)); const b = D.bare(v), loc = D.CITIES.filter(c => D.bare(c[0] + ' ' + c[1]).includes(b)); show(loc.length ? loc : await D.geocode(v)) };
  $('#ls', s).onclick = q; $('#lq', s).oninput = () => { const b = D.bare($('#lq', s).value); b && show(D.CITIES.filter(c => D.bare(c[0] + ' ' + c[1]).includes(b))) };
}
function openMethod() {
  const m = W.cfg.get('method'), a = W.cfg.get('asr');
  const s = W.sheet(`<h3>طريقة الحساب</h3><div class="list">${Object.entries(D.METHODS).map(([k, v]) => `<button class="item" data-m="${k}"><span class="g"><b>${v.n}</b></span>${k === m ? ico('check') : ''}</button>`).join('')}</div><h3 style="margin-top:18px">وقت العصر</h3><div class="chips"><button class="chip ${a === 'standard' ? 'on' : ''}" data-a="standard">ظل الشيء مثله (الجمهور)</button><button class="chip ${a === 'hanafi' ? 'on' : ''}" data-a="hanafi">ظل الشيء مثلاه (الحنفي)</button></div>`);
  $$('[data-m]', s).forEach(b => b.onclick = () => { W.cfg.set('method', b.dataset.m); W.closeSheet(); W.notify.schedule(); W.refresh() }); $$('[data-a]', s).forEach(b => b.onclick = () => { W.cfg.set('asr', b.dataset.a); W.closeSheet(); W.notify.schedule(); W.refresh() });
}

/* ---------- القبلة ---------- */
W.pages.qibla = {
  render(el) {
    const l = D.loc(), q = D.qibla(l.lat, l.lng), dist = Math.round(D.dist(l.lat, l.lng));
    el.innerHTML = `${W.top('اتجاه القبلة')}<div class="card" style="text-align:center"><div class="sub">زاوية القبلة من الشمال</div><div class="big" style="direction:ltr">${num(Math.round(q))}°</div></div>
    <div class="cmp"><div class="nd" id="nd"></div><div class="kb" id="kb" style="transform:rotate(${q}deg)"></div><b id="st" class="sub" style="position:absolute;bottom:60px">اضغط لتشغيل البوصلة</b></div>
    <div class="card"><div class="row"><div class="g"><b>المسافة إلى الكعبة</b><div class="sub">تقريبًا · نحو الكعبة المشرّفة</div></div><b>${num(dist.toLocaleString('en'))} كم</b></div></div>
    <button class="btn" id="cb" style="margin-top:16px">${ico('compass')} تشغيل البوصلة</button><p class="tip">لا تعمل البوصلة إلا على جهاز به مستشعر. استخدم زاوية القبلة أعلاه مع بوصلة أخرى.</p>`;
    const run = async () => { try { if (window.DeviceOrientationEvent?.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return W.toast('لم يُمنح الإذن') } } catch { }
      let got = false; const h = e => { const hd = e.webkitCompassHeading ?? (e.absolute || e.alpha != null ? 360 - e.alpha : null); if (hd == null || isNaN(hd)) return; got = true; $('#nd') && ($('#nd').style.transform = `rotate(${hd}deg)`); const kbH = $('#kb'); if (kbH) kbH.style.transform = `rotate(${q - hd}deg)`; const diff = Math.abs(((q - hd + 540) % 360) - 180); const st = $('#st'); if (st) { st.textContent = diff < 6 ? 'أنت باتجاه القبلة ✓' : ''; if (diff < 6) W.vib(30) } };
      window.addEventListener('deviceorientationabsolute', h, true); window.addEventListener('deviceorientation', h, true); W.pages.qibla._h = h; setTimeout(() => { if (!got) $('#st') && ($('#st').textContent = 'لا يتوفر مستشعر بوصلة على هذا الجهاز') }, 2500) };
    $('#cb').onclick = run;
  },
  after() { }
};

/* ---------- مشغّل الصوت (القرّاء + الراديو) ---------- */
const AP = W.player = { a: new Audio(), cur: null, queue: [], i: 0 };
AP.a.preload = 'none';
AP.play = (item, queue = [item]) => { AP.cur = item; AP.queue = queue; AP.i = Math.max(0, queue.indexOf(item)); AP.a.src = item.url; AP.a.play().catch(() => W.toast('تعذّر تشغيل هذا الملف. جرّب سورة أخرى.')); renderBar(); try { navigator.mediaSession.metadata = new MediaMetadata({ title: item.title, artist: item.sub || 'وِرد', artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] }); navigator.mediaSession.setActionHandler('nexttrack', AP.next); navigator.mediaSession.setActionHandler('previoustrack', AP.prev) } catch { } };
AP.toggle = () => AP.a.paused ? AP.a.play() : AP.a.pause(); AP.next = () => { if (AP.queue.length > 1 && AP.i < AP.queue.length - 1) AP.play(AP.queue[AP.i + 1], AP.queue) }; AP.prev = () => { if (AP.i > 0) AP.play(AP.queue[AP.i - 1], AP.queue) };
AP.a.onended = () => { AP.next(); renderBar() }; AP.a.onplay = AP.a.onpause = () => renderBar(); AP.a.onerror = () => W.toast('تعذّر تشغيل هذا الملف');
function renderBar() { const b = $('#pbar'); if (!AP.cur) { b.classList.remove('on'); return } b.classList.add('on'); b.innerHTML = `<div class="row" style="width:100%"><button class="ib p" id="pp" style="width:44px;height:44px">${ico(AP.a.paused ? 'play' : 'pause')}</button><div class="g" style="min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(AP.cur.title)}</b><span class="sub">${esc(AP.cur.sub || '')}</span></div>${AP.queue.length > 1 ? `<button class="ib" id="pn" style="width:40px;height:40px">${ico('prev')}</button><button class="ib" id="pv" style="width:40px;height:40px">${ico('next')}</button>` : ''}<button class="ib" id="px" style="width:40px;height:40px">${ico('close')}</button></div>`; $('#pp').onclick = AP.toggle; $('#px').onclick = () => { AP.a.pause(); AP.cur = null; renderBar() }; $('#pn') && ($('#pn').onclick = AP.next, $('#pv').onclick = AP.prev) }
const API = 'https://www.mp3quran.net/api/v3/';
const cached = async (k, url, ttl = 6048e5) => { try { const c = JSON.parse(localStorage.getItem('werd2:c_' + k) || 'null'); if (c && Date.now() - c.t < ttl) return c.d } catch { } try { const d = await (await fetch(url)).json(); localStorage.setItem('werd2:c_' + k, JSON.stringify({ t: Date.now(), d })); return d } catch { try { return JSON.parse(localStorage.getItem('werd2:c_' + k)).d } catch { return null } } };

/* ---------- القرّاء ---------- */
let RC = null;
W.pages.reciters = {
  async render(el) {
    el.innerHTML = `${W.top('القرآن صوتيًا', { back: false })}<div class="row"><input id="rq" placeholder="ابحث عن قارئ" style="flex:1"></div><div class="list" id="rl" style="margin-top:12px"><p class="tip">جارٍ التحميل…</p></div>`;
    const j = RC || await cached('reciters', API + 'reciters?language=ar'); RC = j; const rl = $('#rl', el);
    if (!j) return rl.innerHTML = '<p class="tip">تعذّر الاتصال. تأكد من الإنترنت ثم أعد المحاولة.</p>';
    const draw = q => { const b = D.bare(q || ''), L = j.reciters.filter(r => !b || D.bare(r.name).includes(b)).slice(0, 120); rl.innerHTML = L.map(r => `<button class="item" data-r="${r.id}"><span class="ic">${ico('music')}</span><span class="g"><b>${esc(r.name)}</b><span class="sub">${esc(r.moshaf[0]?.name || '')}${r.moshaf.length > 1 ? ' · +' + (r.moshaf.length - 1) : ''}</span></span>${ico('chev', 'chev')}</button>`).join('') || '<p class="tip">لا توجد نتائج</p>'; $$('[data-r]', rl).forEach(b => b.onclick = () => W.go('reciter/' + b.dataset.r)) };
    draw(); $('#rq', el).oninput = e => draw(e.target.value);
  }
};
W.pages.reciter = {
  async render(el, [id, mi]) {
    const j = RC || await cached('reciters', API + 'reciters?language=ar'), r = j?.reciters.find(x => x.id == id); if (!r) { el.innerHTML = W.top('القارئ') + '<p class="tip">تعذّر التحميل</p>'; return }
    const m = r.moshaf[+mi || 0], q = await D.quran(), list = m.surah_list.split(',').map(Number);
    const items = list.map(n => ({ n, title: D.sName(q, n), sub: r.name, url: m.server + pad(n).padStart(3, '0') + '.mp3' }));
    el.innerHTML = `${W.top(esc(r.name))}${r.moshaf.length > 1 ? `<div class="chips">${r.moshaf.map((x, i) => `<button class="chip ${i === (+mi || 0) ? 'on' : ''}" data-mi="${i}">${esc(x.name)}</button>`).join('')}</div>` : `<div class="sub" style="margin:0 4px 10px">${esc(m.name)}</div>`}<div class="list">${items.map(x => `<button class="item" data-n="${x.n}"><span class="ic" style="font-weight:700">${num(x.n)}</span><span class="g"><b>${esc(x.title)}</b></span>${ico('play', 'chev')}</button>`).join('')}</div><div style="height:70px"></div>`;
    $$('[data-n]', el).forEach(b => b.onclick = () => { const it = items.find(x => x.n == b.dataset.n); AP.play(it, items); D.touch() }); $$('[data-mi]', el).forEach(b => b.onclick = () => W.go(`reciter/${id}/${b.dataset.mi}`));
  }
};

/* ---------- الراديو ---------- */
W.pages.radio = {
  async render(el) {
    el.innerHTML = `${W.top('الراديو', { back: false })}<div class="row"><input id="rq" placeholder="ابحث عن إذاعة"></div><div class="list" id="rl" style="margin-top:12px"><p class="tip">جارٍ التحميل…</p></div>`;
    const j = await cached('radios', API + 'radios?language=ar', 864e5), rl = $('#rl', el); if (!j) return rl.innerHTML = '<p class="tip">تعذّر الاتصال. تأكد من الإنترنت ثم أعد المحاولة.</p>';
    const all = j.radios.map(r => ({ title: r.name, sub: 'بث مباشر', url: r.url })), draw = q => { const b = D.bare(q || ''), L = all.filter(x => !b || D.bare(x.title).includes(b)); rl.innerHTML = L.map((x, i) => `<button class="item" data-i="${i}"><span class="ic">${ico('radio')}</span><span class="g"><b>${esc(x.title)}</b><span class="sub">بث مباشر</span></span>${ico('play', 'chev')}</button>`).join('') || '<p class="tip">لا توجد نتائج</p>'; $$('[data-i]', rl).forEach(b => b.onclick = () => AP.play(L[b.dataset.i], [L[b.dataset.i]])) };
    draw(); $('#rq', el).oninput = e => draw(e.target.value);
  }
};
