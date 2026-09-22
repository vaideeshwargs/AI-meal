import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { 
  checkSupabaseStatus, 
  migrateDataToSupabase, 
  getUserProfile, 
  updateUserProfile, 
  getWeeklySchedule, 
  updateWeeklySchedule, 
  getRecipes, 
  getGroceryList, 
  saveGroceryList 
} from "./src/server/supabaseService.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Primary and fallback models supported by @google/genai SDK
const PRIMARY_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  config?: any
) {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini] Attempting generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        console.log(`[Gemini] Successfully received response from ${model}`);
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errorMsg = err?.message || String(err);
      console.warn(`[Gemini] Call to ${model} failed (${err?.status || err?.code || "unknown"}): ${errorMsg}`);
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
}

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check with Supabase and AI status
app.get("/api/health", async (_req, res) => {
  const dbStatus = await checkSupabaseStatus();
  res.json({ 
    status: "ok", 
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    database: dbStatus
  });
});

// Supabase Database Connection & Migration Endpoints
app.get("/api/db/status", async (_req, res) => {
  try {
    const status = await checkSupabaseStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to check database status" });
  }
});

app.get("/api/db/schema", async (_req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), "supabase/migrations/20260921000000_initial_schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");
    res.json({ sql });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to read schema file" });
  }
});

