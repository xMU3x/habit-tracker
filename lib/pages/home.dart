import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../app.dart';
import '../core/challenges.dart';
import '../core/fasting.dart';
import '../core/khatma.dart';
import '../core/tasks.dart';
import '../core/notify.dart';
import '../core/util.dart';
import '../ui/skyline.dart';
import '../ui/theme.dart';
import '../ui/widgets.dart';
import '../core/data.dart';
import '../core/mawaiz.dart';
import 'account.dart';
import 'tasks.dart';
import 'settings.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late Future<Mawaz> _mw = randomMawaz();
  Mawaz? _cur;

  @override
  Widget build(BuildContext context) {
    return StoreBuilder(tab: 0,
      builder: (context, _) {
        final p = Pal.of(context);
        final kh = khatma(), pg = pagesToday(), st = streak();
        final goal = ((kh['goal'] as num?) ?? 5).toInt(), read = ((kh['read'] as num?) ?? 0).toInt();
        final nf0 = nextFast(), rn = nextReminder();
        final when = nf0 == null ? '' : nf0.inDays == 0 ? 'اليوم' : nf0.inDays == 1 ? 'غدًا' : 'بعد ${nf(nf0.inDays)} أيام';
        final fastTitle = nf0?.info.tags.where((t) => t.kind != 'eid').firstOrNull?.t ?? 'يوم صيام';
        final mq = MediaQuery.of(context);
        final tf = tasksFraction();
        final wf = goal > 0 ? (pg / goal).clamp(0.0, 1.0).toDouble() : 0.0;
        return Backdrop(
          child: ListView(
            padding: EdgeInsets.zero,
            physics: const BouncingScrollPhysics(),
            children: [
              SkylineHeader(
                height: mq.padding.top + 168,
                radius: 0,
                colors: [p.hero[0], p.hero[1]],
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16, mq.padding.top + 10, 16, 12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('السلام عليكم', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                        const Text('طاب يومك ووفقك الله', style: TextStyle(fontSize: 13, color: Colors.white70)),
                      ])),
                      RoundIconButton(Icons.tune, () => pushPage(const SettingsPage())),
                      RoundIconButton(Icons.person, () => pushPage(const AccountPage())),
                    ]),
                    const Spacer(),
                    const DatePill(),
                  ]),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  HeroCard(
                    onTap: () => openRoute('fasting'),
                    margin: const EdgeInsets.only(top: 14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Row(children: [Icon(Icons.nightlight_round, size: 20), SizedBox(width: 8), Text('الصيام القادم', style: TextStyle(fontWeight: FontWeight.w700))]),
                      const SizedBox(height: 12),
                      if (nf0 != null) _FastBar(inDays: nf0.inDays),
                      const SizedBox(height: 14),
                      Text(nf0 == null ? 'لا توجد أيام قريبة' : fastTitle, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
                      if (nf0 != null) Text('$when · ${wdays[jsDay(nf0.info.date)]} ${nf(nf0.info.date.day)} ${gmonths[nf0.info.date.month - 1]} (${toAr(nf0.info.h.d)} ${hmonths[nf0.info.h.m - 1]})', style: const TextStyle(color: Colors.white70)),
                    ]),
                  ),
                  const SizedBox(height: 14),
                  FutureBuilder(
                    future: chalToday(),
                    builder: (_, s) {
                      final tot = s.data?.total ?? 0, dn = s.data?.done ?? 0;
                      return Column(children: [
                        Row(children: [
                          Expanded(child: _MiniCard(title: 'تحديات اليوم', sub: '${nf(dn)} من ${nf(tot)} · 🔥 ${nf(st.cur)}', icon: Icons.emoji_events, onTap: () => openRoute('challenges'))),
                          const SizedBox(width: 12),
                          Expanded(child: _MiniCard(title: 'مهام اليوم', sub: '${nf(tasksDone())} من ${nf(kTasksTotal)}', v: tf, onTap: () => pushPage(const TasksPage()))),
                        ]),
                        const SizedBox(height: 12),
                        Row(children: [
                          Expanded(child: _MiniCard(title: 'التذكير القادم', sub: rn == null ? 'لا توجد تذكيرات' : '${rn.it.title} · ${whenLabel(rn.at)}', icon: Icons.notifications, onTap: () => openRoute('reminders'))),
                          const SizedBox(width: 12),
                          Expanded(child: _MiniCard(title: 'ختمة القرآن', sub: '${nf(read)} من ${nf(604)} صفحة', v: read / 604, onTap: () => openRoute('khatma'))),
                        ]),
                      ]);
                    },
                  ),
                  AppCard(
                    onTap: () => openRoute('khatma'),
                    child: Row(children: [
                      Ring(v: wf, size: 54, stroke: 6, child: Text('${nf((wf * 100).round())}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700))),
                      const SizedBox(width: 14),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('ورد اليوم', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                        Sub('${nf(pg)}/${nf(goal)} صفحة'),
                      ])),
                      Icon(Icons.chevron_left, color: p.on2),
                    ]),
                  ),
              FutureBuilder<Mawaz>(
                future: _mw,
                builder: (_, s) {
                  if (!s.hasData) return const SizedBox.shrink();
                  _cur = s.data;
                  return _MawazCard(m: s.data!, onMore: () => setState(() => _mw = randomMawaz(not: _cur)));
                },
              ),
              const SectionTitle('الوصول السريع'),
              GridView.count(
                crossAxisCount: 4, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: .82,
                children: [
                  for (final q in const [
                    ('التسبيح', Icons.auto_awesome, 'tasbih'), ('التحديات', Icons.emoji_events, 'challenges'),
                    ('الختمة', Icons.flag, 'khatma'), ('الرقية', Icons.water_drop, 'ruqya'),
                    ('التذكيرات', Icons.notifications, 'reminders'), ('التقويم', Icons.calendar_month, 'fasting'),
                    ('القرّاء', Icons.music_note, 'reciters'), ('المزيد', Icons.grid_view, 'more'),
                  ])
                    AppCard(
                      margin: EdgeInsets.zero, padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 2), radius: 22,
                      onTap: () => openRoute(q.$3),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [IconBox(q.$2, size: 40), const SizedBox(height: 8), Text(q.$1, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600), textAlign: TextAlign.center)]),
                    ),
                ],
              ),
                  SizedBox(height: 100 + mq.padding.bottom),
                ]),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// بطاقة «موعظة اليوم» (تصميم بشريط جانبي وشارة النوع ونصيحة عملية).
