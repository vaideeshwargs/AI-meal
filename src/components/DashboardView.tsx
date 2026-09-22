import React from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { MealItem, DayPlan } from "../types";
import { initialWeeklySchedule } from "../data/initialData";
import { 
  Sparkles, 
  Plus, 
  Flame, 
  Dumbbell, 
  Droplet, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChefHat, 
  ChevronRight, 
  ArrowUpRight, 
  Lightbulb, 
  RefreshCw,
  Eye
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const { 
    userProfile, 
    weeklySchedule, 
    selectedDay, 
    setSelectedDay, 
    waterIntakeToday, 
    addWater, 
    setActiveTab, 
    toggleMealCompleted,
    updateMealServings,
    setViewingMeal,
    setEditingMeal
  } = useMealPlanner();

  const todayPlan: DayPlan = weeklySchedule.find((d) => d.day === selectedDay) || weeklySchedule[0] || initialWeeklySchedule[0];

  const defaultMealItem: MealItem = {
    id: "empty",
    name: "Healthy Balanced Meal",
    type: "Lunch",
    calories: 450,
    protein: 25,
    carbs: 45,
    fat: 15,
    prepTime: 20,
    servings: 1,
    completed: false,
    ingredients: ["Fresh produce", "Healthy protein", "Whole grains"],
    instructions: ["Prepare ingredients", "Cook thoroughly", "Enjoy meal"],
  };

  const mealsList = [
    { key: "breakfast", label: "Breakfast", item: todayPlan.meals?.breakfast || { ...defaultMealItem, id: "b", name: "Nutritious Breakfast Bowl", type: "Breakfast" as const } },
    { key: "lunch", label: "Lunch", item: todayPlan.meals?.lunch || { ...defaultMealItem, id: "l", name: "Energizing Lunch Plate", type: "Lunch" as const } },
    { key: "snack", label: "Evening Snack", item: todayPlan.meals?.snack || { ...defaultMealItem, id: "s", name: "High-Protein Snack", type: "Snacks" as const, calories: 220 } },
    { key: "dinner", label: "Dinner", item: todayPlan.meals?.dinner || { ...defaultMealItem, id: "d", name: "Light Recovery Dinner", type: "Dinner" as const, calories: 500 } },
  ];

  // Calculate consumed calories & completed meals
  const completedMeals = mealsList.filter((m) => m.item && m.item.completed);
  const consumedCalories = completedMeals.reduce((sum, m) => sum + (m.item.calories || 0), 0);
  const consumedProtein = completedMeals.reduce((sum, m) => sum + (m.item.protein || 0), 0);
  const consumedCarbs = completedMeals.reduce((sum, m) => sum + (m.item.carbs || 0), 0);
  const consumedFat = completedMeals.reduce((sum, m) => sum + (m.item.fat || 0), 0);

  const plannedCalories = todayPlan.totalCalories || 0;
  const targetCalories = userProfile?.calorieTarget || 2000;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round((waterIntakeToday / (userProfile?.waterTargetMl || 2500)) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* 1. First Section: Welcome message + Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/10">
        {/* Subtle background decoration */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 -bottom-16 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-medium border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Smart Nutrition Engine • {selectedDay}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
              Good day, {userProfile.name}! 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Your customized meal schedule is aligned with your{" "}
              <span className="text-emerald-300 font-semibold">{userProfile.fitnessGoal}</span> goal.
              You have {4 - completedMeals.length} planned meal{4 - completedMeals.length === 1 ? "" : "s"} remaining today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab("planner")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/30 active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Meal Plan
            </button>
            <button
              onClick={() => setEditingMeal({ day: selectedDay, slot: "lunch" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 backdrop-blur-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </button>
          </div>
        </div>
      </div>

      {/* 2. Second Section: Today's Summary Cards (Calories, Protein, Water, Meals Completed) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-heading">
            Today's Nutrition Overview
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Goal: {userProfile.calorieTarget} kcal • {userProfile.proteinTarget}g Protein
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Calories */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calories Consumed</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-heading">{consumedCalories}</span>
              <span className="text-xs text-slate-400 font-medium">/ {targetCalories} kcal</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>{caloriePercent}% consumed</span>
              <span className="font-semibold text-emerald-700">{remainingCalories} kcal left</span>
            </div>
          </div>

          {/* Protein Overview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Protein Intake</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-heading">{consumedProtein}g</span>
              <span className="text-xs text-slate-400 font-medium">/ {userProfile.proteinTarget}g</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((consumedProtein / userProfile.proteinTarget) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Carbs: {consumedCarbs}g</span>
              <span>Fat: {consumedFat}g</span>
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Water Intake</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-sky-500 text-sky-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-heading">
                {(waterIntakeToday / 1000).toFixed(2)}L
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {(userProfile.waterTargetMl / 1000).toFixed(1)}L
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2">
              <span className="text-slate-500">{waterPercent}% of goal</span>
              <button
                onClick={() => addWater(250)}
                className="text-sky-700 font-bold hover:underline cursor-pointer"
              >
                +250ml
              </button>
            </div>
          </div>

          {/* Meals Completed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Meal Progress</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-heading">
                {completedMeals.length} / 4
              </span>
              <span className="text-xs text-slate-400 font-medium">Meals Logged</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedMeals.length / 4) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>{Math.round((completedMeals.length / 4) * 100)}% complete</span>
              <span className="text-emerald-700 font-semibold">
                {completedMeals.length === 4 ? "All Done! 🎉" : "Keep going!"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Third Section: Today's Meal Plan (Breakfast, Lunch, Evening Snack, Dinner) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
              Today's Meal Plan ({selectedDay})
            </h2>
            <p className="text-xs text-slate-500">
              Planned intake: {todayPlan.totalCalories} kcal • {todayPlan.totalProtein}g protein • {todayPlan.totalCarbs}g carbs • {todayPlan.totalFat}g fat
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs overflow-x-auto max-w-full scrollbar-none">
            {weeklySchedule.map((d) => (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d.day)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer ${
                  selectedDay === d.day
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {d.day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {mealsList.map(({ key, label, item }) => (
            <div
              key={key}
              id={`meal-card-${key}`}
              className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                item.completed
                  ? "border-emerald-200 bg-emerald-50/20 shadow-xs"
                  : "border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300"
              }`}
            >
              {/* Card Thumbnail */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Meal Slot Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                    {label}
                  </span>
                </div>

                {/* Completed Checkbox */}
                <button
                  onClick={() => toggleMealCompleted(selectedDay, key as any)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-all ${
                    item.completed
                      ? "bg-emerald-600 text-white ring-2 ring-white"
                      : "bg-slate-900/40 text-white hover:bg-slate-900/60"
                  }`}
                  aria-label={item.completed ? "Mark meal incomplete" : "Mark meal completed"}
                >
                  {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>

                {/* Prep time & Calories Overlay */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-300" /> {item.prepTime}m prep
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {item.calories} kcal
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3
                    onClick={() => setViewingMeal(item)}
                    className={`font-bold text-sm leading-snug cursor-pointer hover:text-emerald-700 transition-colors line-clamp-2 ${
                      item.completed ? "text-slate-600 line-through" : "text-slate-900"
                    }`}
                  >
                    {item.name}
                  </h3>

                  {/* Macro Badges */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-medium">
                    <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                      P: {item.protein}g
                    </span>
                    <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      C: {item.carbs}g
                    </span>
                    <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                      F: {item.fat}g
                    </span>
                  </div>
                </div>

                {/* Serving Size & Quick Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="text-[11px]">Servings:</span>
                    <button
                      onClick={() => updateMealServings(selectedDay, key as any, (item.servings || 1) - 1)}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 px-1">{item.servings || 1}</span>
                    <button
                      onClick={() => updateMealServings(selectedDay, key as any, (item.servings || 1) + 1)}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingMeal(item)}
                      title="View Details"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingMeal({ day: selectedDay, slot: key as any, meal: item })}
                      title="Edit or Replace"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Fourth Section: Weekly Nutrition Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
              Weekly Nutrition Progress
            </h2>
            <p className="text-xs text-slate-500">
              Calorie target consistency across all 7 days of this week
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <div className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span>Planned Calories</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <div className="w-3 h-3 rounded-xs bg-slate-200" />
              <span>Target Baseline</span>
            </div>
          </div>
        </div>

        {/* 7-Day Interactive Progress Bars */}
        <div className="overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-4 pt-6 pb-2 border-b border-slate-100 min-w-[340px]">
            {weeklySchedule.map((d) => {
              const isToday = d.day === selectedDay;
              const heightPercent = Math.min(100, Math.round((d.totalCalories / (userProfile.calorieTarget * 1.2)) * 100));
              const mealsDone = (Object.values(d.meals) as MealItem[]).filter((m) => m.completed).length;

              return (
                <div
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  className={`flex flex-col items-center cursor-pointer group p-1.5 sm:p-2 rounded-2xl transition-all ${
                    isToday ? "bg-emerald-50/70 ring-1 ring-emerald-200" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">
                    {d.totalCalories}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400">kcal</span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[24px] sm:max-w-[28px] h-28 sm:h-32 bg-slate-100 rounded-full my-2 flex items-end p-1 relative">
                    {/* Target reference line indicator */}
                    <div className="absolute top-[20%] left-0 right-0 border-b border-dashed border-slate-300 pointer-events-none" />

                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-emerald-600 to-teal-400"
                          : "bg-emerald-400/80 group-hover:bg-emerald-500"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide mt-1 ${
                      isToday ? "text-emerald-800" : "text-slate-600"
                    }`}
                  >
                    {d.day.substring(0, 3)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                    {mealsDone}/4 meals
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>Target baseline: <strong>{userProfile.calorieTarget} kcal/day</strong></span>
          <button
            onClick={() => setActiveTab("analytics")}
            className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
          >
            View In-Depth Nutrition Analytics <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Fifth Section: AI Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
              AI Smart Recommendations
            </h2>
          </div>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Real-time Nutrition Insights
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              Protein Optimization
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your dinner today delivers 48g lean protein. Perfect for muscle repair after your afternoon workout.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/40 border border-sky-100/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
              <Droplet className="w-4 h-4 text-sky-600" />
              Hydration Pacing
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You're at {(waterIntakeToday / 1000).toFixed(1)}L. Drinking 2 more glasses between 2 PM and 6 PM keeps energy high.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-100/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <Flame className="w-4 h-4 text-amber-600" />
              Fiber & Satiety
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Overnight chia seeds and quinoa provide 22g daily fiber, promoting healthy digestion and sustained blood sugar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 border border-purple-100/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
              <ChefHat className="w-4 h-4 text-purple-600" />
              Meal Prep Tip
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Batch-cook quinoa and slice sweet potatoes tonight to cut tomorrow's prep time down to under 15 minutes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
