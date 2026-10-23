import { createClient } from "npm:@supabase/supabase-js@2.118.0";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
function reply(status: number, body: object) {
  return new Response(JSON.stringify(body), { status, headers });
}
async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (n) => n.toString(16).padStart(2, "0")).join("");
}
async function readBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("empty");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 4096) { await reader.cancel(); throw new Error("too_large"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return reply(405, { code: "method_not_allowed" });
  try {
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    const allowedKeys = [Deno.env.get("SUPABASE_ANON_KEY"), ...Object.values(publishableKeys)].filter(Boolean);
    if (!allowedKeys.includes(req.headers.get("apikey"))) return reply(401, { code: "invalid_api_key" });
    let body;
    try { body = await readBody(req); } catch { return reply(400, { code: "invalid_input" }); }
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const password = body?.password;
    if (!/^[a-z0-9_]{4,20}$/.test(username) || !name || [...name].length > 50
      || typeof password !== "string" || password.length < 8 || password.length > 128) {
      return reply(400, { code: "invalid_input" });
    }
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Hash addresses; never store raw addresses or passwords in the rate-limit table.
    const address = req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
    const { data: allowed, error: limitError } = await admin.rpc("consume_signup_limit", {
      identifier_hash: await digest(username), address_hash: await digest(address),
    });
    if (limitError) { console.error("Signup limit failed", limitError.code, limitError.message); return reply(503, { code: "temporarily_unavailable" }); }
    if (!allowed) return reply(429, { code: "over_request_rate_limit" });
    const registrationToken = crypto.randomUUID();
    const { error: ticketError } = await admin.rpc("prepare_registration", {
      registration_token: registrationToken, member_username: username, member_name: name,
    });
    if (ticketError) return reply(ticketError.code === "23505" ? 409 : 503, {
      code: ticketError.code === "23505" ? "user_already_exists" : "temporarily_unavailable",
    });
    const { data, error } = await admin.auth.admin.createUser({
      // This reserved domain is an internal username identifier, never a user's email.
      email: username + "@accounts.sonmalitgi.invalid",
      password, email_confirm: true,
      user_metadata: { name, username, registration_token: registrationToken },
      app_metadata: { signup_source: "sonmalitgi_username" },
    });
    if (error) {
      await admin.rpc("discard_registration", { registration_token: registrationToken });
      const code = error.code || "";
      if (["email_exists", "user_already_exists"].includes(code)) return reply(409, { code: "user_already_exists" });
      if (code === "weak_password") return reply(400, { code });
      console.error("Username signup failed", code || error.name, error.status);
      return reply(503, { code: "temporarily_unavailable" });
    }
    if (!data.user) return reply(503, { code: "temporarily_unavailable" });
    return reply(201, { ok: true });
  } catch (error) {
    console.error("Signup handler failed", error instanceof Error ? error.name : "unknown");
    return reply(503, { code: "temporarily_unavailable" });
  }
});
