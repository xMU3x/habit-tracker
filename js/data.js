/* بيانات + مواقيت الصلاة */
const D = W.D = { _c: {} };
D.load = async n => D._c[n] ||= fetch(`data/${n}.json`).then(r => { if (!r.ok) throw new Error(n); return r.json() });
/* quran: ayahs = [surah, ayah, text, juz, page, hizbQuarter, sajda]; surahs = [n, name, meccan, count] */
D.quran = async () => { const q = await D.load('quran'); if (!q._idx) { q._idx = {}; q.ayahs.forEach((a, i) => { (q._idx[a[4]] ||= []).push(i) }); q._first = {}; q.ayahs.forEach((a, i) => { if (a[1] === 1) q._first[a[0]] = i }) } return q };
D.sName = (q, n) => q.surahs[n - 1][1].replace(/^سُورَةُ\s*/, '');
D.bare = s => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[آأإٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
D.JUZ_START_PAGE = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];
D.juzOfPage = p => { let j = 1; D.JUZ_START_PAGE.forEach((s, i) => { if (p >= s) j = i + 1 }); return j };

/* ---------- prayer times (astronomical, PrayTimes-style) ---------- */
const rad = Math.PI / 180, dsin = d => Math.sin(d * rad), dcos = d => Math.cos(d * rad), dtan = d => Math.tan(d * rad);
const arcsin = x => Math.asin(x) / rad, arccos = x => Math.acos(x) / rad, arccot = x => Math.atan(1 / x) / rad, fix = (a, b) => (a - b * Math.floor(a / b));
const METHODS = {
  Egypt: { n: 'الهيئة المصرية العامة للمساحة', f: 19.5, i: 17.5 }, MWL: { n: 'رابطة العالم الإسلامي', f: 18, i: 17 }, Makkah: { n: 'أم القرى (مكة المكرمة)', f: 18.5, i: '90 min' },
  ISNA: { n: 'أمريكا الشمالية (ISNA)', f: 15, i: 15 }, Karachi: { n: 'جامعة العلوم الإسلامية، كراتشي', f: 18, i: 18 }, Kuwait: { n: 'وزارة الأوقاف الكويتية', f: 18, i: 17.5 }
};
D.METHODS = METHODS;
function sunPos(jd) { const d = jd - 2451545, g = fix(357.529 + .98560028 * d, 360), q = fix(280.459 + .98564736 * d, 360), L = fix(q + 1.915 * dsin(g) + .02 * dsin(2 * g), 360), e = 23.439 - 3.6e-7 * d, RA = Math.atan2(dcos(e) * dsin(L), dcos(L)) / rad / 15; return { decl: arcsin(dsin(e) * dsin(L)), eq: q / 15 - fix(RA, 24) } }
function julian(y, m, d) { if (m <= 2) { y -= 1; m += 12 } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 }
D.times = (date, lat, lng, methodKey = 'Egypt', asr = 'standard') => {
  const M = METHODS[methodKey] || METHODS.Egypt, tz = -date.getTimezoneOffset() / 60, jd = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / 360;
  const T = (ang, t, ccw) => { const s = sunPos(jd + t / 24), noon = fix(12 - s.eq, 24), v = 1 / 15 * arccos((-dsin(ang) - dsin(lat) * dsin(s.decl)) / (dcos(lat) * dcos(s.decl))); return noon + (ccw ? -v : v) };
  const mid = t => 12 - sunPos(jd + t / 24).eq;
  const asrT = t => { const s = sunPos(jd + t / 24), f = asr === 'hanafi' ? 2 : 1, a = -arccot(f + dtan(Math.abs(lat - s.decl))); return fix(12 - s.eq, 24) + 1 / 15 * arccos((-dsin(a) - dsin(lat) * dsin(s.decl)) / (dcos(lat) * dcos(s.decl))) };
  const adj = t => t + tz - lng / 15; let fj = adj(T(M.f, 5, true)), sr = adj(T(.833, 6, true)), dh = adj(mid(12)) + 1 / 60, as = adj(asrT(13)), mg = adj(T(.833, 18)), is = typeof M.i === 'string' ? mg + parseFloat(M.i) / 60 : adj(T(M.i, 18));
  const toDate = h => { if (isNaN(h)) return null; const d = new Date(date); d.setHours(0, 0, 0, 0); d.setMinutes(Math.round(fix(h, 24) * 60)); return d };
  return { fajr: toDate(fj), sunrise: toDate(sr), dhuhr: toDate(dh), asr: toDate(as), maghrib: toDate(mg), isha: toDate(is) }
};
D.PRAYERS = [['fajr', 'الفجر'], ['sunrise', 'الشروق'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']];
D.fmt = (d, ar) => { if (!d) return '--:--'; let h = d.getHours(), m = d.getMinutes(); const s = h >= 12 ? 'م' : 'ص'; h = h % 12 || 12; return `${ar ? AR(h) : h}:${ar ? AR(pad(m)) : pad(m)} ${s}` };
D.loc = () => W.cfg.get('loc') || { name: 'القاهرة، مصر', lat: 30.0444, lng: 31.2357, auto: false };
D.today = (date = new Date()) => { const l = D.loc(); return D.times(date, l.lat, l.lng, W.cfg.get('method'), W.cfg.get('asr')) };
D.next = () => { const now = new Date(); let t = D.today(now), list = D.PRAYERS.map(([k, n]) => ({ k, n, t: t[k] })).filter(x => x.t); let nx = list.find(x => x.t > now); if (!nx) { const tm = new Date(now); tm.setDate(tm.getDate() + 1); const t2 = D.today(tm); nx = { k: 'fajr', n: 'الفجر', t: t2.fajr, tomorrow: true } } return { next: nx, list, diff: nx.t - now } };
D.qibla = (lat, lng) => { const k = { la: 21.4225, lo: 39.8262 }, p = (k.lo - lng) * rad, a = lat * rad, b = k.la * rad; return (Math.atan2(Math.sin(p), Math.cos(a) * Math.tan(b) - Math.sin(a) * Math.cos(p)) / rad + 360) % 360 };
D.dist = (lat, lng) => { const R = 6371, a = lat * rad, b = 21.4225 * rad, dl = (39.8262 - lng) * rad; return R * Math.acos(Math.min(1, Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(dl))) };
D.hijri = (date = new Date()) => { const d = new Date(date); d.setDate(d.getDate() + (+W.cfg.get('hijriAdj') || 0)); try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-' + (W.cfg.get('arDigits') ? 'arab' : 'latn'), { day: 'numeric', month: 'long', year: 'numeric' }).format(d) } catch { return '' } };
D.CITIES = [['القاهرة', 'مصر', 30.0444, 31.2357], ['الإسكندرية', 'مصر', 31.2001, 29.9187], ['الجيزة', 'مصر', 30.0131, 31.2089], ['المنصورة', 'مصر', 31.0409, 31.3785], ['طنطا', 'مصر', 30.7865, 31.0004], ['أسيوط', 'مصر', 27.1809, 31.1837], ['الأقصر', 'مصر', 25.6872, 32.6396], ['أسوان', 'مصر', 24.0889, 32.8998], ['بورسعيد', 'مصر', 31.2653, 32.3019], ['السويس', 'مصر', 29.9668, 32.5498], ['الإسماعيلية', 'مصر', 30.5965, 32.2715], ['الزقازيق', 'مصر', 30.5877, 31.502], ['الفيوم', 'مصر', 29.3084, 30.8428], ['المنيا', 'مصر', 28.1099, 30.7503], ['سوهاج', 'مصر', 26.5569, 31.6948], ['دمياط', 'مصر', 31.4165, 31.8133], ['الغردقة', 'مصر', 27.2579, 33.8116], ['شرم الشيخ', 'مصر', 27.9158, 34.33], ['مكة المكرمة', 'السعودية', 21.3891, 39.8579], ['المدينة المنورة', 'السعودية', 24.5247, 39.5692], ['الرياض', 'السعودية', 24.7136, 46.6753], ['جدة', 'السعودية', 21.4858, 39.1925], ['الدمام', 'السعودية', 26.4207, 50.0888], ['الطائف', 'السعودية', 21.2703, 40.4158], ['تبوك', 'السعودية', 28.3835, 36.555], ['أبها', 'السعودية', 18.2164, 42.5053], ['القدس', 'فلسطين', 31.7683, 35.2137], ['رام الله', 'فلسطين', 31.9038, 35.2034], ['عمّان', 'الأردن', 31.9454, 35.9284], ['دمشق', 'سوريا', 33.5138, 36.2765], ['بيروت', 'لبنان', 33.8938, 35.5018], ['بغداد', 'العراق', 33.3152, 44.3661], ['البصرة', 'العراق', 30.5081, 47.7835], ['مدينة الكويت', 'الكويت', 29.3759, 47.9774], ['المنامة', 'البحرين', 26.2285, 50.586], ['الدوحة', 'قطر', 25.2854, 51.531], ['أبو ظبي', 'الإمارات', 24.4539, 54.3773], ['الشارقة', 'الإمارات', 25.3463, 55.4209], ['مسقط', 'عمان', 23.588, 58.3829], ['صنعاء', 'اليمن', 15.3694, 44.191], ['الخرطوم', 'السودان', 15.5007, 32.5599], ['مقديشو', 'الصومال', 2.0469, 45.3182], ['طرابلس', 'ليبيا', 32.8872, 13.1913], ['بنغازي', 'ليبيا', 32.1194, 20.0868], ['تونس', 'تونس', 36.8065, 10.1815], ['الجزائر', 'الجزائر', 36.7538, 3.0588], ['الرباط', 'المغرب', 34.0209, -6.8416], ['الدار البيضاء', 'المغرب', 33.5731, -7.5898], ['مراكش', 'المغرب', 31.6295, -7.9811], ['نواكشوط', 'موريتانيا', 18.0735, -15.9582], ['إسطنبول', 'تركيا', 41.0082, 28.9784], ['أنقرة', 'تركيا', 39.9334, 32.8597], ['طهران', 'إيران', 35.6892, 51.389], ['كراتشي', 'باكستان', 24.8607, 67.0011], ['إسلام آباد', 'باكستان', 33.6844, 73.0479], ['دلهي', 'الهند', 28.6139, 77.209], ['جاكرتا', 'إندونيسيا', -6.2088, 106.8456], ['كوالالمبور', 'ماليزيا', 3.139, 101.6869], ['لندن', 'بريطانيا', 51.5072, -0.1276], ['باريس', 'فرنسا', 48.8566, 2.3522], ['برلين', 'ألمانيا', 52.52, 13.405], ['نيويورك', 'أمريكا', 40.7128, -74.006], ['لوس أنجلوس', 'أمريكا', 34.0522, -118.2437], ['تورنتو', 'كندا', 43.6532, -79.3832], ['سيدني', 'أستراليا', -33.8688, 151.2093]];
D.geocode = async q => { try { const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=ar`); const j = await r.json(); return (j.results || []).map(x => [x.name, x.country || '', x.latitude, x.longitude]) } catch { return [] } };
D.gps = () => new Promise((res, rej) => { if (!navigator.geolocation) return rej('unsupported'); navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), e => rej(e.code === 1 ? 'denied' : 'fail'), { timeout: 12000, maximumAge: 600000 }) });

/* ---------- activity / streak / points ---------- */
D.touch = () => store.upd('activity', { days: {} }, a => { a.days[TD()] = (a.days[TD()] || 0) + 1 });
D.streak = () => { const a = store.get('activity', { days: {} }).days; let d = new Date(), n = 0; if (!a[dkey(d)]) d.setDate(d.getDate() - 1); while (a[dkey(d)]) { n++; d.setDate(d.getDate() - 1) } const best = Math.max(n, store.get('activity', {}).best || 0); return { cur: n, best } };
D.pagesToday = () => (store.get('quran', {}).pagesRead || {})[TD()] || 0;
D.addPages = n => { store.upd('quran', {}, q => { q.pagesRead ||= {}; q.pagesRead[TD()] = Math.max(0, (q.pagesRead[TD()] || 0) + n) }); D.touch() };
