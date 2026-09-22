import dotenv from "dotenv";
import { 
  getSupabaseClient, 
  migrateDataToSupabase, 
  checkSupabaseStatus 
} from "../src/server/supabaseService.ts";

dotenv.config();

async function run() {
  console.log("==================================================================");
  console.log("   AI Smart Meal Planner - Supabase PostgreSQL Migration Tool     ");
  console.log("==================================================================");
  
  const status = await checkSupabaseStatus();
  console.log("Connection Status:", status.mode);
  console.log("Message:", status.message);

  if (!status.connected) {
    console.error("\n[ERROR] Cannot proceed with migration: Supabase is not connected.");
    console.error("Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in your environment.");
    process.exit(1);
  }

  console.log("\nStarting data migration from local initial dataset...");
  const report = await migrateDataToSupabase();

  console.log("\n---------------- Migration Summary ----------------");
  console.log(`✓ User Profiles Migrated:   ${report.userProfileMigrated}`);
  console.log(`✓ Recipes Migrated:         ${report.recipesMigrated}`);
  console.log(`✓ Weekly Schedules Migrated: ${report.schedulesMigrated}`);
  console.log(`✓ Meals Migrated:           ${report.mealsMigrated}`);
  console.log(`✓ Grocery Items Migrated:   ${report.groceriesMigrated}`);
  
  if (report.errors.length > 0) {
    console.warn("\nWarnings / Errors encountered:");
    report.errors.forEach((err) => console.warn(`- ${err}`));
  } else {
    console.log("\nAll records migrated successfully with zero data loss!");
  }
}

run().catch((err) => {
  console.error("Migration execution failed:", err);
  process.exit(1);
});
