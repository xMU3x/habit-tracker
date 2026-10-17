import 'package:flutter/material.dart';

/// خلفية الترويسة (أخضر غابي + توهج ذهبي + أفق مساجد) — مرسومة برمجيًا بلا صور خارجية.
class SkylineHeader extends StatelessWidget {
  final double height;
  final Widget? child;
  final List<Color> colors;
  final double radius;
  final bool showSun;
  const SkylineHeader({super.key, required this.height, this.child, required this.colors, this.radius = 30, this.showSun = true});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.vertical(bottom: Radius.circular(radius)),
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: Stack(fit: StackFit.expand, children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: colors),
            ),
          ),
          IgnorePointer(child: CustomPaint(painter: _SkylinePainter(showSun))),
          if (child != null) child!,
        ]),
      ),
    );
  }
}

class _SkylinePainter extends CustomPainter {
  final bool showSun;
  const _SkylinePainter(this.showSun);

  @override
  void paint(Canvas canvas, Size s) {
    final w = s.width, h = s.height;
    // توهج الغروب خلف الأفق
    if (showSun) {
      final c = Offset(w * .28, h * .74);
      canvas.drawCircle(
        c,
        h * .62,
        Paint()..shader = const RadialGradient(colors: [Color(0x99E8C16A), Color(0x33C49D50), Color(0x00C49D50)], stops: [0, .45, 1]).createShader(Rect.fromCircle(center: c, radius: h * .62)),
      );
    }
    final far = Paint()..color = const Color(0xFF0A2E24).withValues(alpha: .55);
    final near = Paint()..color = const Color(0xFF072219).withValues(alpha: .85);
    _mosque(canvas, far, w * .20, h, h * .34, w * .17, minaretLeft: true);
    _mosque(canvas, far, w * .86, h, h * .30, w * .15, minaretLeft: false);
    _mosque(canvas, near, w * .52, h, h * .26, w * .24, minaretLeft: true);
    // نجوم صغيرة
    final st = Paint()..color = const Color(0xFFF3E3B5).withValues(alpha: .55);
    for (final o in [Offset(w * .08, h * .18), Offset(w * .46, h * .10), Offset(w * .72, h * .22), Offset(w * .93, h * .12), Offset(w * .62, h * .34)]) {
      canvas.drawCircle(o, 1.3, st);
    }
  }

  // مسجد: قاعدة + قبة رئيسية + قبتان صغيرتان + مئذنة
  void _mosque(Canvas c, Paint p, double cx, double base, double hh, double ww, {required bool minaretLeft}) {
    final body = Rect.fromCenter(center: Offset(cx, base - hh * .28), width: ww, height: hh * .56);
    c.drawRect(body, p);
    final dome = Path()
      ..moveTo(cx - ww * .32, body.top)
      ..quadraticBezierTo(cx - ww * .32, body.top - hh * .55, cx, body.top - hh * .55)
      ..quadraticBezierTo(cx + ww * .32, body.top - hh * .55, cx + ww * .32, body.top)
      ..close();
    c.drawPath(dome, p);
    c.drawRect(Rect.fromCenter(center: Offset(cx, body.top - hh * .62), width: 1.6, height: hh * .14), p);
    for (final dx in [-ww * .42, ww * .42]) {
      final d = Path()
        ..moveTo(cx + dx - ww * .12, body.top)
        ..quadraticBezierTo(cx + dx - ww * .12, body.top - hh * .22, cx + dx, body.top - hh * .22)
        ..quadraticBezierTo(cx + dx + ww * .12, body.top - hh * .22, cx + dx + ww * .12, body.top)
        ..close();
      c.drawPath(d, p);
    }
    final mx = cx + (minaretLeft ? -ww * .62 : ww * .62);
    c.drawRect(Rect.fromLTWH(mx - ww * .035, body.top - hh * .55, ww * .07, hh * .55 + hh * .56), p);
    final tip = Path()
      ..moveTo(mx - ww * .05, body.top - hh * .55)
      ..lineTo(mx, body.top - hh * .78)
      ..lineTo(mx + ww * .05, body.top - hh * .55)
      ..close();
    c.drawPath(tip, p);
  }

  @override
  bool shouldRepaint(covariant _SkylinePainter old) => old.showSun != showSun;
}
