import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  initialUserProfile, 
  initialWeeklySchedule, 
  sampleRecipes, 
  initialGroceryList 
} from "../data/initialData.ts";
import { UserProfile, DayPlan, Recipe, GroceryItem, MealItem } from "../types.ts";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  let url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  // Normalize URL by removing trailing slash or /rest/v1 path if provided
  url = url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      return null;
    }
  }

  return supabaseClient;
}

// In-memory persistent state (fallback when Supabase is not configured yet)
class InMemoryStore {
  userProfile: UserProfile = { ...initialUserProfile };
  recipes: Recipe[] = JSON.parse(JSON.stringify(sampleRecipes));
  weeklySchedule: DayPlan[] = JSON.parse(JSON.stringify(initialWeeklySchedule));
  groceryList: GroceryItem[] = JSON.parse(JSON.stringify(initialGroceryList));
}

export const inMemoryDb = new InMemoryStore();

// Default user ID for single-tenant / current user profile mapping
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Check Supabase connectivity status
 */
export async function checkSupabaseStatus() {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      mode: "local_memory",
      message: "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) not set. Running on local in-memory store.",
    };
  }

  try {
    const { error } = await client.from("user_profiles").select("id").limit(1);
    if (error) {
      return {
        connected: false,
        mode: "supabase_error",
        message: `Supabase reached but query error: ${error.message}. Ensure schema migration has been applied.`,
      };
    }
    return {
      connected: true,
      mode: "supabase_postgresql",
      message: "Connected to Supabase PostgreSQL database successfully.",
    };
  } catch (err: any) {
    return {
      connected: false,
      mode: "connection_error",
      message: err.message || "Failed to reach Supabase.",
    };
  }
}

/**
 * Migrate existing local data into Supabase PostgreSQL
 */
