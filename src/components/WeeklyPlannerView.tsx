import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  CalendarDays, 
  Printer, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ArrowRightLeft,
  Eye,
  Plus
} from "lucide-react";
import { MealItem } from "../types";

export const WeeklyPlannerView: React.FC = () => {
  const { 
    weeklySchedule, 
    selectedDay, 
    setSelectedDay, 
    setViewingMeal, 
    setEditingMeal,
    saveMeal,
    addToast,
    userProfile 
  } = useMealPlanner();

  const [replacingSlot, setReplacingSlot] = useState<{ day: string; slot: "breakfast" | "lunch" | "snack" | "dinner" } | null>(null);
  const [isAiReplacing, setIsAiReplacing] = useState(false);

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    [selectedDay]: true,
  });

  const toggleDayExpanded = (day: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Compute Weekly Totals & Averages
  const totalWeeklyCalories = weeklySchedule.reduce((sum, d) => sum + d.totalCalories, 0);
  const avgDailyCalories = Math.round(totalWeeklyCalories / 7);
  const totalWeeklyProtein = weeklySchedule.reduce((sum, d) => sum + d.totalProtein, 0);
  const totalWeeklyCarbs = weeklySchedule.reduce((sum, d) => sum + d.totalCarbs, 0);
  const totalWeeklyFat = weeklySchedule.reduce((sum, d) => sum + d.totalFat, 0);
  const completedMealsCount = weeklySchedule.reduce(
    (sum, d) => sum + (Object.values(d.meals) as MealItem[]).filter((m) => m.completed).length,
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const handleAiSwapMeal = async (dayName: string, slot: "breakfast" | "lunch" | "snack" | "dinner", currentMeal: MealItem) => {
    setIsAiReplacing(true);
    setReplacingSlot({ day: dayName, slot });

    try {
      const response = await fetch("/api/ai/replace-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentMealName: currentMeal.name,
          mealType: currentMeal.type,
          dietPreference: userProfile.foodPreference,
          targetCalories: currentMeal.calories,
          allergies: userProfile.allergies.join(", "),
        }),
      });

      const data = await response.json();
      if (data.meal) {
        saveMeal(dayName, slot, data.meal);
        addToast("success", "Meal Swapped!", `Replaced with "${data.meal.name}".`);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Replacement Failed", "Could not fetch AI swap suggestion. Please retry.");
    } finally {
      setIsAiReplacing(false);
      setReplacingSlot(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Weekly Meal Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Full 7-day culinary roadmap with dynamic macro balancing and smart replacements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Weekly Plan
          </button>
        </div>
      </div>

      {/* Weekly High-Level Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Avg. Daily Energy
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 font-heading">{avgDailyCalories}</span>
            <span className="text-xs text-slate-400">kcal/day</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Target: {userProfile.calorieTarget} kcal
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Weekly Protein
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-blue-900 font-heading">{totalWeeklyProtein}</span>
            <span className="text-xs text-slate-400">grams total</span>
          </div>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            ~{Math.round(totalWeeklyProtein / 7)}g / day
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Carbohydrates
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-amber-900 font-heading">{totalWeeklyCarbs}</span>
            <span className="text-xs text-slate-400">grams total</span>
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            ~{Math.round(totalWeeklyCarbs / 7)}g / day
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Plan Adherence
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-900 font-heading">{completedMealsCount}</span>
            <span className="text-xs text-slate-400">/ 28 meals</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {Math.round((completedMealsCount / 28) * 100)}% logged this week
          </span>
        </div>
      </div>

      {/* Mobile-Friendly Day Quick Jump Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Jump to:
        </span>
        {weeklySchedule.map((d) => {
          const isCurrent = d.day === selectedDay;
          return (
            <button
              key={d.day}
              onClick={() => {
                setSelectedDay(d.day);
                setExpandedDays((prev) => ({ ...prev, [d.day]: true }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isCurrent
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d.day}
            </button>
          );
        })}
      </div>

      {/* 7 Days Schedule Accordion / Grid */}
      <div className="space-y-4">
        {weeklySchedule.map((dayPlan) => {
          const isSelected = dayPlan.day === selectedDay;
          const isExpanded = expandedDays[dayPlan.day] ?? isSelected;
          const defaultMeal = {
            id: `fallback-${dayPlan.day}`,
            name: "Planned Meal",
            type: "Lunch" as const,
            calories: 450,
            protein: 25,
            carbs: 45,
            fat: 15,
            prepTime: 20,
            servings: 1,
            completed: false,
            ingredients: [],
            instructions: [],
          };
          const slots: Array<{ key: "breakfast" | "lunch" | "snack" | "dinner"; label: string; meal: MealItem }> = [
            { key: "breakfast", label: "Breakfast", meal: dayPlan.meals?.breakfast || { ...defaultMeal, id: `${dayPlan.day}-b`, type: "Breakfast" as const } },
            { key: "lunch", label: "Lunch", meal: dayPlan.meals?.lunch || { ...defaultMeal, id: `${dayPlan.day}-l`, type: "Lunch" as const } },
            { key: "snack", label: "Evening Snack", meal: dayPlan.meals?.snack || { ...defaultMeal, id: `${dayPlan.day}-s`, type: "Snacks" as const } },
            { key: "dinner", label: "Dinner", meal: dayPlan.meals?.dinner || { ...defaultMeal, id: `${dayPlan.day}-d`, type: "Dinner" as const } },
          ];

          return (
            <div
              key={dayPlan.day}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isSelected
                  ? "border-emerald-300 ring-2 ring-emerald-500/10 shadow-sm"
                  : "border-slate-200/90 shadow-xs hover:border-slate-300"
              }`}
            >
              {/* Day Card Header */}
              <div
                onClick={() => {
                  setSelectedDay(dayPlan.day);
                  toggleDayExpanded(dayPlan.day);
                }}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {dayPlan.day.substring(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {dayPlan.day}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                      <span>Total: <strong className="text-slate-800">{dayPlan.totalCalories} kcal</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>{dayPlan.totalProtein}g protein</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{dayPlan.totalCarbs}g carbs</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{dayPlan.totalFat}g fat</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                    {(Object.values(dayPlan.meals) as MealItem[]).filter((m) => m.completed).length}/4 completed
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-transform duration-200 ${
                      isExpanded ? "rotate-90 text-emerald-600" : ""
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 4 Meal Slots Grid */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {slots.map(({ key, label, meal }) => {
                      const isReplacingCurrent =
                        isAiReplacing &&
                        replacingSlot?.day === dayPlan.day &&
                        replacingSlot?.slot === key;

                      return (
                        <div
                          key={key}
                          className={`bg-white p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            meal.completed
                              ? "border-emerald-200 bg-emerald-50/20"
                              : "border-slate-200/80 hover:shadow-xs"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              <span>{label}</span>
                              {meal.completed && (
                                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> Done
                                </span>
                              )}
                            </div>

                            <h4
                              onClick={() => setViewingMeal(meal)}
                              className={`font-bold text-xs leading-snug cursor-pointer hover:text-emerald-700 transition-colors line-clamp-2 ${
                                meal.completed ? "line-through text-slate-500" : "text-slate-900"
                              }`}
                            >
                              {meal.name}
                            </h4>

                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                              <span className="font-semibold text-amber-600 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> {meal.calories} kcal
                              </span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">
                                {meal.protein}g P
                              </span>
                            </div>
                          </div>

                          {/* Actions with touch-friendly padding */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                              onClick={() => setViewingMeal(meal)}
                              className="text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium text-[11px] py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAiSwapMeal(dayPlan.day, key, meal)}
                                disabled={isAiReplacing}
                                title="AI Swap Meal"
                                className="min-h-[32px] px-2 py-1 rounded-lg text-emerald-700 hover:bg-emerald-50 text-[11px] flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                <Sparkles className={`w-3.5 h-3.5 ${isReplacingCurrent ? "animate-spin" : ""}`} />
                                Swap
                              </button>
                              <button
                                onClick={() => setEditingMeal({ day: dayPlan.day, slot: key, meal })}
                                title="Edit Slot"
                                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
