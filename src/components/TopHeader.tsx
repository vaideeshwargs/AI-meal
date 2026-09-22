import React, { useState, useRef, useEffect } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { MealItem } from "../types";
import { 
  Search, 
  Bell, 
  Menu, 
  Droplet, 
  Plus, 
  Sparkles, 
  Utensils, 
  ShoppingCart, 
  BookOpen, 
  Check, 
  X 
} from "lucide-react";

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleMobileSidebar }) => {
  const { 
    userProfile, 
    waterIntakeToday, 
    addWater, 
    searchQuery, 
    setSearchQuery, 
    setActiveTab, 
    recipes, 
    weeklySchedule, 
    groceryList,
    setViewingRecipe,
    setViewingMeal,
    setEditingMeal,
    selectedDay
  } = useMealPlanner();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter search results
  const query = searchQuery.trim().toLowerCase();
  
  const matchedRecipes = query
    ? recipes.filter((r) => 
        r.name.toLowerCase().includes(query) || 
        r.ingredients.some((ing) => ing.toLowerCase().includes(query)) ||
        r.tags.some((t) => t.toLowerCase().includes(query))
      ).slice(0, 3)
    : [];

  const matchedMeals = query
    ? weeklySchedule
        .flatMap((d) => (Object.values(d.meals) as MealItem[]).map((m) => ({ ...m, day: d.day })))
        .filter((m) => m.name.toLowerCase().includes(query))
        .slice(0, 3)
    : [];

  const matchedGrocery = query
    ? groceryList.filter((g) => g.name.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const hasResults = matchedRecipes.length > 0 || matchedMeals.length > 0 || matchedGrocery.length > 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search meals, ingredients, recipes, groceries..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 max-h-96 overflow-y-auto">
              {!hasResults ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No matching meals, recipes, or ingredients found for "{query}".
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedRecipes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1.5">
                        <BookOpen className="w-3 h-3 text-emerald-600" />
                        Recipes
                      </div>
                      {matchedRecipes.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => {
                            setViewingRecipe(r);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={r.image} alt={r.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{r.name}</p>
                              <p className="text-[11px] text-slate-400">{r.calories} kcal • {r.prepTime} min</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium">View Recipe</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedMeals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1.5">
                        <Utensils className="w-3 h-3 text-amber-500" />
                        Planned Meals
                      </div>
                      {matchedMeals.map((m, idx) => (
                        <div
                          key={`${m.id}-${idx}`}
                          onClick={() => {
                            setViewingMeal(m);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{m.name}</p>
                            <p className="text-[11px] text-slate-400">{m.day} • {m.type} • {m.calories} kcal</p>
                          </div>
                          <span className="text-[11px] text-slate-500">Details</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedGrocery.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1.5">
                        <ShoppingCart className="w-3 h-3 text-teal-600" />
                        Grocery Items
                      </div>
                      {matchedGrocery.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => {
                            setActiveTab("grocery");
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <span className="text-xs font-medium text-slate-800">{g.name}</span>
                          <span className="text-[11px] text-slate-400">{g.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Hydration Tracker, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Hydration Tracker */}
        <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl">
          <Droplet className="w-4 h-4 text-sky-500 fill-sky-500 shrink-0" />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-sky-900 block leading-none">
              {(waterIntakeToday / 1000).toFixed(1)}L
            </span>
            <span className="text-[10px] text-sky-600 leading-none">
              / {(userProfile.waterTargetMl / 1000).toFixed(1)}L
            </span>
          </div>
          <button
            onClick={() => addWater(250)}
            title="Drink +250ml water"
            className="ml-1 p-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Notifications */}
        <div ref={notifContainerRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                <span className="text-[11px] text-emerald-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Lunch Time Approaching</p>
                    <p className="text-[11px] text-slate-600">Your planned Lemon Herb Salmon Bowl provides 44g protein.</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">10 mins ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Hydration Reminder</p>
                    <p className="text-[11px] text-slate-600">You are 1,050ml away from your 2.8L daily goal.</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">1 hour ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Grocery Checklist</p>
                    <p className="text-[11px] text-slate-600">Remember to pick up Greek yogurt and Haas avocados.</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <button
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            {userProfile.name[0]}
          </div>
          <span className="hidden md:block text-xs font-semibold text-slate-700">
            {userProfile.name}
          </span>
        </button>
      </div>
    </header>
  );
};
