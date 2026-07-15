// Cloudflare Pages Function
// المسار: POST /api/data/import
// بيسترجع نسخة احتياطية كاملة (مصفوفة من key/value) ويحفظها كلها دفعة واحدة

import { setMultipleValues, jsonResponse, corsHeaders } from "../../_lib/supabase.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : (Array.isArray(body) ? body : null);

    if (!rows) {
      return jsonResponse({ error: "rows array required" }, 400);
    }

    const valid = rows.filter(r => r && typeof r.key === "string");
    await setMultipleValues(env, valid);

    return jsonResponse({ ok: true, count: valid.length }, 200);
  } catch (err) {
    console.error("import-data error:", err);
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}
