export type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

export type DietPreference = 
  | "Balanced"
  | "Vegetarian"
  | "Non-Vegetarian"
  | "Pescatarian"
  | "Vegan"
  | "Keto"
  | "High-Protein"
  | "Mediterranean";

export type FitnessGoal = 
  | "Weight Loss"
  | "Weight Gain"
  | "Maintenance"
  | "Lean Muscle"
  | "Endurance";

export type BudgetLevel = "Budget-Friendly" | "Moderate" | "Gourmet";
export type CookingTimePreference = "Quick (<20m)" | "Moderate (20-40m)" | "Elaborate (40m+)";

export interface MealItem {
  id: string;
  name: string;
  type: MealType;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber?: number;   // in grams
  prepTime: number; // in minutes
  servings: number;
  completed: boolean;
  ingredients: string[];
  instructions: string[];
  image?: string;
  tags?: string[];
  difficulty?: "Easy" | "Medium" | "Advanced";
  sourceRecipeId?: string;
}

export interface DayPlan {
  day: string; // Monday, Tuesday, etc.
  date?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterMl?: number;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    snack: MealItem;
    dinner: MealItem;
  };
}

export interface MealPlan {
  id: string;
  title: string;
  summary: string;
  dietaryNotes: string;
  disclaimer: string;
  createdAt: string;
  days: DayPlan[];
}

export type GroceryCategory = 
  | "Vegetables"
  | "Fruits"
  | "Grains"
  | "Dairy"
  | "Protein"
  | "Spices"
  | "Other";

export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  category: GroceryCategory;
  purchased: boolean;
  mealSource?: string;
}

export type ActivityLevel = 
  | "Sedentary" 
  | "Lightly Active" 
  | "Moderately Active" 
  | "Very Active" 
  | "Extremely Active";

export interface UserProfile {
  name: string;
  email?: string;
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  foodPreference: DietPreference;
  fitnessGoal: FitnessGoal;
  calorieTarget: number;
  proteinTarget: number; // g
  carbsTarget: number;   // g
  fatTarget: number;     // g
  waterTargetMl: number;
  allergies: string[];
  favoriteFoods: string[];
  foodsToAvoid: string[];
  mealsPerDay: number;
  budget: BudgetLevel;
  cookingTime: CookingTimePreference;
}

export interface Recipe {
  id: string;
  name: string;
  mealType: MealType;
  dietType: DietPreference[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  prepTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Advanced";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionCard?: {
    type: "add_meal" | "add_grocery" | "recipe_preview";
    data: any;
  };
}

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
}
