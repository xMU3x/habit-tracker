// Cloudflare Pages Function
// المسار: POST /api/data/save
// (يقابل نفس المسار القديم اللي الواجهة الأمامية بتناديه أصلاً)

import { setValue, jsonResponse, corsHeaders } from "../../_lib/supabase.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { key, value } = await request.json();
    if (!key) {
      return jsonResponse({ error: "key required" }, 400);
    }

    await setValue(env, key, value);
    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("save-data error:", err);
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}