class _MawazCard extends StatelessWidget {
  final Mawaz m;
  final VoidCallback onMore;
  const _MawazCard({required this.m, required this.onMore});
  @override
  Widget build(BuildContext context) {
    final p = Pal.of(context);
    final full = '${m.text}\n— ${m.source}';
    return Padding(
      padding: const EdgeInsets.only(top: 18),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(children: [
          const Expanded(child: Text('موعظة اليوم', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))),
          TextButton(onPressed: () { hap.tick(); onMore(); }, child: const Text('المزيد')),
        ]),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 350),
          child: Container(
            key: ValueKey(m.text),
            decoration: BoxDecoration(color: p.surf, borderRadius: BorderRadius.circular(28), border: Border.all(color: p.line)),
            clipBehavior: Clip.antiAlias,
            child: IntrinsicHeight(
              child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Container(width: 6, color: p.gold),
                Expanded(child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6), decoration: BoxDecoration(color: p.pc, borderRadius: BorderRadius.circular(20)), child: Text(m.label, style: TextStyle(color: p.pri, fontWeight: FontWeight.w700, fontSize: 13))),
                      const SizedBox(width: 10),
                      Expanded(child: Text(m.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17))),
                    ]),
                    const SizedBox(height: 12),
                    Text(m.kind == 'hadith' ? '« ${m.text} »' : m.text, style: const TextStyle(fontFamily: quranFont, fontSize: 24, height: 2)),
                    const SizedBox(height: 4),
                    Sub(m.source),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider()),
                    Text(m.tip, style: TextStyle(color: p.on2, fontSize: 15, height: 1.7)),
                    Row(children: [
                      IconButton(onPressed: () => copyText(full), icon: Icon(Icons.copy_outlined, color: p.on2)),
                      IconButton(onPressed: () { hap.click(); Share.share(full); }, icon: Icon(Icons.share_outlined, color: p.on2)),
                      const Spacer(),
                      IconButton(onPressed: () { hap.tick(); onMore(); }, icon: Icon(Icons.autorenew, color: p.pri)),
                    ]),
                  ]),
                )),
              ]),
            ),
          ),
        ),
      ]),
    );
  }
}


/// شريط تقدّم نحو يوم الصيام القادم (يمتلئ كلما اقترب الموعد).
class _FastBar extends StatelessWidget {
  final int inDays;
  const _FastBar({required this.inDays});
  @override
  Widget build(BuildContext context) {
    final v = fastProgress(inDays);
    final label = inDays == 0 ? 'اليوم' : inDays == 1 ? 'متبقٍ يوم واحد' : inDays == 2 ? 'متبقٍ يومان' : 'متبقٍ ${nf(inDays)} أيام';
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Row(children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        const Spacer(),
        Text('${nf((v * 100).round())}%', style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
      ]),
      const SizedBox(height: 8),
      TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: v),
        duration: const Duration(milliseconds: 700),
        curve: Curves.easeOutCubic,
        builder: (_, t, __) => ClipRRect(
          borderRadius: BorderRadius.circular(8),
          // اتجاه الشريط يتبع RTL: يمتلئ من اليمين
          child: LinearProgressIndicator(value: t.clamp(0.0, 1.0), minHeight: 7, backgroundColor: Colors.white.withValues(alpha: .18), valueColor: const AlwaysStoppedAnimation(Color(0xFFE2C98A))),
        ),
      ),
    ]);
  }
}


/// بطاقة صغيرة للشبكة (٢×٢) في الرئيسية: حلقة تقدّم أو أيقونة + عنوان + وصف.
class _MiniCard extends StatelessWidget {
  final String title, sub;
  final double? v;
  final IconData? icon;
  final VoidCallback onTap;
  const _MiniCard({required this.title, required this.sub, this.v, this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final p = Pal.of(context);
    return AppCard(
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.all(12),
      onTap: onTap,
      child: Row(children: [
        if (v != null)
          Ring(v: v!, size: 46, stroke: 5, child: Text('${nf((v! * 100).round().clamp(0, 100))}%', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700)))
        else
          IconBox(icon ?? Icons.circle, size: 46),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          Text(sub, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: p.on2, fontSize: 11.5, height: 1.4)),
        ])),
      ]),
    );
  }
}
