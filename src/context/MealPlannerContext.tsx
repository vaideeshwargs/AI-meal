import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  UserProfile, 
  DayPlan, 
  Recipe, 
  GroceryItem, 
  MealItem, 
  MealType, 
  ToastMessage 
} from "../types";
import { 
  initialUserProfile, 
  initialWeeklySchedule, 
  sampleRecipes, 
  initialGroceryList 
} from "../data/initialData";

interface MealPlannerContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  weeklySchedule: DayPlan[];
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  recipes: Recipe[];
  groceryList: GroceryItem[];
  waterIntakeToday: number;
  addWater: (ml: number) => void;
  resetWater: () => void;
  toasts: ToastMessage[];
  addToast: (type: "success" | "info" | "warning" | "error", title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Meal Actions
  toggleMealCompleted: (day: string, slot: "breakfast" | "lunch" | "snack" | "dinner") => void;
  updateMealServings: (day: string, slot: "breakfast" | "lunch" | "snack" | "dinner", servings: number) => void;
  deleteMeal: (day: string, slot: "breakfast" | "lunch" | "snack" | "dinner") => void;
  saveMeal: (day: string, slot: "breakfast" | "lunch" | "snack" | "dinner", meal: MealItem) => void;
  addMealToPlan: (day: string, slot: "breakfast" | "lunch" | "snack" | "dinner", meal: MealItem) => void;
  applyNewPlan: (days: DayPlan[]) => void;

  // Grocery Actions
  toggleGroceryItem: (id: string) => void;
  addGroceryItem: (item: Omit<GroceryItem, "id">) => void;
  removeGroceryItem: (id: string) => void;
  clearPurchasedGrocery: () => void;
  syncGroceryWithPlan: () => void;
  addRecipeIngredientsToGrocery: (recipe: Recipe | MealItem) => void;

  // Global Navigation & Modals
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewingMeal: MealItem | null;
  setViewingMeal: (meal: MealItem | null) => void;
  viewingRecipe: Recipe | null;
  setViewingRecipe: (recipe: Recipe | null) => void;
  editingMeal: { day: string; slot: "breakfast" | "lunch" | "snack" | "dinner"; meal?: MealItem } | null;
  setEditingMeal: (data: { day: string; slot: "breakfast" | "lunch" | "snack" | "dinner"; meal?: MealItem } | null) => void;

  // Reset to defaults
  resetAllData: () => void;
}

const MealPlannerContext = createContext<MealPlannerContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: "ai_smart_meal_profile_v1",
  SCHEDULE: "ai_smart_meal_schedule_v1",
  GROCERY: "ai_smart_meal_grocery_v1",
  WATER: "ai_smart_meal_water_v1",
};

