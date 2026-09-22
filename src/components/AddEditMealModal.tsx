import React, { useState, useEffect } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { MealItem, MealType } from "../types";
import { X, Utensils, Flame, Clock, Sparkles } from "lucide-react";

export const AddEditMealModal: React.FC = () => {
  const { editingMeal, setEditingMeal, saveMeal, weeklySchedule } = useMealPlanner();

  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [day, setDay] = useState("Monday");
  const [calories, setCalories] = useState(450);
  const [protein, setProtein] = useState(25);
  const [carbs, setCarbs] = useState(45);
  const [fat, setFat] = useState(15);
  const [prepTime, setPrepTime] = useState(20);
  const [servings, setServings] = useState(1);
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingMeal) {
      setDay(editingMeal.day || "Monday");
      const existing = editingMeal.meal;
      if (existing) {
        setName(existing.name || "");
        setMealType(existing.type || "Breakfast");
        setCalories(existing.calories || 450);
        setProtein(existing.protein || 25);
        setCarbs(existing.carbs || 45);
        setFat(existing.fat || 15);
        setPrepTime(existing.prepTime || 20);
        setServings(existing.servings || 1);
        setIngredientsText(existing.ingredients ? existing.ingredients.join("\n") : "");
        setInstructionsText(existing.instructions ? existing.instructions.join("\n") : "");
        setImageUrl(existing.image || "");
      } else {
        // Reset defaults for add
        setName("");
        const slotToType: Record<string, MealType> = {
          breakfast: "Breakfast",
          lunch: "Lunch",
          snack: "Snacks",
          dinner: "Dinner",
        };
        setMealType(slotToType[editingMeal.slot] || "Lunch");
        setCalories(450);
        setProtein(25);
        setCarbs(45);
        setFat(15);
        setPrepTime(20);
        setServings(1);
        setIngredientsText("");
        setInstructionsText("");
        setImageUrl("");
      }
      setError("");
    }
  }, [editingMeal]);

  if (!editingMeal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a meal name.");
      return;
    }

    const slot = (mealType.toLowerCase() === "snacks" ? "snack" : mealType.toLowerCase()) as any;
    const ingredients = ingredientsText
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    const instructions = instructionsText
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    const mealItem: MealItem = {
      id: editingMeal.meal?.id || `m-custom-${Date.now()}`,
      name: name.trim(),
      type: mealType,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      prepTime: Number(prepTime) || 15,
      servings: Number(servings) || 1,
      completed: editingMeal.meal?.completed || false,
      ingredients: ingredients.length > 0 ? ingredients : ["Custom healthy ingredients"],
      instructions: instructions.length > 0 ? instructions : ["Prepare and enjoy fresh!"],
      image: imageUrl.trim() || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    };

    saveMeal(day, slot, mealItem);
    setEditingMeal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingMeal.meal ? "Edit Meal" : "Add Custom Meal"}
              </h2>
              <p className="text-xs text-slate-500">Plan and balance your custom recipe</p>
            </div>
          </div>
          <button
            onClick={() => setEditingMeal(null)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Day and Slot selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {weeklySchedule.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Meal Slot</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Evening Snack</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Meal / Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grilled Chicken Caesar Salad with Avocado"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Nutrition Numbers (Calories, Protein, Carbs, Fat) */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Nutrition Information
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Calories</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">kcal</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Protein</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="250"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">g</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Carbs</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="400"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">g</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block">Fat</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prep time and Servings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Prep Time (mins)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Serving Size</label>
              <input
                type="number"
                min="1"
                max="10"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ingredients (one per line)
            </label>
            <textarea
              rows={3}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="1 cup quinoa&#10;150g grilled chicken&#10;1 tbsp olive oil"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 font-mono"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Cooking Steps (one per line)
            </label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="1. Sear chicken on medium heat for 6 mins&#10;2. Toss salad with dressing"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL (optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2 text-xs rounded-xl border border-slate-200 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingMeal(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              Save Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
