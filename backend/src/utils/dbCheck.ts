import { supabaseAdmin } from "../middleware/authenticate";

const DEV_USER_UUID = "00000000-0000-0000-0000-000000000001";

const REQUIRED_TABLES = [
  "users",
  "medical_profiles",
  "medications",
  "chat_messages",
  "reminders",
  "reminder_logs",
];

function checkServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env");
    return false;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(key.split(".")[1], "base64").toString()
    );
    if (payload.role !== "service_role") {
      console.warn(
        `⚠️  SUPABASE_SERVICE_ROLE_KEY has role="${payload.role}" (expected "service_role")`
      );
      console.warn(
        "   Writes may fail if RLS is enabled. Get the service_role key from Supabase Dashboard → Settings → API\n"
      );
      return false;
    }
    return true;
  } catch {
    console.error("❌ Could not decode SUPABASE_SERVICE_ROLE_KEY JWT");
    return false;
  }
}

async function checkTable(table: string): Promise<{ exists: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from(table)
    .select("*", { count: "exact", head: true });

  if (!error) return { exists: true };

  const msg = error.message || "";
  if (
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    error.code === "42P01" ||
    error.code === "PGRST204"
  ) {
    return { exists: false, error: msg };
  }

  return { exists: true, error: msg };
}

async function ensureDevUser(): Promise<void> {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", DEV_USER_UUID)
    .single();

  if (data) {
    console.log(`✅ Dev user exists (${DEV_USER_UUID})`);
    return;
  }

  const { error } = await supabaseAdmin.from("users").insert({
    id: DEV_USER_UUID,
    phone: "+1000000000",
    username: "Dev User",
    age: 65,
    primary_goal: "both",
    theme_preference: "light",
  });

  if (error) {
    console.error("⚠️  Could not create dev user:", error.message);
    console.error("   You may need to insert manually or use the service_role key\n");
  } else {
    console.log(`✅ Created dev user (${DEV_USER_UUID})`);
  }
}

export async function runStartupChecks(): Promise<void> {
  console.log("\n🔍 Running database checks...");

  checkServiceRoleKey();

  const missing: string[] = [];
  const errors: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table);
    if (!result.exists) {
      missing.push(table);
    } else if (result.error) {
      errors.push(`${table}: ${result.error}`);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing tables: ${missing.join(", ")}`);
    console.error("   Run the SQL files in Supabase Dashboard → SQL Editor:");
    if (missing.some((t) => ["users", "medical_profiles", "medications"].includes(t))) {
      console.error("   → supabase/phase3_schema.sql");
    }
    if (missing.includes("chat_messages")) {
      console.error("   → supabase/phase4_schema.sql");
    }
    if (missing.some((t) => ["reminders", "reminder_logs"].includes(t))) {
      console.error("   → supabase/phase5_schema.sql");
    }
    console.error("");
  }

  if (errors.length > 0) {
    console.warn("⚠️  Table access issues:");
    for (const e of errors) {
      console.warn(`   ${e}`);
    }
    console.warn("");
  }

  if (missing.length === 0 && errors.length === 0) {
    console.log("✅ All database tables found and accessible");
  }

  if (!missing.includes("users")) {
    await ensureDevUser();
  }

  console.log("");
}
