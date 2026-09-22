import fs from "fs";
import path from "path";
import { 
  inMemoryDb, 
  getUserProfile, 
  updateUserProfile, 
  getWeeklySchedule, 
  updateWeeklySchedule, 
  getRecipes, 
  getGroceryList, 
  saveGroceryList,
  checkSupabaseStatus 
} from "../src/server/supabaseService.ts";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("   Running Database Schema & Migration Test Suite                ");
  console.log("==================================================================\n");

  // Suite 1: Source Data Completeness
  console.log("Test Suite 1: Local Dataset Completeness");
  assert(Boolean(inMemoryDb.userProfile.name), "User Profile has valid name");
  assert(inMemoryDb.userProfile.calorieTarget > 0, "User Profile has positive calorie target");
  assert(inMemoryDb.recipes.length === 8, "All 8 sample recipes are loaded", `found: ${inMemoryDb.recipes.length}`);
  assert(inMemoryDb.weeklySchedule.length === 7, "All 7 weekly schedule days are present", `found: ${inMemoryDb.weeklySchedule.length}`);
  
  let mealCount = 0;
  for (const day of inMemoryDb.weeklySchedule) {
    if (day.meals.breakfast) mealCount++;
    if (day.meals.lunch) mealCount++;
    if (day.meals.snack) mealCount++;
    if (day.meals.dinner) mealCount++;
  }
  assert(mealCount === 28, "All 28 scheduled meals across 7 days are intact", `found: ${mealCount}`);
  assert(inMemoryDb.groceryList.length === 30, "All 30 grocery items are loaded", `found: ${inMemoryDb.groceryList.length}`);

  // Suite 2: Schema Migration File Checks
  console.log("\nTest Suite 2: Supabase Schema SQL Specification");
  const schemaPath = path.join(process.cwd(), "supabase/migrations/20260921000000_initial_schema.sql");
  const schemaExists = fs.existsSync(schemaPath);
  assert(schemaExists, "Schema migration SQL file exists");

  if (schemaExists) {
    const sql = fs.readFileSync(schemaPath, "utf-8");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.user_profiles"), "Contains user_profiles table definition");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.recipes"), "Contains recipes table definition");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.weekly_schedules"), "Contains weekly_schedules table definition");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.meals"), "Contains meals table definition");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.grocery_items"), "Contains grocery_items table definition");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.hydration_logs"), "Contains hydration_logs table definition");
    assert(sql.includes("REFERENCES public.user_profiles(id) ON DELETE CASCADE"), "Foreign key relationship to user_profiles configured");
    assert(sql.includes("REFERENCES public.weekly_schedules(id) ON DELETE CASCADE"), "Foreign key relationship to weekly_schedules configured");
    assert(sql.includes("ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY"), "Row Level Security configured");
  }

  // Suite 3: Service Layer & Fallback Behavior
  console.log("\nTest Suite 3: Supabase Service Layer & Data Access");
  const status = await checkSupabaseStatus();
  assert(status.mode === "local_memory" || status.mode === "supabase_postgresql", "Database status check runs safely without uncaught exception");

  const profile = await getUserProfile();
  assert(profile.name === inMemoryDb.userProfile.name, "getUserProfile() returns valid profile");

  const updatedProfile = await updateUserProfile({ calorieTarget: 2200 });
  assert(updatedProfile.calorieTarget === 2200, "updateUserProfile() updates target correctly");
  // Restore
  await updateUserProfile({ calorieTarget: 2150 });

  const schedule = await getWeeklySchedule();
  assert(schedule.length === 7, "getWeeklySchedule() returns all 7 days");

  const recipes = await getRecipes();
  assert(recipes.length >= 8, "getRecipes() returns all recipes");

  const groceries = await getGroceryList();
  assert(groceries.length === 30, "getGroceryList() returns all grocery items");

  const testGroceries = [...groceries];
  testGroceries[0].purchased = !testGroceries[0].purchased;
  const savedGroceries = await saveGroceryList(testGroceries);
  assert(savedGroceries[0].purchased === testGroceries[0].purchased, "saveGroceryList() persists changes");

  console.log("\n==================================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
  console.log("==================================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
