// Cloudflare Pages Function
// المسار: GET /api/data/export
// بيرجع كل البيانات المخزنة (كل المفاتيح والقيم) عشان تصديرها كنسخة احتياطية

import { getAllValues, jsonResponse, corsHeaders } from "../../_lib/supabase.js";

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const rows = await getAllValues(env);
    return jsonResponse(rows, 200);
  } catch (err) {
    console.error("export-data error:", err);
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}
