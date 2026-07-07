// =============================================
// Supabase REST (PostgREST) helper — بدون أي مكتبات خارجية
// شغّال مباشرة على Cloudflare Pages Functions (Workers runtime)
// =============================================

export function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    ...extra
  };
}

export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(extraHeaders)
  });
}

// بيقرأ قيمة واحدة من جدول kv_store باستخدام الـ key
export async function getValue(env, key) {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY env vars");
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&select=value`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase GET failed (${res.status}): ${text}`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0].value ?? null;
}

// بيحفظ (insert أو update) قيمة في جدول kv_store — upsert باستخدام on_conflict=key
export async function setValue(env, key, value) {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY env vars");
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/kv_store?on_conflict=key`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify([
      {
        key,
        value,
        updated_at: new Date().toISOString()
      }
    ])
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase UPSERT failed (${res.status}): ${text}`);
  }

  return true;
}