app.post("/api/db/migrate", async (_req, res) => {
  try {
    const report = await migrateDataToSupabase();
    res.json({ success: true, message: "Supabase data migration completed successfully", report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Migration failed" });
  }
});

// Relational Management System Data Endpoints
app.get("/api/profile", async (_req, res) => {
  try {
    const profile = await getUserProfile();
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/profile", async (req, res) => {
  try {
    const updated = await updateUserProfile(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/recipes", async (_req, res) => {
  try {
    const recipes = await getRecipes();
    res.json(recipes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/schedule", async (_req, res) => {
  try {
    const schedule = await getWeeklySchedule();
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/schedule", async (req, res) => {
  try {
    const updated = await updateWeeklySchedule(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/grocery", async (_req, res) => {
  try {
    const groceries = await getGroceryList();
    res.json(groceries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/grocery", async (req, res) => {
  try {
    const updated = await saveGroceryList(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback intelligent generator if Gemini key is absent or fails
function generateFallbackMealPlan(params: any) {
  const isVeg = params.dietPreference === "Vegetarian" || params.dietPreference === "Vegan";
  const targetCals = Number(params.calorieGoal) || 2000;
  const numDays = params.days === 7 ? 7 : 1;
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const vegBreakfasts = [
    { name: "Avocado & Spinach Toast with Poached Eggs", calories: 380, protein: 18, carbs: 36, fat: 19, prepTime: 15, ingredients: ["2 slices sourdough", "1 ripe avocado", "2 organic eggs", "1 cup baby spinach", "Chili flakes", "Lemon wedge"], instructions: ["Toast bread to golden brown.", "Mash avocado with salt, pepper, and lemon.", "Poach eggs for 3 mins in simmering water.", "Assemble with spinach base, avocado, and eggs on top."] },
    { name: "Overnight Chia Berry Protein Pudding", calories: 340, protein: 24, carbs: 42, fat: 9, prepTime: 10, ingredients: ["3 tbsp chia seeds", "1 cup almond milk", "1 scoop plant protein", "1/2 cup fresh blueberries", "1 tbsp honey", "1 tbsp crushed walnuts"], instructions: ["Mix chia seeds, almond milk, and protein powder in a jar.", "Chill in fridge overnight or 4 hours.", "Top with blueberries, walnuts, and honey drizzle."] },
    { name: "Mediterranean Veggie Omelet & Feta", calories: 410, protein: 26, carbs: 12, fat: 28, prepTime: 18, ingredients: ["3 large eggs", "1/4 cup crumbled feta", "1/2 cup diced bell peppers", "1/4 red onion", "Handful cherry tomatoes", "1 tsp olive oil"], instructions: ["Saute peppers, onions, and tomatoes in olive oil.", "Whisk eggs and pour into skillet.", "Cook gently until set, fold in feta cheese."] }
  ];

  const nonVegBreakfasts = [
    { name: "Smoked Salmon & Poached Egg Toast", calories: 420, protein: 28, carbs: 32, fat: 20, prepTime: 15, ingredients: ["2 slices multigrain bread", "80g smoked salmon", "2 poached eggs", "1 tbsp Greek yogurt cream cheese", "Capers and dill"], instructions: ["Toast bread and spread light yogurt cheese.", "Layer wild smoked salmon slices.", "Top with poached eggs, capers, and fresh dill."] },
    { name: "Turkey Sausage & Scrambled Egg Bowl", calories: 450, protein: 34, carbs: 22, fat: 24, prepTime: 20, ingredients: ["2 lean turkey sausage patties", "2 large eggs", "1/2 sweet potato cubes", "1/2 cup sauteed kale", "1 tsp avocado oil"], instructions: ["Roast sweet potato cubes in a skillet with avocado oil.", "Brown turkey sausages.", "Scramble eggs and assemble bowl with fresh sauteed kale."] }
  ];

  const vegLunches = [
    { name: "Quinoa, Roasted Chickpea & Tahini Rainbow Bowl", calories: 520, protein: 21, carbs: 68, fat: 18, prepTime: 25, ingredients: ["1 cup cooked quinoa", "1 cup spiced crispy chickpeas", "1/2 roasted sweet potato", "1 cup mixed greens", "2 tbsp lemon tahini dressing", "1 tbsp hemp hearts"], instructions: ["Cook quinoa with vegetable broth.", "Roast chickpeas with cumin and paprika at 400F for 20m.", "Assemble in bowl with greens and sweet potatoes, drizzle tahini."] },
    { name: "Lentil & Sweet Potato Coconut Curry", calories: 490, protein: 22, carbs: 64, fat: 16, prepTime: 30, ingredients: ["1 cup red lentils", "1/2 sweet potato", "1/2 cup light coconut milk", "1 cup spinach", "1 tsp curry spice blend", "Fresh cilantro"], instructions: ["Simmer lentils and diced sweet potato in vegetable stock and spices.", "Stir in light coconut milk and simmer until creamy.", "Fold in fresh spinach and garnish with cilantro."] }
  ];

  const nonVegLunches = [
    { name: "Lemon Herb Grilled Chicken & Quinoa Salad", calories: 540, protein: 44, carbs: 46, fat: 17, prepTime: 25, ingredients: ["180g grilled chicken breast", "1 cup cooked fluffy quinoa", "1 cup cucumber & cherry tomato salad", "1 tbsp extra virgin olive oil", "Fresh parsley and lemon juice"], instructions: ["Season chicken with oregano, garlic, and grill 6 mins per side.", "Toss quinoa with diced cucumber, tomatoes, lemon, and olive oil.", "Slice chicken and serve over the fresh salad."] },
    { name: "Seared Wild Salmon with Brown Rice & Steamed Asparagus", calories: 580, protein: 42, carbs: 48, fat: 22, prepTime: 25, ingredients: ["160g salmon fillet", "1 cup steamed brown rice", "1 bunch asparagus spears", "1 clove minced garlic", "1 tbsp lemon herb butter"], instructions: ["Sear salmon skin-side down in a hot pan for 4 mins, flip and cook 3 mins.", "Steam asparagus until crisp-tender with minced garlic.", "Serve over warm brown rice with lemon herb drizzle."] }
  ];

  const vegSnacks = [
    { name: "Greek Yogurt Parfait with Mixed Berries & Almonds", calories: 230, protein: 18, carbs: 24, fat: 7, prepTime: 5, ingredients: ["1 cup non-fat Greek yogurt", "1/2 cup organic raspberries & blueberries", "1 tbsp sliced roasted almonds", "1 tsp pure maple syrup"], instructions: ["Layer Greek yogurt in a glass with berries.", "Top with sliced almonds and maple drizzle."] },
    { name: "Crunchy Spiced Edamame & Roasted Pumpkin Seeds", calories: 190, protein: 14, carbs: 14, fat: 8, prepTime: 10, ingredients: ["1 cup steamed edamame in pods", "1 tbsp roasted pepitas", "Flaky sea salt", "Smoked paprika"], instructions: ["Steam edamame for 5 mins.", "Toss with sea salt, smoked paprika, and crunchy pepitas."] }
  ];

  const vegDinners = [
    { name: "Stir-Fried Sesame Tofu with Soba Noodles & Bok Choy", calories: 480, protein: 24, carbs: 58, fat: 17, prepTime: 25, ingredients: ["200g extra-firm pressed tofu cubes", "80g buckwheat soba noodles", "2 heads baby bok choy", "1 tbsp low-sodium tamari", "1 tsp toasted sesame oil", "Toasted sesame seeds"], instructions: ["Boil soba noodles for 4 minutes and rinse cold.", "Pan-fry tofu in sesame oil until crisp on all sides.", "Toss in bok choy, tamari, and noodles for 2 mins, garnish with sesame."] },
    { name: "Roasted Mediterranean Vegetable & Halloumi Skewers", calories: 460, protein: 22, carbs: 32, fat: 26, prepTime: 25, ingredients: ["120g halloumi cheese", "1 zucchini", "1 bell pepper", "1 red onion", "1 cup cherry tomatoes", "1 tbsp chimichurri herb oil"], instructions: ["Thread chopped halloumi, zucchini, bell peppers, and onion onto skewers.", "Grill for 8-10 minutes turning occasionally.", "Drizzle with fresh chimichurri herb oil."] }
  ];

  const nonVegDinners = [
    { name: "Herb-Crusted Baked Cod with Roasted Fingerling Potatoes", calories: 470, protein: 38, carbs: 38, fat: 16, prepTime: 30, ingredients: ["200g wild cod fillet", "150g halved fingerling potatoes", "1 cup tender green beans", "1 tbsp Dijon mustard & herb breadcrumbs", "1 tbsp olive oil"], instructions: ["Roast potatoes in olive oil at 400F for 20 minutes.", "Brush cod with Dijon and herb crust.", "Bake cod alongside green beans for 12-15 minutes until flakey."] },
    { name: "Garlic Butter Sirloin Steak Bites with Cauliflower Mash", calories: 530, protein: 46, carbs: 18, fat: 28, prepTime: 25, ingredients: ["180g lean sirloin steak cubed", "2 cups steamed cauliflower florets", "1 tbsp grass-fed butter", "2 cloves crushed garlic", "Fresh rosemary and thyme"], instructions: ["Blend steamed cauliflower with garlic and butter until smooth.", "Sear steak cubes in a sizzling skillet with rosemary for 3-4 mins.", "Serve steak bites over the warm silky cauliflower puree."] }
  ];

  const breakfasts = isVeg ? vegBreakfasts : nonVegBreakfasts;
  const lunches = isVeg ? vegLunches : nonVegLunches;
  const snacks = vegSnacks;
  const dinners = isVeg ? vegDinners : nonVegDinners;

  const planDays = [];
  for (let i = 0; i < numDays; i++) {
    const dayName = daysOfWeek[i % 7];
    const b = breakfasts[i % breakfasts.length];
    const l = lunches[i % lunches.length];
    const s = snacks[i % snacks.length];
    const d = dinners[i % dinners.length];

    const dayTotalCals = b.calories + l.calories + s.calories + d.calories;
    const dayTotalProtein = b.protein + l.protein + s.protein + d.protein;
    const dayTotalCarbs = b.carbs + l.carbs + s.carbs + d.carbs;
    const dayTotalFat = b.fat + l.fat + s.fat + d.fat;

    planDays.push({
      day: dayName,
      totalCalories: dayTotalCals,
      totalProtein: dayTotalProtein,
      totalCarbs: dayTotalCarbs,
      totalFat: dayTotalFat,
      meals: {
        breakfast: { id: `meal-b-${i}`, type: "Breakfast", ...b, completed: false, servings: 1 },
        lunch: { id: `meal-l-${i}`, type: "Lunch", ...l, completed: false, servings: 1 },
        snack: { id: `meal-s-${i}`, type: "Snacks", ...s, completed: false, servings: 1 },
        dinner: { id: `meal-d-${i}`, type: "Dinner", ...d, completed: false, servings: 1 },
      }
    });
  }

  return {
    title: `${params.fitnessGoal || "Healthy"} Personalized Meal Plan`,
    summary: `Tailored for a ${targetCals} kcal daily intake emphasizing ${params.dietPreference || "balanced"} nutrition, prioritizing ${params.fitnessGoal || "wellness"} with wholesome ingredients.`,
    dietaryNotes: `Targeting ~${targetCals} calories per day. Rich in balanced lean proteins, wholesome complex carbs, and heart-healthy unsaturated fats. Remember to stay hydrated with 2.5L+ water daily.`,
    disclaimer: "Nutrition values are automated estimates based on standard recipe databases. For medical conditions, pregnancy, or severe allergies, consult a registered dietitian or medical professional.",
    days: planDays,
  };
}

// AI Meal Plan Generation Route
app.post("/api/ai/meal-plan", async (req, res) => {
  try {
    const preferences = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Return high-quality structured fallback
      const fallback = generateFallbackMealPlan(preferences);
      return res.json(fallback);
    }

    const prompt = `You are a certified sports nutritionist and executive chef.
Generate a structured ${preferences.days === 7 ? "7-day" : "1-day"} meal plan tailored to these user requirements:
- Diet Preference: ${preferences.dietPreference || "Balanced"}
- Vegetarian/Non-Vegetarian: ${preferences.dietPreference}
- Daily Calorie Target: ${preferences.calorieGoal || 2000} kcal
- Fitness Goal: ${preferences.fitnessGoal || "Maintenance"}
- Number of meals per day: ${preferences.mealsPerDay || 4} (must include breakfast, lunch, snack, dinner)
- Budget level: ${preferences.budget || "Moderate"}
- Cooking time preference: ${preferences.cookingTime || "Moderate (20-40 min)"}
- Favorite Foods: ${preferences.favoriteFoods || "None specified"}
- Foods to Avoid: ${preferences.foodsToAvoid || "None"}
- Allergies: ${preferences.allergies || "None"}

Respond strictly with valid JSON with no markdown wrapping or formatting backticks.
JSON Schema:
{
  "title": "string",
  "summary": "string",
  "dietaryNotes": "string",
  "disclaimer": "Nutrition values are estimates. For medical conditions or clinical diets, consult a healthcare professional.",
  "days": [
    {
      "day": "Monday",
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "meals": {
        "breakfast": {
          "id": "b-mon",
          "name": "string",
          "type": "Breakfast",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "prepTime": number,
          "servings": 1,
          "completed": false,
          "ingredients": ["string"],
          "instructions": ["string"]
        },
        "lunch": {
          "id": "l-mon",
          "name": "string",
          "type": "Lunch",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "prepTime": number,
          "servings": 1,
          "completed": false,
          "ingredients": ["string"],
          "instructions": ["string"]
        },
        "snack": {
          "id": "s-mon",
          "name": "string",
          "type": "Snacks",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "prepTime": number,
          "servings": 1,
          "completed": false,
          "ingredients": ["string"],
          "instructions": ["string"]
        },
        "dinner": {
          "id": "d-mon",
          "name": "string",
          "type": "Dinner",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "prepTime": number,
          "servings": 1,
          "completed": false,
          "ingredients": ["string"],
          "instructions": ["string"]
        }
      }
    }
  ]
}`;

    const response = await generateWithFallback(ai, prompt, {
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (parseError) {
      console.warn("[Gemini] Failed to parse Gemini JSON response, returning fallback", parseError);
      return res.json(generateFallbackMealPlan(preferences));
    }
  } catch (error: any) {
    console.error("[Gemini] Meal plan generation error:", error?.message || error);
    return res.json(generateFallbackMealPlan(req.body));
  }
});

// AI Chatbot Route
app.post("/api/ai/chat", async (req, res) => {
  const { message, conversationHistory, context, userProfile, currentDayPlan } = req.body;
  console.log(`[AI Chat] Received query: "${message}"`);

  try {
    const ai = getGenAI();

    if (!ai) {
      console.warn("[AI Chat] GEMINI_API_KEY is not configured on server.");
      return res.status(500).json({
        reply: "The Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is set in your server environment.",
        error: "GEMINI_API_KEY missing",
      });
    }

    const effectiveProfile = userProfile || context?.userProfile || {};
    const effectivePlan = currentDayPlan || context?.currentDayPlan || {};

    const systemInstruction = `You are "AI Smart Meal Planner Assistant", a helpful, empathetic, and expert certified sports nutritionist and chef.
User Profile Context:
${JSON.stringify({ profile: effectiveProfile, currentDayPlan: effectivePlan }, null, 2)}

Guidelines:
- Provide clear, direct, and actionable culinary and nutritional guidance.
- If asked for ingredient substitutes (such as what to use if having no eggs, milk, flour, etc.), provide specific options tailored to the user's culinary intent (e.g., binding, leavening, moisture, or scrambled substitutes) with exact ratios and flavor impact.
- When suggesting recipes or snacks, include estimated calories, macronutrient balance (protein, carbs, fats), and preparation time.
- If recommending meal swaps, respect the user's dietary preferences (Vegetarian, Vegan, Keto, Balanced, etc.) and calorie target.
- Keep tone warm, encouraging, and professional.
- For medical questions, eating disorders, or severe clinical allergies, gently remind the user to consult a physician or registered dietitian.
- Structure responses with clean bullet points or short paragraphs for readability.`;

    // Format chat contents with conversation history if available
    let contents: any;
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      // Map previous turns to role/parts, omitting initial welcome message if needed
      const previousTurns = conversationHistory
        .filter((turn: any) => turn.text && !turn.id?.includes("welcome"))
        .map((turn: any) => ({
          role: turn.role === "assistant" || turn.role === "model" ? "model" : "user",
          parts: [{ text: String(turn.text) }],
        }));

      contents = [
        ...previousTurns,
        { role: "user", parts: [{ text: String(message) }] },
      ];
    } else {
      contents = String(message);
    }

    const response = await generateWithFallback(ai, contents, {
      systemInstruction,
      temperature: 0.7,
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      throw new Error("Received empty response text from Gemini API.");
    }

    console.log(`[AI Chat] Generated response (${replyText.length} chars). Preview: "${replyText.substring(0, 100)}..."`);

    return res.json({
      reply: replyText,
      modelUsed: PRIMARY_MODEL,
      disclaimer: "Nutrition values are estimates. Consult a healthcare professional for clinical advice.",
    });
  } catch (error: any) {
    const errorDetails = error?.message || String(error);
    console.error("[AI Chat] Error during Gemini generation:", errorDetails, error?.stack || "");
    return res.status(500).json({
      reply: "I'm having trouble connecting to the AI service right now. " + (error?.status === 503 ? "The AI service is experiencing high demand—please try again in a moment." : "Please try again shortly."),
      error: errorDetails,
    });
  }
});

// AI Single Meal Replacement / Regeneration Route
app.post("/api/ai/replace-meal", async (req, res) => {
  try {
    const { currentMeal, mealType, criteria, userPreferences } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback alternative
      const alternatives: Record<string, any[]> = {
        Breakfast: [
          { name: "Blueberry Protein Oatmeal with Chia", calories: 360, protein: 22, carbs: 48, fat: 8, prepTime: 12, ingredients: ["1/2 cup rolled oats", "1 scoop vanilla protein", "1/2 cup fresh blueberries", "1 tbsp chia seeds", "Almond milk"], instructions: ["Cook oats with almond milk.", "Stir in protein powder and top with blueberries and chia seeds."] },
          { name: "Avocado Egg Wrap with Microgreens", calories: 390, protein: 19, carbs: 32, fat: 21, prepTime: 14, ingredients: ["1 whole wheat tortilla", "2 scrambled eggs", "1/4 sliced avocado", "Microgreens", "Salsa"], instructions: ["Scramble eggs.", "Warm tortilla, layer avocado, eggs, microgreens, and roll snugly."] }
        ],
        Lunch: [
          { name: "Mediterranean Falafel Bowl with Tzatziki", calories: 480, protein: 19, carbs: 58, fat: 20, prepTime: 20, ingredients: ["4 baked falafel patties", "1 cup mixed baby greens", "1/2 cucumber diced", "1/4 cup tzatziki", "1/4 cup kalamata olives"], instructions: ["Warm falafel.", "Assemble greens, cucumber, olives, and top with falafel and tzatziki."] },
          { name: "Crispy Tofu & Edamame Soba Salad", calories: 510, protein: 26, carbs: 54, fat: 19, prepTime: 22, ingredients: ["150g firm tofu cubes", "80g soba noodles", "1/2 cup shelled edamame", "Sesame soy dressing", "Grated carrots"], instructions: ["Boil soba noodles.", "Pan-sear tofu cubes until golden.", "Toss together with edamame, carrots, and sesame dressing."] }
        ],
        Dinner: [
          { name: "Pan-Seared White Fish with Lemon-Caper Zucchini Noodles", calories: 420, protein: 36, carbs: 14, fat: 22, prepTime: 20, ingredients: ["180g white fish (cod/tilapia/halibut)", "2 spiralized zucchinis", "1 tbsp capers", "1 tbsp olive oil", "Juice of 1 lemon"], instructions: ["Season fish and sear 3 mins per side.", "Sauté zucchini noodles with garlic and capers for 2 mins.", "Serve fish atop zesty noodles."] },
          { name: "Creamy Coconut Butternut Squash & Lentil Stew", calories: 460, protein: 20, carbs: 62, fat: 14, prepTime: 30, ingredients: ["1 cup cubed butternut squash", "1/2 cup green lentils", "1/3 cup light coconut milk", "Cumin, ginger, turmeric", "Fresh spinach"], instructions: ["Simmer lentils and squash in broth with aromatics until tender.", "Stir in coconut milk and spinach until wilted."] }
        ],
        Snacks: [
          { name: "Apple Slices with Natural Cinnamon Almond Butter", calories: 210, protein: 6, carbs: 26, fat: 12, prepTime: 5, ingredients: ["1 crisp Honeycrisp apple", "2 tbsp creamy almond butter", "Pinch of Ceylon cinnamon"], instructions: ["Slice apple thinly.", "Dust with cinnamon and serve with almond butter."] },
          { name: "Roasted Rosemary Chickpeas Snack Bowl", calories: 180, protein: 9, carbs: 26, fat: 5, prepTime: 15, ingredients: ["1 cup cooked chickpeas", "1 tsp olive oil", "Fresh minced rosemary", "Sea salt"], instructions: ["Toss chickpeas with olive oil and rosemary.", "Air-fry or bake at 400F for 15 mins until crunchy."] }
        ]
      };

      const list = alternatives[mealType] || alternatives["Lunch"];
      const replacement = list[Math.floor(Math.random() * list.length)];
      return res.json({
        meal: {
          id: `meal-rep-${Date.now()}`,
          type: mealType,
          ...replacement,
          completed: false,
          servings: 1
        }
      });
    }

    const prompt = `Generate a single replacement ${mealType} meal recipe.
Current meal: ${currentMeal ? currentMeal.name : "standard meal"}
Desired criteria: ${criteria || "healthy, well-balanced alternative"}
User Diet: ${userPreferences?.dietPreference || "Balanced"}
Target Calories for this meal: around ${currentMeal?.calories || 450} kcal.

Respond with valid JSON:
{
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "prepTime": number,
  "ingredients": ["string"],
  "instructions": ["string"]
}`;

    const response = await generateWithFallback(ai, prompt, {
      responseMimeType: "application/json",
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      meal: {
        id: `meal-rep-${Date.now()}`,
        type: mealType,
        ...parsed,
        completed: false,
        servings: 1
      }
    });
  } catch (error) {
    console.error("Replace meal error:", error);
    res.status(500).json({ error: "Failed to replace meal" });
  }
});

// Vite Middleware for development & Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