export async function migrateDataToSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  }

  const report = {
    userProfileMigrated: 0,
    recipesMigrated: 0,
    schedulesMigrated: 0,
    mealsMigrated: 0,
    groceriesMigrated: 0,
    errors: [] as string[],
  };

  // 1. Migrate User Profile
  try {
    const profile = inMemoryDb.userProfile;
    const { error: profileError } = await client.from("user_profiles").upsert({
      id: DEFAULT_USER_ID,
      name: profile.name,
      email: profile.email || "alex.morgan@lifestyle.io",
      age: profile.age,
      gender: profile.gender,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      activity_level: profile.activityLevel,
      food_preference: profile.foodPreference,
      fitness_goal: profile.fitnessGoal,
      calorie_target: profile.calorieTarget,
      protein_target: profile.proteinTarget,
      carbs_target: profile.carbsTarget,
      fat_target: profile.fatTarget,
      water_target_ml: profile.waterTargetMl,
      allergies: profile.allergies,
      favorite_foods: profile.favoriteFoods,
      foods_to_avoid: profile.foodsToAvoid,
      meals_per_day: profile.mealsPerDay,
      budget: profile.budget,
      cooking_time: profile.cookingTime,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (profileError) throw profileError;
    report.userProfileMigrated = 1;
  } catch (err: any) {
    report.errors.push(`User Profile migration failed: ${err.message}`);
  }

  // 2. Migrate Recipes
  try {
    const recipesToInsert = inMemoryDb.recipes.map((r) => ({
      id: r.id,
      name: r.name,
      meal_type: r.mealType,
      diet_type: r.dietType,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      fiber: r.fiber || 0,
      prep_time: r.prepTime,
      servings: r.servings,
      difficulty: r.difficulty || "Easy",
      image: r.image,
      tags: r.tags || [],
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
    }));

    const { error: recipesError } = await client.from("recipes").upsert(recipesToInsert, { onConflict: "id" });
    if (recipesError) throw recipesError;
    report.recipesMigrated = recipesToInsert.length;
  } catch (err: any) {
    report.errors.push(`Recipes migration failed: ${err.message}`);
  }

  // 3. Migrate Weekly Schedules & Meals
  try {
    let schedulesCount = 0;
    let mealsCount = 0;

    for (const dayPlan of inMemoryDb.weeklySchedule) {
      // Upsert day schedule
      const { data: scheduleData, error: scheduleError } = await client.from("weekly_schedules").upsert({
        user_id: DEFAULT_USER_ID,
        day: dayPlan.day,
        date: dayPlan.date || null,
        total_calories: dayPlan.totalCalories,
        total_protein: dayPlan.totalProtein,
        total_carbs: dayPlan.totalCarbs,
        total_fat: dayPlan.totalFat,
        water_ml: dayPlan.waterMl || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,day" }).select("id").single();

      if (scheduleError) throw scheduleError;
      const scheduleId = scheduleData.id;
      schedulesCount++;

      // Upsert the 4 slot meals
      const slots: Array<"breakfast" | "lunch" | "snack" | "dinner"> = ["breakfast", "lunch", "snack", "dinner"];
      const mealsToInsert = slots.map((slot) => {
        const meal = dayPlan.meals[slot];
        return {
          id: meal.id || `meal-${slot}-${dayPlan.day.toLowerCase()}`,
          schedule_id: scheduleId,
          slot,
          meal_type: meal.type,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber || 0,
          prep_time: meal.prepTime || 15,
          servings: meal.servings || 1,
          completed: Boolean(meal.completed),
          ingredients: meal.ingredients || [],
          instructions: meal.instructions || [],
          image: meal.image || null,
          tags: meal.tags || [],
          difficulty: meal.difficulty || null,
          source_recipe_id: meal.sourceRecipeId || null,
        };
      });

      const { error: mealsError } = await client.from("meals").upsert(mealsToInsert, { onConflict: "id" });
      if (mealsError) throw mealsError;
      mealsCount += mealsToInsert.length;
    }

    report.schedulesMigrated = schedulesCount;
    report.mealsMigrated = mealsCount;
  } catch (err: any) {
    report.errors.push(`Weekly schedule / meals migration failed: ${err.message}`);
  }

  // 4. Migrate Grocery Items
  try {
    const groceriesToInsert = inMemoryDb.groceryList.map((g) => ({
      id: g.id,
      user_id: DEFAULT_USER_ID,
      name: g.name,
      amount: g.amount,
      category: g.category,
      purchased: Boolean(g.purchased),
      meal_source: g.mealSource || null,
      updated_at: new Date().toISOString(),
    }));

    const { error: groceryError } = await client.from("grocery_items").upsert(groceriesToInsert, { onConflict: "id" });
    if (groceryError) throw groceryError;
    report.groceriesMigrated = groceriesToInsert.length;
  } catch (err: any) {
    report.errors.push(`Grocery list migration failed: ${err.message}`);
  }

  return report;
}

// ------------------------------------------------------------------------------
// Service Methods for API Endpoints
// ------------------------------------------------------------------------------

export async function getUserProfile(): Promise<UserProfile> {
  const client = getSupabaseClient();
  if (!client) {
    return inMemoryDb.userProfile;
  }

  try {
    const { data, error } = await client.from("user_profiles").select("*").eq("id", DEFAULT_USER_ID).maybeSingle();
    if (error || !data) {
      return inMemoryDb.userProfile;
    }

    return {
      name: data.name,
      email: data.email,
      age: data.age,
      gender: data.gender,
      heightCm: Number(data.height_cm),
      weightKg: Number(data.weight_kg),
      activityLevel: data.activity_level,
      foodPreference: data.food_preference,
      fitnessGoal: data.fitness_goal,
      calorieTarget: data.calorie_target,
      proteinTarget: data.protein_target,
      carbsTarget: data.carbs_target,
      fatTarget: data.fat_target,
      waterTargetMl: data.water_target_ml,
      allergies: data.allergies || [],
      favoriteFoods: data.favorite_foods || [],
      foodsToAvoid: data.foods_to_avoid || [],
      mealsPerDay: data.meals_per_day,
      budget: data.budget,
      cookingTime: data.cooking_time,
    };
  } catch (err) {
    console.error("Error fetching user profile from Supabase:", err);
    return inMemoryDb.userProfile;
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  // Always update in-memory as safe cache
  inMemoryDb.userProfile = { ...inMemoryDb.userProfile, ...profile };

  const client = getSupabaseClient();
  if (client) {
    try {
      const p = inMemoryDb.userProfile;
      await client.from("user_profiles").upsert({
        id: DEFAULT_USER_ID,
        name: p.name,
        email: p.email || "alex.morgan@lifestyle.io",
        age: p.age,
        gender: p.gender,
        height_cm: p.heightCm,
        weight_kg: p.weightKg,
        activity_level: p.activityLevel,
        food_preference: p.foodPreference,
        fitness_goal: p.fitnessGoal,
        calorie_target: p.calorieTarget,
        protein_target: p.proteinTarget,
        carbs_target: p.carbsTarget,
        fat_target: p.fatTarget,
        water_target_ml: p.waterTargetMl,
        allergies: p.allergies,
        favorite_foods: p.favoriteFoods,
        foods_to_avoid: p.foodsToAvoid,
        meals_per_day: p.mealsPerDay,
        budget: p.budget,
        cooking_time: p.cookingTime,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    } catch (err) {
      console.error("Error updating user profile in Supabase:", err);
    }
  }

  return inMemoryDb.userProfile;
}

export async function getWeeklySchedule(): Promise<DayPlan[]> {
  const client = getSupabaseClient();
  if (!client) {
    return inMemoryDb.weeklySchedule;
  }

  try {
    const { data: schedules, error } = await client
      .from("weekly_schedules")
      .select("*, meals(*)")
      .eq("user_id", DEFAULT_USER_ID);

    if (error || !schedules || schedules.length === 0) {
      return inMemoryDb.weeklySchedule;
    }

    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const mapped: DayPlan[] = schedules.map((s) => {
      const defaultDay = initialWeeklySchedule.find((d) => d.day === s.day);
      const mealsObj: any = {
        breakfast: defaultDay?.meals.breakfast,
        lunch: defaultDay?.meals.lunch,
        snack: defaultDay?.meals.snack,
        dinner: defaultDay?.meals.dinner,
      };

      (s.meals || []).forEach((m: any) => {
        if (m.slot) {
          mealsObj[m.slot] = {
            id: m.id,
            name: m.name,
            type: m.meal_type || (m.slot === "snack" ? "Snacks" : m.slot.charAt(0).toUpperCase() + m.slot.slice(1)),
            calories: Number(m.calories) || 0,
            protein: Number(m.protein) || 0,
            carbs: Number(m.carbs) || 0,
            fat: Number(m.fat) || 0,
            fiber: Number(m.fiber || 0),
            prepTime: Number(m.prep_time) || 15,
            servings: Number(m.servings) || 1,
            completed: Boolean(m.completed),
            ingredients: Array.isArray(m.ingredients) ? m.ingredients : [],
            instructions: Array.isArray(m.instructions) ? m.instructions : [],
            image: m.image || null,
            tags: Array.isArray(m.tags) ? m.tags : [],
            difficulty: m.difficulty || "Easy",
            sourceRecipeId: m.source_recipe_id || null,
          };
        }
      });

      return {
        day: s.day,
        date: s.date || defaultDay?.date,
        totalCalories: Number(s.total_calories) || (
          (mealsObj.breakfast?.calories || 0) +
          (mealsObj.lunch?.calories || 0) +
          (mealsObj.snack?.calories || 0) +
          (mealsObj.dinner?.calories || 0)
        ),
        totalProtein: Number(s.total_protein) || 0,
        totalCarbs: Number(s.total_carbs) || 0,
        totalFat: Number(s.total_fat) || 0,
        waterMl: Number(s.water_ml) || 2500,
        meals: mealsObj,
      };
    });

    mapped.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
    return mapped;
  } catch (err) {
    console.error("Error fetching schedule from Supabase:", err);
    return inMemoryDb.weeklySchedule;
  }
}

export async function updateWeeklySchedule(schedule: DayPlan[]): Promise<DayPlan[]> {
  inMemoryDb.weeklySchedule = schedule;
  const client = getSupabaseClient();
  if (!client) return schedule;

  try {
    for (const dayPlan of schedule) {
      const { data: scheduleData } = await client.from("weekly_schedules").upsert({
        user_id: DEFAULT_USER_ID,
        day: dayPlan.day,
        date: dayPlan.date || null,
        total_calories: dayPlan.totalCalories,
        total_protein: dayPlan.totalProtein,
        total_carbs: dayPlan.totalCarbs,
        total_fat: dayPlan.totalFat,
        water_ml: dayPlan.waterMl || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,day" }).select("id").single();

      if (scheduleData?.id) {
        const slots: Array<"breakfast" | "lunch" | "snack" | "dinner"> = ["breakfast", "lunch", "snack", "dinner"];
        const mealsToInsert = slots.map((slot) => {
          const meal = dayPlan.meals[slot];
          return {
            id: meal.id,
            schedule_id: scheduleData.id,
            slot,
            meal_type: meal.type,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            fiber: meal.fiber || 0,
            prep_time: meal.prepTime || 15,
            servings: meal.servings || 1,
            completed: Boolean(meal.completed),
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || [],
            image: meal.image || null,
            tags: meal.tags || [],
            difficulty: meal.difficulty || null,
            source_recipe_id: meal.sourceRecipeId || null,
          };
        });
        await client.from("meals").upsert(mealsToInsert, { onConflict: "id" });
      }
    }
  } catch (err) {
    console.error("Error persisting schedule to Supabase:", err);
  }
  return schedule;
}

export async function getRecipes(): Promise<Recipe[]> {
  const client = getSupabaseClient();
  if (!client) return inMemoryDb.recipes;

  try {
    const { data, error } = await client.from("recipes").select("*");
    if (error || !data || data.length === 0) return inMemoryDb.recipes;

    return data.map((r) => ({
      id: r.id,
      name: r.name,
      mealType: r.meal_type,
      dietType: r.diet_type || [],
      calories: r.calories,
      protein: Number(r.protein),
      carbs: Number(r.carbs),
      fat: Number(r.fat),
      fiber: Number(r.fiber || 0),
      prepTime: r.prep_time,
      servings: r.servings,
      difficulty: r.difficulty,
      image: r.image,
      tags: r.tags || [],
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
    }));
  } catch (err) {
    console.error("Error fetching recipes from Supabase:", err);
    return inMemoryDb.recipes;
  }
}

export async function getGroceryList(): Promise<GroceryItem[]> {
  const client = getSupabaseClient();
  if (!client) return inMemoryDb.groceryList;

  try {
    const { data, error } = await client.from("grocery_items").select("*").eq("user_id", DEFAULT_USER_ID);
    if (error || !data || data.length === 0) return inMemoryDb.groceryList;

    return data.map((g) => ({
      id: g.id,
      name: g.name,
      amount: g.amount,
      category: g.category,
      purchased: g.purchased,
      mealSource: g.meal_source,
    }));
  } catch (err) {
    console.error("Error fetching grocery list from Supabase:", err);
    return inMemoryDb.groceryList;
  }
}

export async function saveGroceryList(items: GroceryItem[]): Promise<GroceryItem[]> {
  inMemoryDb.groceryList = items;
  const client = getSupabaseClient();
  if (!client) return items;

  try {
    // Delete existing and re-insert for sync consistency
    await client.from("grocery_items").delete().eq("user_id", DEFAULT_USER_ID);
    if (items.length > 0) {
      const records = items.map((g) => ({
        id: g.id,
        user_id: DEFAULT_USER_ID,
        name: g.name,
        amount: g.amount,
        category: g.category,
        purchased: Boolean(g.purchased),
        meal_source: g.mealSource || null,
        updated_at: new Date().toISOString(),
      }));
      await client.from("grocery_items").insert(records);
    }
  } catch (err) {
    console.error("Error syncing grocery list to Supabase:", err);
  }
  return items;
}
