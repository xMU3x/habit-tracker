/* الإشعارات: جدولة محلية عبر Capacitor، وعلى الويب تعمل أثناء فتح التطبيق */
const N = W.notify = {};
const LN = () => window.Capacitor?.Plugins?.LocalNotifications;
N.DEF = { master: true, prayers: { fajr: 'adhan', dhuhr: 'adhan', asr: 'adhan', maghrib: 'adhan', isha: 'adhan' }, morning: true, evening: true, kahf: true, qiyam: false, hadith: true, hadithTime: '10:00', short: true, shortCount: 20, streak: true };
N.get = () => ({ ...N.DEF, ...store.get('notif', {}), prayers: { ...N.DEF.prayers, ...(store.get('notif', {}).prayers || {}) } });
N.set = fn => { const n = N.get(); fn(n); store.set('notif', n); N.schedule() };
N.NAMES = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
N.perm = async () => { const l = LN(); if (l) { const r = await l.requestPermissions(); return r.display === 'granted' } if ('Notification' in window) return (await Notification.requestPermission()) === 'granted'; return false };
let timers = [];
N.schedule = async () => {
  const n = N.get(), items = []; let id = 100; const now = new Date();
  if (n.master) for (let d = 0; d < 6; d++) {
    const day = new Date(now); day.setDate(day.getDate() + d); const t = D.today(day);
    Object.keys(N.NAMES).forEach(k => { const mode = n.prayers[k]; if (mode !== 'off' && t[k] > now) items.push({ id: id++, at: t[k], title: `حان وقت صلاة ${N.NAMES[k]}`, body: 'حيَّ على الصلاة، حيَّ على الفلاح.', adhan: mode === 'adhan' }) });
    const at = (h, m, title, body) => { const x = new Date(day); x.setHours(h, m, 0, 0); if (x > now) items.push({ id: id++, at: x, title, body }) };
    if (n.morning) { const f = t.sunrise; f && at(f.getHours(), f.getMinutes() + 20, 'حان وقت أذكار الصباح', 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ. ابدأ يومك بذكر الله') }
    if (n.evening) { const f = t.asr; f && at(f.getHours() + 1, f.getMinutes(), 'حان وقت أذكار المساء', 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ. اختم نهارك بالأذكار') }
    if (n.kahf && day.getDay() === 5) at(9, 0, 'سورة الكهف يوم الجمعة', 'يوم الجمعة · سورة الكهف وكثرة الصلاة على النبي')
    if (n.qiyam) at(3, 30, 'قيام الليل', 'الثلث الأخير من الليل · وقت الدعاء والاستغفار')
    if (n.hadith) { const [h, m] = n.hadithTime.split(':').map(Number); at(h, m, 'حديث اليوم', 'افتح التطبيق لقراءة حديث اليوم') }
    if (n.streak) at(21, 0, 'حافظ على سلسلتك', 'أنت على بُعد خطوة من إتمام يومك. تحدٍّ واحد يكفي لتبقى.')
    if (n.short && d < 2) { const c = Math.min(+n.shortCount || 20, 24); for (let i = 0; i < c; i++) { const mins = 5 * 60 + Math.round(i * (19 * 60) / c); at(Math.floor(mins / 60), mins % 60, 'ذِكر', ['سبحان الله وبحمده', 'أستغفر الله وأتوب إليه', 'لا حول ولا قوة إلا بالله', 'اللهم صل وسلم على نبينا محمد', 'سبحان الله العظيم'][i % 5]) } }
  }
  const l = LN();
  if (l) {
    try { const p = await l.getPending(); if (p.notifications?.length) await l.cancel({ notifications: p.notifications.map(x => ({ id: x.id })) });
      await l.schedule({ notifications: items.slice(0, 400).map(x => ({ id: x.id, title: x.title, body: x.body, schedule: { at: x.at, allowWhileIdle: true }, smallIcon: 'ic_stat_icon_config_sample' })) }) } catch (e) { console.warn('LN', e) }
  } else {
    timers.forEach(clearTimeout); timers = [];
    items.filter(x => x.at - now < 2147e5).forEach(x => timers.push(setTimeout(() => { if ('Notification' in window && Notification.permission === 'granted') new Notification(x.title, { body: x.body, icon: 'icons/icon-192.png' }); if (x.adhan && W.cfg.get('sound')) N.playAdhan() }, x.at - now)));
  }
};
let au; N.playAdhan = () => { N.stopAdhan(); au = new Audio('audio/adhan.mp3'); au.play().catch(() => { }); return au };
N.stopAdhan = () => { au?.pause(); au = null }; N.isPlaying = () => au && !au.paused;
W.on('change', k => { if (k === 'settings') { clearTimeout(N._t); N._t = setTimeout(N.schedule, 1500) } });
