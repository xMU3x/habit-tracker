/* الإشعارات: جدولة محلية عبر Capacitor (قنوات + أذونات + تنبيه دقيق)، وعلى الويب أثناء فتح التطبيق */
const N = W.notify = {};
const LN = () => window.Capacitor?.Plugins?.LocalNotifications;
const isNative = () => !!window.Capacitor?.isNativePlatform?.() || !!LN();
N.DEF = { master: true, prayers: { fajr: 'adhan', dhuhr: 'adhan', asr: 'adhan', maghrib: 'adhan', isha: 'adhan' }, morning: true, evening: true, kahf: true, qiyam: false, hadith: true, hadithTime: '10:00', short: true, shortCount: 20, streak: true };
N.get = () => ({ ...N.DEF, ...store.get('notif', {}), prayers: { ...N.DEF.prayers, ...(store.get('notif', {}).prayers || {}) } });
N.set = fn => { const n = N.get(); fn(n); store.set('notif', n); N.schedule() };
N.NAMES = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };

/* قنوات الإشعارات (لا يمكن تعديل صوت القناة بعد إنشائها، لذلك المعرّفات بإصدار) */
const NCH = { adhan: 'werd_adhan_v2', pray: 'werd_prayer_v2', remind: 'werd_remind_v2' };
N.status = { perm: 'unknown', exact: 'unknown' };
N.channels = async () => {
  const l = LN(); if (!l?.createChannel) return;
  const mk = o => l.createChannel({ visibility: 1, lights: true, lightColor: '#2F6B52', vibration: true, ...o }).catch(e => console.warn('channel', e));
  await mk({ id: NCH.adhan, name: 'الأذان', description: 'تنبيه الصلاة بصوت الأذان', importance: 5, sound: 'adhan.mp3' });
  await mk({ id: NCH.pray, name: 'تنبيه الصلاة (صوت عادي)', description: 'تنبيه الصلاة بصوت الإشعار الافتراضي', importance: 5 });
  await mk({ id: NCH.remind, name: 'التذكيرات والأذكار', description: 'أذكار الصباح والمساء وحديث اليوم وغيرها', importance: 4 });
};
N.check = async () => {
  const l = LN(); if (!l) { N.status.perm = 'Notification' in window ? Notification.permission : 'denied'; return N.status }
  try { N.status.perm = (await l.checkPermissions()).display } catch { }
  try { if (l.checkExactNotificationSetting) N.status.exact = (await l.checkExactNotificationSetting()).exact_alarm } catch { N.status.exact = 'granted' }
  return N.status;
};
N.perm = async () => {
  const l = LN();
  if (l) { try { let r = await l.checkPermissions(); if (r.display !== 'granted') r = await l.requestPermissions(); N.status.perm = r.display; return r.display === 'granted' } catch (e) { console.warn(e); return false } }
  if ('Notification' in window) return (await Notification.requestPermission()) === 'granted';
  return false;
};
/* يطلب السماح بالتنبيه الدقيق (Android 12+ — يفتح صفحة الإعداد) */
N.exact = async (ask = true) => {
  const l = LN(); if (!l?.checkExactNotificationSetting) return true;
  try { let r = await l.checkExactNotificationSetting(); if (r.exact_alarm === 'granted') return true; if (!ask) return false;
    const ok = await W.dialog({ title: 'السماح بالتنبيه في الوقت الدقيق', body: '<p class="sub">لكي يصل الأذان والتذكيرات في موعدها بالضبط، فعّل «المنبهات والتذكيرات» لتطبيق وِرد في الصفحة التالية.</p>', ok: 'فتح الإعداد', cancel: 'لاحقًا' });
    if (ok) { await l.changeExactNotificationSetting(); r = await l.checkExactNotificationSetting() } return r.exact_alarm === 'granted' } catch { return true }
};
/* أول تشغيل: أنشئ القنوات واطلب الأذونات ثم جدول */
N.init = async () => {
  await N.channels(); await N.check();
  if (isNative() && N.get().master && N.status.perm !== 'granted' && !store.get('notif_asked', false)) { store.set('notif_asked', true, true); await N.perm() }
  await N.schedule();
  if (isNative() && N.status.perm === 'granted' && N.status.exact === 'denied' && !store.get('exact_asked', false)) { store.set('exact_asked', true, true); setTimeout(() => N.exact(true).then(() => N.schedule()), 1200) }
};

