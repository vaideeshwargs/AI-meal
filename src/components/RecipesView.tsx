import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { Recipe } from "../types";
import { 
  Search, 
  Clock, 
  Flame, 
  ChefHat, 
  CalendarPlus, 
  Eye, 
  Filter,
  Sparkles,
  BookOpen
} from "lucide-react";

export const RecipesView: React.FC = () => {
  const { recipes, setViewingRecipe } = useMealPlanner();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];
  const tags = ["All", "High-Protein", "Low-Carb", "Vegetarian", "Vegan", "Gluten-Free", "Quick Prep", "Omega-3", "Mediterranean"];

  const filteredRecipes = recipes.filter((recipe) => {
    // Category match
    if (selectedCategory !== "All" && recipe.mealType !== selectedCategory) {
      return false;
    }

    // Tag match
    if (selectedTag !== "All" && !recipe.tags.includes(selectedTag)) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = recipe.name.toLowerCase().includes(q);
      const matchIng = recipe.ingredients.some((i) => i.toLowerCase().includes(q));
      const matchTag = recipe.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchIng && !matchTag) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Recipe Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse nutrient-dense recipes with verified macros, step-by-step instructions, and easy scheduling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
            {filteredRecipes.length} recipes available
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs w-full md:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes or ingredients..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Dietary Tag Badges Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Tags:
          </span>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                selectedTag === t
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Recipes Match</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your category, dietary tag, or search term to discover other meal ideas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Meal Type Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                    {recipe.mealType}
                  </span>

                  {/* Prep Time & Calories overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-300" /> {recipe.prepTime} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {recipe.calories} kcal
                    </span>
                  </div>
                </div>

                {/* Recipe Information */}
                <div className="p-4 space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3
                    onClick={() => setViewingRecipe(recipe)}
                    className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    {recipe.name}
                  </h3>

                  {/* Macro Badges */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-blue-700">P: {recipe.protein}g</span>
                    <span className="font-semibold text-amber-700">C: {recipe.carbs}g</span>
                    <span className="font-semibold text-rose-700">F: {recipe.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingRecipe(recipe)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Recipe
                </button>

                <button
                  onClick={() => setViewingRecipe(recipe)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Schedule this recipe into your plan"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
