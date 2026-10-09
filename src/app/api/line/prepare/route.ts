import { ensureLineIngestSecret } from "@/lib/line-server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return Response.json({ error: "運営だけが設定できます" }, { status: 403 });
  }
  await ensureLineIngestSecret(supabase);
  return new Response(null, { status: 204 });
}