export const MealPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  // Helper to ensure each day has all 4 valid slots
  const normalizeSchedule = (rawSchedule: DayPlan[]): DayPlan[] => {
    return rawSchedule.map((dayPlan) => {
      const defaultDay = initialWeeklySchedule.find((d) => d.day === dayPlan.day) || initialWeeklySchedule[0];
      return {
        ...dayPlan,
        meals: {
          breakfast: dayPlan.meals?.breakfast || defaultDay.meals.breakfast,
          lunch: dayPlan.meals?.lunch || defaultDay.meals.lunch,
          snack: dayPlan.meals?.snack || defaultDay.meals.snack,
          dinner: dayPlan.meals?.dinner || defaultDay.meals.dinner,
        },
      };
    });
  };

  // 2. Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState<DayPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeSchedule(parsed);
        }
      }
      return initialWeeklySchedule;
    } catch {
      return initialWeeklySchedule;
    }
  });

  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  // 3. Recipes Database
  const [recipes] = useState<Recipe[]>(sampleRecipes);

  // 4. Grocery List State
  const [groceryList, setGroceryList] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GROCERY);
      return saved ? JSON.parse(saved) : initialGroceryList;
    } catch {
      return initialGroceryList;
    }
  });

  // 5. Water Tracker
  const [waterIntakeToday, setWaterIntakeToday] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      return saved ? Number(saved) : 1750;
    } catch {
      return 1750;
    }
  });

  // 6. Notifications / Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 7. Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingMeal, setViewingMeal] = useState<MealItem | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [editingMeal, setEditingMeal] = useState<{ day: string; slot: "breakfast" | "lunch" | "snack" | "dinner"; meal?: MealItem } | null>(null);

  // Load from backend / Supabase on mount
  useEffect(() => {
    let mounted = true;
    const fetchBackendData = async () => {
      try {
        const [profileRes, scheduleRes, groceryRes] = await Promise.allSettled([
          fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/schedule").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/grocery").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (!mounted) return;

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setUserProfile(profileRes.value);
        }
        if (scheduleRes.status === "fulfilled" && Array.isArray(scheduleRes.value) && scheduleRes.value.length > 0) {
          setWeeklySchedule(normalizeSchedule(scheduleRes.value));
        }
        if (groceryRes.status === "fulfilled" && Array.isArray(groceryRes.value) && groceryRes.value.length > 0) {
          setGroceryList(groceryRes.value);
        }
      } catch (err) {
        console.warn("Backend data fetch fallback to local cache:", err);
      }
    };

    fetchBackendData();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-persist to localStorage and background sync to backend
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile),
      }).catch((e) => console.warn("Background profile sync:", e));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(weeklySchedule));
      fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weeklySchedule),
      }).catch((e) => console.warn("Background schedule sync:", e));
    } catch (e) {
      console.error(e);
    }
  }, [weeklySchedule]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(groceryList));
      fetch("/api/grocery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groceryList),
      }).catch((e) => console.warn("Background grocery sync:", e));
    } catch (e) {
      console.error(e);
    }
  }, [groceryList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER, String(waterIntakeToday));
    } catch (e) {
      console.error(e);
    }
  }, [waterIntakeToday]);

  const addToast = (type: "success" | "info" | "warning" | "error", title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    addToast("success", "Profile Updated", "Your dietary preferences and goals have been saved.");
  };

  const addWater = (ml: number) => {
    setWaterIntakeToday((prev) => {
      const next = Math.max(0, prev + ml);
      if (next >= userProfile.waterTargetMl && prev < userProfile.waterTargetMl) {
        addToast("success", "Hydration Goal Achieved!", `You reached your daily goal of ${(userProfile.waterTargetMl / 1000).toFixed(1)}L!`);
      }
      return next;
    });
  };

  const resetWater = () => {
    setWaterIntakeToday(0);
    addToast("info", "Water Tracker Reset", "Daily water intake restarted from 0 ml.");
  };

  const recalculateDayTotals = (day: DayPlan): DayPlan => {
    const meals = Object.values(day.meals) as MealItem[];
    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);
    return {
      ...day,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  };

  const toggleMealCompleted = (dayName: string, slot: "breakfast" | "lunch" | "snack" | "dinner") => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const currentStatus = d.meals[slot].completed;
          const updated = {
            ...d,
            meals: {
              ...d.meals,
              [slot]: {
                ...d.meals[slot],
                completed: !currentStatus,
              },
            },
          };
          if (!currentStatus) {
            addToast("success", "Meal Completed!", `Checked off ${d.meals[slot].name} for ${dayName}.`);
          }
          return updated;
        }
        return d;
      })
    );
  };

  const updateMealServings = (dayName: string, slot: "breakfast" | "lunch" | "snack" | "dinner", servings: number) => {
    if (servings < 1 || servings > 8) return;
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const meal = d.meals[slot];
          const oldServings = meal.servings || 1;
          const factor = servings / oldServings;
          const updatedMeal: MealItem = {
            ...meal,
            servings,
            calories: Math.round(meal.calories * factor),
            protein: Math.round(meal.protein * factor),
            carbs: Math.round(meal.carbs * factor),
            fat: Math.round(meal.fat * factor),
          };
          const updatedDay = {
            ...d,
            meals: {
              ...d.meals,
              [slot]: updatedMeal,
            },
          };
          return recalculateDayTotals(updatedDay);
        }
        return d;
      })
    );
    addToast("info", "Serving Scaled", `Updated to ${servings} serving${servings > 1 ? "s" : ""}. Macros adjusted dynamically.`);
  };

  const deleteMeal = (dayName: string, slot: "breakfast" | "lunch" | "snack" | "dinner") => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const slotNames: Record<string, MealType> = {
            breakfast: "Breakfast",
            lunch: "Lunch",
            snack: "Snacks",
            dinner: "Dinner",
          };
          const placeholderMeal: MealItem = {
            id: `empty-${Date.now()}`,
            name: `Planned ${slotNames[slot]}`,
            type: slotNames[slot],
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            prepTime: 0,
            servings: 1,
            completed: false,
            ingredients: [],
            instructions: [],
          };
          const updatedDay = {
            ...d,
            meals: {
              ...d.meals,
              [slot]: placeholderMeal,
            },
          };
          return recalculateDayTotals(updatedDay);
        }
        return d;
      })
    );
    addToast("warning", "Meal Removed", `Cleared ${slot} slot for ${dayName}.`);
  };

  const saveMeal = (dayName: string, slot: "breakfast" | "lunch" | "snack" | "dinner", meal: MealItem) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const updatedDay = {
            ...d,
            meals: {
              ...d.meals,
              [slot]: meal,
            },
          };
          return recalculateDayTotals(updatedDay);
        }
        return d;
      })
    );
    addToast("success", "Meal Saved", `${meal.name} saved for ${dayName} ${slot}.`);
  };

  const addMealToPlan = (dayName: string, slot: "breakfast" | "lunch" | "snack" | "dinner", meal: MealItem) => {
    saveMeal(dayName, slot, meal);
  };

  const applyNewPlan = (newDays: DayPlan[]) => {
    setWeeklySchedule(newDays);
    addToast("success", "New Plan Applied", "Your weekly meal schedule has been refreshed with AI suggestions!");
  };

  // Grocery List Handlers
  const toggleGroceryItem = (id: string) => {
    setGroceryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const addGroceryItem = (item: Omit<GroceryItem, "id">) => {
    const newItem: GroceryItem = {
      ...item,
      id: `g-custom-${Date.now()}`,
    };
    setGroceryList((prev) => [newItem, ...prev]);
    addToast("success", "Item Added", `Added "${item.name}" to ${item.category}.`);
  };

  const removeGroceryItem = (id: string) => {
    setGroceryList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearPurchasedGrocery = () => {
    setGroceryList((prev) => prev.filter((item) => !item.purchased));
    addToast("info", "List Cleared", "Removed all purchased items from your list.");
  };

  const addRecipeIngredientsToGrocery = (recipe: Recipe | MealItem) => {
    const newItems: GroceryItem[] = (recipe.ingredients || []).map((ing, idx) => {
      let category: GroceryItem["category"] = "Other";
      const lower = ing.toLowerCase();
      if (lower.includes("spinach") || lower.includes("avocado") || lower.includes("tomato") || lower.includes("cucumber") || lower.includes("pepper") || lower.includes("zucchini") || lower.includes("kale") || lower.includes("bok choy") || lower.includes("asparagus") || lower.includes("potato")) {
        category = "Vegetables";
      } else if (lower.includes("berry") || lower.includes("apple") || lower.includes("lemon") || lower.includes("date") || lower.includes("banana")) {
        category = "Fruits";
      } else if (lower.includes("quinoa") || lower.includes("oat") || lower.includes("bread") || lower.includes("soba") || lower.includes("rice")) {
        category = "Grains";
      } else if (lower.includes("yogurt") || lower.includes("milk") || lower.includes("cheese") || lower.includes("feta")) {
        category = "Dairy";
      } else if (lower.includes("salmon") || lower.includes("chicken") || lower.includes("egg") || lower.includes("tofu") || lower.includes("chickpea") || lower.includes("steak")) {
        category = "Protein";
      } else if (lower.includes("oil") || lower.includes("salt") || lower.includes("pepper") || lower.includes("oregano") || lower.includes("cumin") || lower.includes("paprika") || lower.includes("garlic")) {
        category = "Spices";
      }

      return {
        id: `g-auto-${Date.now()}-${idx}`,
        name: ing,
        amount: "1 portion",
        category,
        purchased: false,
        mealSource: recipe.name,
      };
    });

    setGroceryList((prev) => [...newItems, ...prev]);
    addToast("success", "Ingredients Added", `Added ${newItems.length} ingredients from "${recipe.name}" to your grocery list!`);
  };

  const syncGroceryWithPlan = () => {
    const ingredientsMap = new Map<string, { name: string; meal: string }>();
    weeklySchedule.forEach((d) => {
      (Object.values(d.meals) as MealItem[]).forEach((m) => {
        if (m.ingredients) {
          m.ingredients.forEach((ing) => {
            ingredientsMap.set(ing.trim().toLowerCase(), { name: ing, meal: m.name });
          });
        }
      });
    });

    const generated: GroceryItem[] = [];
    let idx = 0;
    ingredientsMap.forEach((val) => {
      let category: GroceryItem["category"] = "Other";
      const lower = val.name.toLowerCase();
      if (lower.includes("spinach") || lower.includes("avocado") || lower.includes("tomato") || lower.includes("cucumber") || lower.includes("pepper") || lower.includes("zucchini") || lower.includes("kale") || lower.includes("bok choy") || lower.includes("asparagus") || lower.includes("potato")) {
        category = "Vegetables";
      } else if (lower.includes("berry") || lower.includes("apple") || lower.includes("lemon") || lower.includes("date") || lower.includes("banana")) {
        category = "Fruits";
      } else if (lower.includes("quinoa") || lower.includes("oat") || lower.includes("bread") || lower.includes("soba") || lower.includes("rice")) {
        category = "Grains";
      } else if (lower.includes("yogurt") || lower.includes("milk") || lower.includes("cheese") || lower.includes("feta")) {
        category = "Dairy";
      } else if (lower.includes("salmon") || lower.includes("chicken") || lower.includes("egg") || lower.includes("tofu") || lower.includes("chickpea") || lower.includes("steak")) {
        category = "Protein";
      } else if (lower.includes("oil") || lower.includes("salt") || lower.includes("pepper") || lower.includes("oregano") || lower.includes("cumin") || lower.includes("paprika") || lower.includes("garlic")) {
        category = "Spices";
      }

      generated.push({
        id: `g-sync-${Date.now()}-${idx++}`,
        name: val.name,
        amount: "Per plan",
        category,
        purchased: false,
        mealSource: val.meal,
      });
    });

    setGroceryList(generated);
    addToast("success", "Grocery List Synchronized", `Generated ${generated.length} grocery items from all 7 days of your meal plan!`);
  };

  const resetAllData = () => {
    localStorage.clear();
    setUserProfile(initialUserProfile);
    setWeeklySchedule(initialWeeklySchedule);
    setGroceryList(initialGroceryList);
    setWaterIntakeToday(1750);
    setSelectedDay("Monday");
    addToast("info", "Data Reset", "Restored standard sample data and recipes.");
  };

  return (
    <MealPlannerContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        weeklySchedule,
        selectedDay,
        setSelectedDay,
        recipes,
        groceryList,
        waterIntakeToday,
        addWater,
        resetWater,
        toasts,
        addToast,
        removeToast,
        toggleMealCompleted,
        updateMealServings,
        deleteMeal,
        saveMeal,
        addMealToPlan,
        applyNewPlan,
        toggleGroceryItem,
        addGroceryItem,
        removeGroceryItem,
        clearPurchasedGrocery,
        syncGroceryWithPlan,
        addRecipeIngredientsToGrocery,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        viewingMeal,
        setViewingMeal,
        viewingRecipe,
        setViewingRecipe,
        editingMeal,
        setEditingMeal,
        resetAllData,
      }}
    >
      {children}
    </MealPlannerContext.Provider>
  );
};

export const useMealPlanner = () => {
  const context = useContext(MealPlannerContext);
  if (!context) {
    throw new Error("useMealPlanner must be used within a MealPlannerProvider");
  }
  return context;
};
