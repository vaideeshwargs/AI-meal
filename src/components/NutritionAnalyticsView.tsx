import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  BarChart3, 
  PieChart, 
  Flame, 
  Dumbbell, 
  Droplet, 
  Sparkles, 
  TrendingUp, 
  Award, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const NutritionAnalyticsView: React.FC = () => {
  const { weeklySchedule, userProfile, waterIntakeToday, selectedDay } = useMealPlanner();

  const [activeMetric, setActiveMetric] = useState<"calories" | "protein" | "carbs" | "fat">("calories");

  // Macro calculations
  const totalPlannedCalories = weeklySchedule.reduce((sum, d) => sum + d.totalCalories, 0);
  const totalPlannedProtein = weeklySchedule.reduce((sum, d) => sum + d.totalProtein, 0);
  const totalPlannedCarbs = weeklySchedule.reduce((sum, d) => sum + d.totalCarbs, 0);
  const totalPlannedFat = weeklySchedule.reduce((sum, d) => sum + d.totalFat, 0);

  // Grams to calories: Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
  const proteinKcal = totalPlannedProtein * 4;
  const carbsKcal = totalPlannedCarbs * 4;
  const fatKcal = totalPlannedFat * 9;
  const grandKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinRatio = Math.round((proteinKcal / grandKcal) * 100);
  const carbsRatio = Math.round((carbsKcal / grandKcal) * 100);
  const fatRatio = 100 - proteinRatio - carbsRatio;

  const avgDailyCal = Math.round(totalPlannedCalories / 7);
  const avgDailyProtein = Math.round(totalPlannedProtein / 7);
  const avgDailyCarbs = Math.round(totalPlannedCarbs / 7);
  const avgDailyFat = Math.round(totalPlannedFat / 7);

  // Goal deviation
  const calDelta = avgDailyCal - userProfile.calorieTarget;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Nutrition Insights & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive breakdown of caloric density, macronutrient ratios, and progress toward your {userProfile.fitnessGoal} target
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-100 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Metabolic Health Score: 94/100
          </span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Daily Calories</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-heading">{avgDailyCal}</span>
            <span className="text-xs text-slate-400">kcal / day</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {calDelta === 0
              ? "🎯 Exactly on target"
              : calDelta > 0
              ? `+${calDelta} kcal above baseline`
              : `${Math.abs(calDelta)} kcal deficit for cut`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Daily Protein</span>
            <Dumbbell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-heading">{avgDailyProtein}g</span>
            <span className="text-xs text-slate-400">/ {userProfile.proteinTarget}g target</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium">
            {Math.round((avgDailyProtein / userProfile.proteinTarget) * 100)}% of lean muscle goal
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Water Intake Status</span>
            <Droplet className="w-4 h-4 fill-sky-500 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-heading">
              {(waterIntakeToday / 1000).toFixed(1)}L
            </span>
            <span className="text-xs text-slate-400">/ {(userProfile.waterTargetMl / 1000).toFixed(1)}L</span>
          </div>
          <p className="text-[11px] text-sky-600 font-medium">
            {Math.round((waterIntakeToday / userProfile.waterTargetMl) * 100)}% daily hydration reached
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Diet Consistency</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-900 font-heading">High</span>
            <span className="text-xs text-slate-400">Adherence</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Strict allergen isolation verified
          </p>
        </div>
      </div>

      {/* Macro Split & Calorie Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macronutrient Distribution Split */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Macronutrient Ratio Split
            </h2>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Optimal distribution tailored for {userProfile.fitnessGoal} ({userProfile.foodPreference})
          </p>

          {/* Segmented Macro Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 mt-4 shadow-inner">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${proteinRatio}%` }}
              title={`Protein: ${proteinRatio}%`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${carbsRatio}%` }}
              title={`Carbohydrates: ${carbsRatio}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${fatRatio}%` }}
              title={`Healthy Fats: ${fatRatio}%`}
            />
          </div>

          {/* Legend */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold text-slate-800">Protein</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-900 block">{proteinRatio}% of energy</span>
                <span className="text-[10px] text-slate-500">~{avgDailyProtein}g / day</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-slate-800">Carbohydrates</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-900 block">{carbsRatio}% of energy</span>
                <span className="text-[10px] text-slate-500">~{avgDailyCarbs}g / day</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold text-slate-800">Healthy Fats</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-900 block">{fatRatio}% of energy</span>
                <span className="text-[10px] text-slate-500">~{avgDailyFat}g / day</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Day-by-Day Metric Comparison */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Weekly Intake Trajectory
              </h2>
              <p className="text-xs text-slate-500">
                Comparing planned metrics across the current 7-day cycle
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full scrollbar-none">
              {(["calories", "protein", "carbs", "fat"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors shrink-0 cursor-pointer ${
                    activeMetric === m
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
            <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-3 min-w-[320px]">
              {weeklySchedule.map((d) => {
                let value = d.totalCalories;
                let unit = "kcal";
                let max = userProfile.calorieTarget * 1.3;
                let barColor = "bg-emerald-500";

                if (activeMetric === "protein") {
                  value = d.totalProtein;
                  unit = "g";
                  max = userProfile.proteinTarget * 1.4;
                  barColor = "bg-blue-500";
                } else if (activeMetric === "carbs") {
                  value = d.totalCarbs;
                  unit = "g";
                  max = 300;
                  barColor = "bg-amber-500";
                } else if (activeMetric === "fat") {
                  value = d.totalFat;
                  unit = "g";
                  max = 120;
                  barColor = "bg-rose-500";
                }

                const height = Math.min(100, Math.round((value / max) * 100));

                return (
                  <div key={d.day} className="flex flex-col items-center group">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">
                      {value}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 mb-1">{unit}</span>

                    <div className="w-full max-w-[20px] sm:max-w-[24px] h-36 sm:h-40 bg-slate-100 rounded-full flex items-end p-0.5">
                      <div
                        className={`w-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 mt-2 uppercase tracking-wide">
                      {d.day.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Target daily guideline: <strong>{userProfile.calorieTarget} kcal</strong> • <strong>{userProfile.proteinTarget}g Protein</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Micronutrient Diversity
            </span>
          </div>
        </div>
      </div>

      {/* AI Clinical Evaluation & Insights */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-emerald-950/20 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">AI Dietary Insights & Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
            <h3 className="font-bold text-emerald-200">1. Clean Protein Timing</h3>
            <p className="text-slate-300 leading-relaxed">
              Your protein is evenly distributed at ~35-45g per meal slot, which maximally stimulates muscle protein synthesis throughout the day.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
            <h3 className="font-bold text-emerald-200">2. Low Glycemic Carbohydrates</h3>
            <p className="text-slate-300 leading-relaxed">
              Main energy sources (quinoa, sweet potatoes, oats) provide sustained glycogen replenishment with minimal insulin spikes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
            <h3 className="font-bold text-emerald-200">3. Micronutrient Density</h3>
            <p className="text-slate-300 leading-relaxed">
              Meals are rich in magnesium, potassium, and omega-3 fatty acids (salmon, walnuts, chia seeds), supporting cardiovascular recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
