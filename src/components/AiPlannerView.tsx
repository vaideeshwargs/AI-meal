import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  Sparkles, 
  Flame, 
  Clock, 
  DollarSign, 
  Utensils, 
  ShieldAlert, 
  Check, 
  CalendarDays, 
  ArrowRight, 
  RefreshCw, 
  Info, 
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { DietPreference, FitnessGoal, BudgetLevel, CookingTimePreference, DayPlan } from "../types";

export const AiPlannerView: React.FC = () => {
  const { userProfile, applyNewPlan, setActiveTab, addToast } = useMealPlanner();

  // Form State initialized from User Profile
  const [dietPreference, setDietPreference] = useState<DietPreference>(userProfile.foodPreference);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(userProfile.fitnessGoal);
  const [calorieGoal, setCalorieGoal] = useState<number>(userProfile.calorieTarget);
  const [mealsPerDay, setMealsPerDay] = useState<number>(userProfile.mealsPerDay || 4);
  const [budget, setBudget] = useState<BudgetLevel>(userProfile.budget || "Moderate");
  const [cookingTime, setCookingTime] = useState<CookingTimePreference>(userProfile.cookingTime || "Moderate (20-40m)");
  const [favoriteFoods, setFavoriteFoods] = useState<string>(userProfile.favoriteFoods.join(", "));
  const [foodsToAvoid, setFoodsToAvoid] = useState<string>(userProfile.foodsToAvoid.join(", "));
  const [allergies, setAllergies] = useState<string[]>(userProfile.allergies || []);
  const [customAllergy, setCustomAllergy] = useState("");
  const [planDays, setPlanDays] = useState<1 | 7>(7);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const allergyOptions = ["Peanuts", "Tree Nuts", "Gluten", "Dairy", "Shellfish", "Soy", "Eggs", "Sesame"];

  const toggleAllergy = (item: string) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter((a) => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedPlan(null);

    // Step sequence for smooth feedback
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const response = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietPreference,
          fitnessGoal,
          calorieGoal,
          mealsPerDay,
          budget,
          cookingTime,
          favoriteFoods,
          foodsToAvoid,
          allergies: allergies.join(", "),
          days: planDays,
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);
      setGeneratedPlan(data);
      addToast("success", "AI Meal Plan Generated!", `Created a ${planDays}-day plan balancing ${calorieGoal} kcal.`);
    } catch (err) {
      console.error("Meal plan fetch error", err);
      clearInterval(stepInterval);
      addToast("error", "Generation Failed", "Could not connect to AI service. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPlan = () => {
    if (!generatedPlan || !generatedPlan.days) return;
    applyNewPlan(generatedPlan.days);
    setActiveTab("weekly");
  };

  const loadingSteps = [
    "Analyzing your metabolic profile and calorie goals...",
    "Balancing macronutrient ratios (Protein, Carbs, Healthy Fats)...",
    "Tailoring recipes for your dietary preferences and allergen restrictions...",
    "Finalizing detailed culinary instructions and grocery mapping...",
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              AI Smart Meal Plan Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized, chef-crafted meal planning powered by Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            1. Configure Nutrition & Dietary Requirements
          </h2>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setPlanDays(1)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                planDays === 1 ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              1 Day Plan
            </button>
            <button
              onClick={() => setPlanDays(7)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                planDays === 7 ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              7-Day Full Week
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diet Preference */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Food Preference / Diet Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                "Balanced",
                "Vegetarian",
                "Non-Vegetarian",
                "Pescatarian",
                "Vegan",
                "High-Protein",
              ].map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setDietPreference(diet as DietPreference)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    dietPreference === diet
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Primary Fitness Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Weight Loss", "Weight Gain", "Maintenance", "Lean Muscle"].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFitnessGoal(goal as FitnessGoal)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    fitnessGoal === goal
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Calorie Goal Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Daily Calorie Target
              </label>
              <span className="text-sm font-bold text-emerald-700 font-heading">
                {calorieGoal} kcal
              </span>
            </div>
            <input
              type="range"
              min="1400"
              max="3500"
              step="50"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1,400 kcal (Cut)</span>
              <span>2,150 kcal (Balanced)</span>
              <span>3,500 kcal (Bulk)</span>
            </div>
          </div>

          {/* Meals Per Day */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Meals per Day
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setMealsPerDay(count)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    mealsPerDay === count
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {count} Meals {count === 4 ? "(Standard)" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Level */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Weekly Budget
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Budget-Friendly", "Moderate", "Gourmet"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b as BudgetLevel)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    budget === b
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Time Preference */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Cooking Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Quick (<20m)", "Moderate (20-40m)", "Elaborate (40m+)"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCookingTime(t as CookingTimePreference)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    cookingTime === t
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Favorite Foods and Foods to Avoid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Favorite Foods & Ingredients
            </label>
            <input
              type="text"
              value={favoriteFoods}
              onChange={(e) => setFavoriteFoods(e.target.value)}
              placeholder="e.g. Avocado, Salmon, Greek yogurt, Blueberries, Quinoa"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Foods & Ingredients to Avoid
            </label>
            <input
              type="text"
              value={foodsToAvoid}
              onChange={(e) => setFoodsToAvoid(e.target.value)}
              placeholder="e.g. Mushrooms, Red meat, Excessive sugar, Cilantro"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Allergies Chips */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Allergies & Intolerances
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {allergyOptions.map((a) => {
              const active = allergies.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergy(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-rose-50 border-rose-300 text-rose-800 font-semibold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  {a}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 max-w-sm">
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomAllergy())}
              placeholder="Add other allergen..."
              className="p-1.5 text-xs border border-slate-200 rounded-lg flex-1"
            />
            <button
              type="button"
              onClick={handleAddCustomAllergy}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Add
            </button>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
            AI strictly adheres to all specified allergens and dietary parameters.
          </p>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {planDays}-Day Meal Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State Animation */}
      {isGenerating && (
        <div className="p-8 rounded-3xl bg-white border border-emerald-200 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Crafting Your Personalized Meal Plan
          </h3>
          <p className="text-xs text-emerald-700 font-medium">
            {loadingSteps[generationStep] || loadingSteps[0]}
          </p>
          <div className="w-64 max-w-full mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${((generationStep + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Generated Plan Result Preview */}
      {generatedPlan && !isGenerating && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Ready to Apply
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {generatedPlan.days?.length || 1} Days Planned
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1 font-heading">
                {generatedPlan.title || "Custom AI Meal Plan"}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {generatedPlan.summary}
              </p>
            </div>

            <button
              onClick={handleApplyPlan}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Plan to Weekly Schedule
            </button>
          </div>

          {/* Dietary notes */}
          {generatedPlan.dietaryNotes && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-emerald-900 block">Nutritionist Notes:</span>
              <p className="leading-relaxed">{generatedPlan.dietaryNotes}</p>
            </div>
          )}

          {/* Days Preview */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated Schedule Preview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedPlan.days?.map((dayPlan: DayPlan) => (
                <div
                  key={dayPlan.day}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">{dayPlan.day}</span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {dayPlan.totalCalories} kcal
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {Object.entries(dayPlan.meals).map(([slot, meal]: [string, any]) => (
                      <div
                        key={slot}
                        className="p-2 rounded-xl bg-white border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {slot}
                          </span>
                          <span className="font-semibold text-slate-800">{meal.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {meal.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Disclaimer: </strong>
            {generatedPlan.disclaimer ||
              "Estimated nutrition values are provided for general educational wellness. Consult a licensed physician or registered dietitian before beginning specialized clinical diets."}
          </div>
        </div>
      )}
    </div>
  );
};
