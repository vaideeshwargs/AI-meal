import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  X, 
  Clock, 
  Flame, 
  ChefHat, 
  Users, 
  ShoppingCart, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Sparkles,
  Utensils
} from "lucide-react";

export const MealDetailModal: React.FC = () => {
  const { 
    viewingMeal, 
    setViewingMeal, 
    viewingRecipe, 
    setViewingRecipe, 
    addRecipeIngredientsToGrocery,
    toggleMealCompleted,
    updateMealServings,
    setEditingMeal,
    selectedDay,
    addMealToPlan,
    weeklySchedule
  } = useMealPlanner();

  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(selectedDay || "Monday");
  const [selectedSlot, setSelectedSlot] = useState<"breakfast" | "lunch" | "snack" | "dinner">("lunch");
  const [showAddToPlanSuccess, setShowAddToPlanSuccess] = useState(false);

  const activeItem = viewingMeal || viewingRecipe;
  if (!activeItem) return null;

  const isMealItem = "completed" in activeItem;
  const currentServings = (activeItem.servings || 1) * servingMultiplier;
  const scale = currentServings / (activeItem.servings || 1);

  const scaledCalories = Math.round(activeItem.calories * scale);
  const scaledProtein = Math.round(activeItem.protein * scale);
  const scaledCarbs = Math.round(activeItem.carbs * scale);
  const scaledFat = Math.round(activeItem.fat * scale);
  const scaledFiber = activeItem.fiber ? Math.round(activeItem.fiber * scale) : undefined;

  const closeModal = () => {
    setViewingMeal(null);
    setViewingRecipe(null);
    setServingMultiplier(1);
    setShowAddToPlanSuccess(false);
  };

  const handleAddToPlan = () => {
    const mealType = "mealType" in activeItem ? activeItem.mealType : (viewingMeal ? viewingMeal.type : "Lunch");
    const mealToAdd = {
      id: `m-from-rec-${Date.now()}`,
      name: activeItem.name,
      type: mealType as any,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat,
      fiber: scaledFiber,
      prepTime: activeItem.prepTime,
      servings: currentServings,
      completed: false,
      ingredients: activeItem.ingredients,
      instructions: activeItem.instructions,
      image: activeItem.image,
    };
    addMealToPlan(selectedScheduleDay, selectedSlot, mealToAdd);
    setShowAddToPlanSuccess(true);
    setTimeout(() => {
      setShowAddToPlanSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image or Banner */}
        <div className="relative h-48 sm:h-72 w-full bg-slate-900 shrink-0 overflow-hidden">
          {activeItem.image ? (
            <img
              src={activeItem.image}
              alt={activeItem.name}
              className="w-full h-full object-cover object-center brightness-95"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 to-teal-950 text-white">
              <Utensils className="w-16 h-16 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900 transition-colors shadow-md cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header overlay content */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/90 text-white">
                {"mealType" in activeItem ? activeItem.mealType : (activeItem as any).type}
              </span>
              {"difficulty" in activeItem && activeItem.difficulty && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-md text-white">
                  {activeItem.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug line-clamp-2">
              {activeItem.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-slate-800">
          {/* Quick Metrics Bar & Servings Adjuster */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{activeItem.prepTime} mins</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{scaledCalories} kcal</span>
              </div>
            </div>

            {/* Serving Size Adjuster */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Servings:</span>
              <button
                onClick={() => setServingMultiplier(Math.max(1, servingMultiplier - 1))}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Decrease servings"
              >
                -
              </button>
              <span className="text-xs font-bold text-emerald-700 w-5 text-center">
                {currentServings}
              </span>
              <button
                onClick={() => setServingMultiplier(Math.min(6, servingMultiplier + 1))}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Nutrition Information {scale !== 1 && `(${currentServings} Servings)`}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <span className="text-[11px] font-medium text-emerald-700 block">Calories</span>
                <span className="text-lg font-bold text-emerald-900">{scaledCalories}</span>
                <span className="text-[10px] text-emerald-600 block">kcal</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <span className="text-[11px] font-medium text-blue-700 block">Protein</span>
                <span className="text-lg font-bold text-blue-900">{scaledProtein}g</span>
                <span className="text-[10px] text-blue-600 block">Lean Fuel</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <span className="text-[11px] font-medium text-amber-700 block">Carbohydrates</span>
                <span className="text-lg font-bold text-amber-900">{scaledCarbs}g</span>
                <span className="text-[10px] text-amber-600 block">Complex Energy</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
                <span className="text-[11px] font-medium text-rose-700 block">Healthy Fat</span>
                <span className="text-lg font-bold text-rose-900">{scaledFat}g</span>
                <span className="text-[10px] text-rose-600 block">Lipids & Oils</span>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ingredients ({activeItem.ingredients.length})
              </h3>
              <button
                onClick={() => addRecipeIngredientsToGrocery(activeItem)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Grocery List
              </button>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeItem.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-700">{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preparation Steps */}
          {activeItem.instructions && activeItem.instructions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Preparation Steps
              </h3>
              <ol className="space-y-3">
                {activeItem.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <p className="mt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Add to Meal Plan Selector (When viewing a recipe) */}
          {viewingRecipe && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-emerald-600" />
                  Schedule this Recipe into Meal Plan
                </span>
                {showAddToPlanSuccess && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Added successfully!
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Day</label>
                  <select
                    value={selectedScheduleDay}
                    onChange={(e) => setSelectedScheduleDay(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {weeklySchedule.map((d) => (
                      <option key={d.day} value={d.day}>
                        {d.day} ({d.date || ""})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Evening Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddToPlan}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Add to {selectedScheduleDay} {selectedSlot.toUpperCase()}
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          {isMealItem ? (
            <>
              <button
                onClick={() => {
                  const slot = (viewingMeal!.type.toLowerCase() === "snacks" ? "snack" : viewingMeal!.type.toLowerCase()) as any;
                  toggleMealCompleted(selectedDay, slot);
                  setViewingMeal({ ...viewingMeal!, completed: !viewingMeal!.completed });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewingMeal!.completed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                }`}
              >
                {viewingMeal!.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Marked Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" /> Mark as Completed
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  closeModal();
                  const slot = (viewingMeal!.type.toLowerCase() === "snacks" ? "snack" : viewingMeal!.type.toLowerCase()) as any;
                  setEditingMeal({ day: selectedDay, slot, meal: viewingMeal! });
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Meal
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
