import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { MealItem, MealType } from "../types";
import { 
  Plus, 
  Search, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  Eye, 
  Utensils, 
  Filter,
  Users,
  ChevronRight
} from "lucide-react";

export const MealsManagementView: React.FC = () => {
  const { 
    weeklySchedule, 
    selectedDay, 
    setSelectedDay, 
    toggleMealCompleted, 
    updateMealServings, 
    deleteMeal, 
    setViewingMeal, 
    setEditingMeal,
    addToast
  } = useMealPlanner();

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("All");
  const [mealSearch, setMealSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ day: string; slot: any; name: string } | null>(null);

  const currentDayPlan = weeklySchedule.find((d) => d.day === selectedDay) || weeklySchedule[0];

  const defaultSlotMeal = (slot: string, day: string): MealItem => ({
    id: `meal-${slot}-${day.toLowerCase()}`,
    name: "Planned Meal",
    type: (slot === "snack" ? "Snacks" : slot.charAt(0).toUpperCase() + slot.slice(1)) as any,
    calories: 400,
    protein: 20,
    carbs: 40,
    fat: 15,
    prepTime: 15,
    servings: 1,
    completed: false,
    ingredients: [],
    instructions: [],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  });

  const allMealsWithContext = weeklySchedule.flatMap((d) => [
    { day: d.day, slot: "breakfast" as const, meal: d.meals?.breakfast || defaultSlotMeal("breakfast", d.day) },
    { day: d.day, slot: "lunch" as const, meal: d.meals?.lunch || defaultSlotMeal("lunch", d.day) },
    { day: d.day, slot: "snack" as const, meal: d.meals?.snack || defaultSlotMeal("snack", d.day) },
    { day: d.day, slot: "dinner" as const, meal: d.meals?.dinner || defaultSlotMeal("dinner", d.day) },
  ]);

  // Filter based on selected day, slot, and search
  const filteredMeals = allMealsWithContext.filter(({ day, slot, meal }) => {
    // If filtering by specific day:
    if (day !== selectedDay) return false;

    // Filter by type:
    if (activeTypeFilter !== "All") {
      if (activeTypeFilter === "Snacks" && meal.type !== "Snacks") return false;
      if (activeTypeFilter !== "Snacks" && meal.type !== activeTypeFilter) return false;
    }

    // Filter by search:
    if (mealSearch.trim()) {
      const q = mealSearch.toLowerCase();
      const matchName = meal.name.toLowerCase().includes(q);
      const matchIng = meal.ingredients.some((i) => i.toLowerCase().includes(q));
      if (!matchName && !matchIng) return false;
    }

    return true;
  });

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    deleteMeal(confirmDelete.day, confirmDelete.slot);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Meal Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View, customize, scale, and track meals across your daily plans
          </p>
        </div>

        <button
          onClick={() => setEditingMeal({ day: selectedDay, slot: "lunch" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Custom Meal
        </button>
      </div>

      {/* Day Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {weeklySchedule.map((d) => {
          const isSelected = d.day === selectedDay;
          const completed = (Object.values(d.meals) as MealItem[]).filter((m) => m.completed).length;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex-1 min-w-[100px] p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className={`text-xs font-bold block ${isSelected ? "text-white" : "text-slate-800"}`}>
                {d.day}
              </span>
              <span className={`text-[11px] block mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                {d.totalCalories} kcal
              </span>
              <span className={`text-[10px] block mt-1 font-medium ${isSelected ? "text-emerald-200" : "text-emerald-600"}`}>
                {completed}/4 done
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Slot Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs w-full md:w-auto overflow-x-auto">
          {["All", "Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTypeFilter === type
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={mealSearch}
            onChange={(e) => setMealSearch(e.target.value)}
            placeholder="Filter meals or ingredients..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Meals Grid */}
      {filteredMeals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Meals Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No planned meals matched your search filters for {selectedDay}. Try adjusting filters or add a new meal!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeals.map(({ day, slot, meal }) => (
            <div
              key={`${day}-${slot}-${meal.id}`}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                meal.completed ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"}
                  alt={meal.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {meal.type}
                    </span>
                    <button
                      onClick={() => toggleMealCompleted(day, slot)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        meal.completed ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {meal.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" /> Mark Done
                        </>
                      )}
                    </button>
                  </div>

                  <h3
                    onClick={() => setViewingMeal(meal)}
                    className={`font-bold text-sm mt-1.5 hover:text-emerald-700 cursor-pointer line-clamp-1 ${
                      meal.completed ? "line-through text-slate-500" : "text-slate-900"
                    }`}
                  >
                    {meal.name}
                  </h3>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {meal.calories} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {meal.prepTime}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Nutrition badges & Dynamic Serving Scaler */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                    {meal.protein}g Protein
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[11px]">
                    {meal.carbs}g Carbs
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[11px]">
                    {meal.fat}g Fat
                  </span>
                </div>

                {/* Serving Scaler */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Servings:</span>
                  <button
                    onClick={() => updateMealServings(day, slot, (meal.servings || 1) - 1)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer shadow-2xs transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-800 text-xs px-1 min-w-[16px] text-center">{meal.servings || 1}</span>
                  <button
                    onClick={() => updateMealServings(day, slot, (meal.servings || 1) + 1)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer shadow-2xs transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                <button
                  onClick={() => setViewingMeal(meal)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 py-1.5 px-2.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <button
                  onClick={() => setEditingMeal({ day, slot, meal })}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setConfirmDelete({ day, slot, name: meal.name })}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-2.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Remove Meal?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>"{confirmDelete.name}"</strong> from{" "}
              {confirmDelete.day} {confirmDelete.slot}? This will clear the slot.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
