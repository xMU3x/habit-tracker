// Cloudflare Pages Function
// المسار: GET /api/health
// فحص تشخيصي: بيتأكد من وجود متغيرات البيئة، وبيحاول الاتصال الفعلي بجدول kv_store
// في Supabase، وبيرجّع رسالة الخطأ الحقيقية القادمة من Supabase لو فيه مشكلة.
// الهدف: بدل ما نشوف "500" فاضي في الـ Console، نعرف السبب الحقيقي (متغيرات ناقصة،
// الجدول مش موجود، مفتاح غلط، صلاحيات RLS...).

import { corsHeaders, jsonResponse } from "../_lib/supabase.js";

export async function onRequestGet(context) {
  const { env } = context;
  const report = {
    envVars: {
      SUPABASE_URL: Boolean(env.SUPABASE_URL),
      SUPABASE_SECRET_KEY: Boolean(env.SUPABASE_SECRET_KEY),
      SUPABASE_PUBLISHABLE_KEY: Boolean(env.SUPABASE_PUBLISHABLE_KEY),
      SUPABASE_JWKS_URL: Boolean(env.SUPABASE_JWKS_URL)
    },
    supabaseUrlValue: env.SUPABASE_URL || null,
    table: { reachable: false, status: null, detail: null }
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    report.diagnosis =
      "متغيرات البيئة SUPABASE_URL أو SUPABASE_SECRET_KEY غير موجودة في إعدادات Cloudflare Pages. " +
      "لازم تتضاف من: Cloudflare Pages → المشروع → Settings → Environment variables (لكل من Production و Preview) ثم إعادة النشر (Redeploy).";
    return jsonResponse(report, 200);
  }

  try {
    const endpoint = `${env.SUPABASE_URL}/rest/v1/kv_store?select=key&limit=1`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const text = await res.text();
    report.table.status = res.status;
    report.table.reachable = res.ok;
    report.table.detail = text.slice(0, 500);

    if (res.ok) {
      report.diagnosis = "الاتصال بـ Supabase شغّال تمام، وجدول kv_store موجود ومتاح.";
    } else if (res.status === 404 || /relation .* does not exist/i.test(text)) {
      report.diagnosis =
        "جدول kv_store غير موجود في قاعدة بيانات Supabase. لازم تنشئه أولاً (شوف ملف SQL المرفق).";
    } else if (res.status === 401 || res.status === 403) {
      report.diagnosis =
        "مفتاح SUPABASE_SECRET_KEY مرفوض من Supabase (401/403). تأكد إنك ناسخ المفتاح صح من Supabase → Settings → API، وإنه من نوع secret key.";
    } else {
      report.diagnosis = `رد غير متوقع من Supabase (status ${res.status}). التفاصيل موجودة في table.detail.`;
    }
  } catch (err) {
    report.table.detail = String(err.message || err);
    report.diagnosis = "فشل الاتصال بالسيرفر نفسه (مش رد من Supabase). تأكد من صحة SUPABASE_URL.";
  }

  return jsonResponse(report, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}
