import { config } from "dotenv";

// 1. Load Environment Variables explicitly
// This must happen before any other imports!
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
// Note: We don't import 'db' or 'auth' here yet!

async function createAdmin() {
  // 2. Dynamic Import
  // This forces the DB to connect ONLY after config() has run
  // Adjust the path "../db" if your folder is actually "src/db"
  const { db } = await import("../db"); 
  const { user } = await import("../db/schema");
  const { auth } = await import("../lib/auth");

  const email = "anshulshakya18168@gmail.com";
  const password = "Ansh6723@#";
  const name = "Super Admin";

  console.log("🔌 Connecting to DB...");

  // 3. Create User via Better-Auth
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    }
  });

  if (!result) {
    console.log("⚠️ Failed to create admin (User might already exist).");
    return;
  }

  console.log("👤 User created. Promoting to Admin...");

  // 4. Update Role in Database
  await db.update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email));

  console.log("✅ Admin created successfully!");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});