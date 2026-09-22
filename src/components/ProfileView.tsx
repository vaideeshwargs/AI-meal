import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  User, 
  Target, 
  Scale, 
  Activity, 
  Flame, 
  Droplet, 
  Save, 
  Calculator, 
  Check, 
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { DietPreference, FitnessGoal, ActivityLevel } from "../types";

export const ProfileView: React.FC = () => {
  const { userProfile, updateUserProfile } = useMealPlanner();

  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age);
  const [gender, setGender] = useState<"male" | "female" | "other">(userProfile.gender);
  const [heightCm, setHeightCm] = useState(userProfile.heightCm);
  const [weightKg, setWeightKg] = useState(userProfile.weightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(userProfile.activityLevel);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(userProfile.fitnessGoal);
  const [foodPreference, setFoodPreference] = useState<DietPreference>(userProfile.foodPreference);
  const [calorieTarget, setCalorieTarget] = useState(userProfile.calorieTarget);
  const [proteinTarget, setProteinTarget] = useState(userProfile.proteinTarget);
  const [waterTargetMl, setWaterTargetMl] = useState(userProfile.waterTargetMl);
  const [favoriteFoodsInput, setFavoriteFoodsInput] = useState(userProfile.favoriteFoods.join(", "));
  const [foodsToAvoidInput, setFoodsToAvoidInput] = useState(userProfile.foodsToAvoid.join(", "));

  // Automated BMR/TDEE Calculator
  const calculateTDEE = () => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === "male") bmr += 5;
    else bmr -= 161;

    // Activity Multiplier
    const multipliers: Record<ActivityLevel, number> = {
      Sedentary: 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725,
      "Extremely Active": 1.9,
    };
    let tdee = Math.round(bmr * (multipliers[activityLevel] || 1.375));

    // Adjust for Goal
    if (fitnessGoal === "Weight Loss") tdee -= 450;
    else if (fitnessGoal === "Weight Gain" || fitnessGoal === "Lean Muscle") tdee += 350;

    const estimatedProtein = Math.round(weightKg * (fitnessGoal === "Lean Muscle" ? 2.0 : 1.6));
    const estimatedWater = Math.round(weightKg * 35); // 35 ml per kg

    setCalorieTarget(tdee);
    setProteinTarget(estimatedProtein);
    setWaterTargetMl(estimatedWater);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel,
      fitnessGoal,
      foodPreference,
      calorieTarget: Number(calorieTarget),
      proteinTarget: Number(proteinTarget),
      waterTargetMl: Number(waterTargetMl),
      favoriteFoods: favoriteFoodsInput.split(",").map((s) => s.trim()).filter(Boolean),
      foodsToAvoid: foodsToAvoidInput.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
            {name[0] || "U"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              User Profile & Metabolic Target
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update your body metrics and dietary preferences to calibrate your AI meal plans
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={calculateTDEE}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          Auto-Calculate Targets
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Biometrics Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            Biometric Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Age (Years)</label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Biological Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Non-Binary</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Current Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6-7 days/week)</option>
                <option value="Extremely Active">Extremely Active (Athletic/Physical)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals & Nutrition Targets */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Fitness Goals & Caloric Baseline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Weight Loss">Weight Loss (Caloric Deficit)</option>
                <option value="Weight Gain">Weight Gain (Clean Surplus)</option>
                <option value="Maintenance">Maintenance (Metabolic Homeostasis)</option>
                <option value="Lean Muscle">Lean Muscle (Hypertrophy & High Protein)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Diet Archetype</label>
              <select
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value as DietPreference)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Balanced">Balanced Whole Foods</option>
                <option value="High-Protein">High-Protein Fitness</option>
                <option value="Vegetarian">Vegetarian (Ovo-Lacto)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Pescatarian">Pescatarian (Fish & Seafood)</option>
                <option value="Vegan">100% Plant-Based Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Daily Calories (kcal)</label>
              <input
                type="number"
                min="1200"
                max="4500"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Daily Protein (grams)</label>
              <input
                type="number"
                min="40"
                max="300"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Water Target (ml)</label>
              <input
                type="number"
                min="1000"
                max="6000"
                step="100"
                value={waterTargetMl}
                onChange={(e) => setWaterTargetMl(Number(e.target.value))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Favorite Foods & Avoidances */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Culinary Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Favorite Foods (comma separated)</label>
              <textarea
                rows={3}
                value={favoriteFoodsInput}
                onChange={(e) => setFavoriteFoodsInput(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Foods to Avoid (comma separated)</label>
              <textarea
                rows={3}
                value={foodsToAvoidInput}
                onChange={(e) => setFoodsToAvoidInput(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Profile & Targets
          </button>
        </div>
      </form>
    </div>
  );
};
