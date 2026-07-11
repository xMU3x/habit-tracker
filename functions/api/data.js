// Cloudflare Pages Function
// المسار: GET /api/data?key=xxx
// (يقابل نفس المسار القديم اللي الواجهة الأمامية بتناديه أصلاً)

import { getValue, jsonResponse, corsHeaders } from "../_lib/supabase.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return jsonResponse({ error: "key required" }, 400);
  }

  try {
    const value = await getValue(env, key);
    return jsonResponse(value ?? null, 200);
  } catch (err) {
    console.error("get-data error:", err);
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}