let timers = [];
const chunk = (a, n) => { const r = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r };
N.build = () => {
  const n = N.get(), items = []; let id = 100; const now = new Date();
  if (!n.master) return items;
  for (let d = 0; d < 6; d++) {
    const day = new Date(now); day.setDate(day.getDate() + d); const t = D.today(day);
    Object.keys(N.NAMES).forEach(k => { const mode = n.prayers[k]; if (mode !== 'off' && t[k] > now) items.push({ id: id++, at: t[k], ch: mode === 'adhan' ? NCH.adhan : NCH.pray, sound: mode === 'adhan' ? 'adhan.mp3' : undefined, title: `حان وقت صلاة ${N.NAMES[k]}`, body: 'حيَّ على الصلاة، حيَّ على الفلاح.', adhan: mode === 'adhan' }) });
    const at = (h, m, title, body) => { const x = new Date(day); x.setHours(h, m, 0, 0); if (x > now) items.push({ id: id++, at: x, ch: NCH.remind, title, body }) };
    if (n.morning) { const f = t.sunrise; f && at(f.getHours(), f.getMinutes() + 20, 'حان وقت أذكار الصباح', 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ. ابدأ يومك بذكر الله') }
    if (n.evening) { const f = t.asr; f && at(f.getHours() + 1, f.getMinutes(), 'حان وقت أذكار المساء', 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ. اختم نهارك بالأذكار') }
    if (n.kahf && day.getDay() === 5) at(9, 0, 'سورة الكهف يوم الجمعة', 'يوم الجمعة · سورة الكهف وكثرة الصلاة على النبي')
    if (n.qiyam) at(3, 30, 'قيام الليل', 'الثلث الأخير من الليل · وقت الدعاء والاستغفار')
    if (n.hadith) { const [h, m] = n.hadithTime.split(':').map(Number); at(h, m, 'حديث اليوم', 'افتح التطبيق لقراءة حديث اليوم') }
    if (n.streak) at(21, 0, 'حافظ على سلسلتك', 'أنت على بُعد خطوة من إتمام يومك. تحدٍّ واحد يكفي لتبقى.')
    if (n.short && d < 2) { const c = Math.min(+n.shortCount || 20, 24); for (let i = 0; i < c; i++) { const mins = 5 * 60 + Math.round(i * (19 * 60) / c); at(Math.floor(mins / 60), mins % 60, 'ذِكر', ['سبحان الله وبحمده', 'أستغفر الله وأتوب إليه', 'لا حول ولا قوة إلا بالله', 'اللهم صل وسلم على نبينا محمد', 'سبحان الله العظيم'][i % 5]) } }
  }
  /* الصلوات أولًا ثم الأقرب زمنيًا — حد أمان للأجهزة التي تحدّ المنبهات */
  return items.sort((a, b) => a.at - b.at).slice(0, 240);
};
let nBusy = false, nAgain = false;
N.schedule = async () => {
  if (nBusy) { nAgain = true; return } nBusy = true;
  try {
    const items = N.build(), l = LN(), now = new Date();
    if (l) {
      const st = await N.check(); if (st.perm !== 'granted') { try { const p = await l.getPending(); if (p.notifications?.length) await l.cancel({ notifications: p.notifications.map(x => ({ id: x.id })) }) } catch { } return }
      try { const p = await l.getPending(); if (p.notifications?.length) await l.cancel({ notifications: p.notifications.map(x => ({ id: x.id })) }) } catch (e) { console.warn('cancel', e) }
      let ok = 0;
      for (const part of chunk(items, 40)) {
        try { await l.schedule({ notifications: part.map(x => ({ id: x.id, title: x.title, body: x.body, channelId: x.ch, sound: x.sound, smallIcon: 'ic_stat_werd', iconColor: '#2F6B52', largeIcon: undefined, schedule: { at: x.at, allowWhileIdle: true } })) }); ok += part.length }
        catch (e) { console.warn('LN schedule', e); for (const one of part) { try { await l.schedule({ notifications: [{ id: one.id, title: one.title, body: one.body, channelId: one.ch, schedule: { at: one.at, allowWhileIdle: true } }] }); ok++ } catch { } } }
      }
      N.scheduled = ok;
    } else {
      timers.forEach(clearTimeout); timers = [];
      items.filter(x => x.at - now < 2147e5).forEach(x => timers.push(setTimeout(() => { if ('Notification' in window && Notification.permission === 'granted') new Notification(x.title, { body: x.body, icon: 'icons/icon-192.png' }); if (x.adhan && W.cfg.get('sound')) N.playAdhan() }, x.at - now)));
      N.scheduled = timers.length;
    }
  } finally { nBusy = false; if (nAgain) { nAgain = false; N.schedule() } }
};
/* إشعار تجريبي فوري عبر قناة الأذان أو التذكيرات */
N.test = async (adhan = false) => {
  if (!(await N.perm())) { W.toast('الإشعارات غير مسموحة. فعّلها من إعدادات النظام.'); return false }
  const l = LN();
  if (l) { await N.channels(); try { await l.schedule({ notifications: [{ id: 1, title: adhan ? 'حان وقت صلاة (تجربة)' : 'وِرد', body: adhan ? 'هكذا يصلك الأذان' : 'التذكيرات تعمل بنجاح ✓', channelId: adhan ? NCH.adhan : NCH.remind, sound: adhan ? 'adhan.mp3' : undefined, smallIcon: 'ic_stat_werd', schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true } }] }); return true } catch (e) { W.toast('تعذّر إرسال الإشعار: ' + (e?.message || e)); return false } }
  new Notification('وِرد', { body: 'التذكيرات تعمل بنجاح', icon: 'icons/icon-192.png' }); return true;
};
let au; N.playAdhan = () => { N.stopAdhan(); au = new Audio('audio/adhan.mp3'); au.play().catch(() => { }); return au };
N.stopAdhan = () => { au?.pause(); au = null }; N.isPlaying = () => au && !au.paused;
W.on('change', k => { if (k === 'settings') { clearTimeout(N._t); N._t = setTimeout(N.schedule, 1500) } });
