-- ==============================================================================
-- AI Smart Meal Planner - Supabase PostgreSQL Schema Migration
-- Migration: 20260921000000_initial_schema.sql
-- Description: Creates relational tables, foreign keys, check constraints,
--              indexes, and Row Level Security (RLS) policies for the Meal Management System.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER CHECK (age > 0 AND age < 130),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    height_cm NUMERIC CHECK (height_cm > 0),
    weight_kg NUMERIC CHECK (weight_kg > 0),
    activity_level TEXT CHECK (activity_level IN ('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active')),
    food_preference TEXT CHECK (food_preference IN ('Balanced', 'Vegetarian', 'Non-Vegetarian', 'Pescatarian', 'Vegan', 'Keto', 'High-Protein', 'Mediterranean')),
    fitness_goal TEXT CHECK (fitness_goal IN ('Weight Loss', 'Weight Gain', 'Maintenance', 'Lean Muscle', 'Endurance')),
    calorie_target INTEGER NOT NULL DEFAULT 2000 CHECK (calorie_target >= 500 AND calorie_target <= 10000),
    protein_target INTEGER NOT NULL DEFAULT 120 CHECK (protein_target >= 0),
    carbs_target INTEGER NOT NULL DEFAULT 200 CHECK (carbs_target >= 0),
    fat_target INTEGER NOT NULL DEFAULT 60 CHECK (fat_target >= 0),
    water_target_ml INTEGER NOT NULL DEFAULT 2500 CHECK (water_target_ml >= 0),
    allergies TEXT[] DEFAULT '{}',
    favorite_foods TEXT[] DEFAULT '{}',
    foods_to_avoid TEXT[] DEFAULT '{}',
    meals_per_day INTEGER DEFAULT 4 CHECK (meals_per_day >= 1 AND meals_per_day <= 8),
    budget TEXT DEFAULT 'Moderate' CHECK (budget IN ('Budget-Friendly', 'Moderate', 'Gourmet')),
    cooking_time TEXT DEFAULT 'Moderate (20-40m)' CHECK (cooking_time IN ('Quick (<20m)', 'Moderate (20-40m)', 'Elaborate (40m+)')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. RECIPES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    diet_type TEXT[] DEFAULT '{}',
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC NOT NULL CHECK (protein >= 0),
    carbs NUMERIC NOT NULL CHECK (carbs >= 0),
    fat NUMERIC NOT NULL CHECK (fat >= 0),
    fiber NUMERIC DEFAULT 0 CHECK (fiber >= 0),
    prep_time INTEGER NOT NULL DEFAULT 15 CHECK (prep_time >= 0),
    servings INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
    difficulty TEXT DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Advanced')),
    image TEXT,
    tags TEXT[] DEFAULT '{}',
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. WEEKLY SCHEDULES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    date TEXT,
    total_calories INTEGER NOT NULL DEFAULT 0 CHECK (total_calories >= 0),
    total_protein NUMERIC NOT NULL DEFAULT 0 CHECK (total_protein >= 0),
    total_carbs NUMERIC NOT NULL DEFAULT 0 CHECK (total_carbs >= 0),
    total_fat NUMERIC NOT NULL DEFAULT 0 CHECK (total_fat >= 0),
    water_ml INTEGER DEFAULT 0 CHECK (water_ml >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_day UNIQUE(user_id, day)
);

-- ------------------------------------------------------------------------------
-- 4. MEALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meals (
    id TEXT PRIMARY KEY,
    schedule_id UUID NOT NULL REFERENCES public.weekly_schedules(id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'snack', 'dinner')),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein NUMERIC NOT NULL CHECK (protein >= 0),
    carbs NUMERIC NOT NULL CHECK (carbs >= 0),
    fat NUMERIC NOT NULL CHECK (fat >= 0),
    fiber NUMERIC DEFAULT 0 CHECK (fiber >= 0),
    prep_time INTEGER DEFAULT 15 CHECK (prep_time >= 0),
    servings INTEGER DEFAULT 1 CHECK (servings > 0),
    completed BOOLEAN NOT NULL DEFAULT false,
    ingredients TEXT[] DEFAULT '{}',
    instructions TEXT[] DEFAULT '{}',
    image TEXT,
    tags TEXT[] DEFAULT '{}',
    difficulty TEXT,
    source_recipe_id TEXT REFERENCES public.recipes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_schedule_slot UNIQUE(schedule_id, slot)
);

-- ------------------------------------------------------------------------------
-- 5. GROCERY ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grocery_items (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Vegetables', 'Fruits', 'Grains', 'Dairy', 'Protein', 'Spices', 'Other')),
    purchased BOOLEAN NOT NULL DEFAULT false,
    meal_source TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. HYDRATION LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hydration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_ml INTEGER NOT NULL DEFAULT 0 CHECK (amount_ml >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_hydration_date UNIQUE(user_id, date)
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_weekly_schedules_user ON public.weekly_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_schedule ON public.meals(schedule_id);
CREATE INDEX IF NOT EXISTS idx_meals_slot ON public.meals(slot);
CREATE INDEX IF NOT EXISTS idx_grocery_items_user ON public.grocery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_items_purchased ON public.grocery_items(purchased);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON public.recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date ON public.hydration_logs(user_id, date);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated access for web application operations
CREATE POLICY "Allow all read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update user_profiles" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "Allow all delete user_profiles" ON public.user_profiles FOR DELETE USING (true);

CREATE POLICY "Allow all read recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow all insert recipes" ON public.recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update recipes" ON public.recipes FOR UPDATE USING (true);
CREATE POLICY "Allow all delete recipes" ON public.recipes FOR DELETE USING (true);

CREATE POLICY "Allow all read weekly_schedules" ON public.weekly_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert weekly_schedules" ON public.weekly_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update weekly_schedules" ON public.weekly_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete weekly_schedules" ON public.weekly_schedules FOR DELETE USING (true);

CREATE POLICY "Allow all read meals" ON public.meals FOR SELECT USING (true);
CREATE POLICY "Allow all insert meals" ON public.meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update meals" ON public.meals FOR UPDATE USING (true);
CREATE POLICY "Allow all delete meals" ON public.meals FOR DELETE USING (true);

CREATE POLICY "Allow all read grocery_items" ON public.grocery_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert grocery_items" ON public.grocery_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update grocery_items" ON public.grocery_items FOR UPDATE USING (true);
CREATE POLICY "Allow all delete grocery_items" ON public.grocery_items FOR DELETE USING (true);

CREATE POLICY "Allow all read hydration_logs" ON public.hydration_logs FOR SELECT USING (true);
CREATE POLICY "Allow all insert hydration_logs" ON public.hydration_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update hydration_logs" ON public.hydration_logs FOR UPDATE USING (true);
CREATE POLICY "Allow all delete hydration_logs" ON public.hydration_logs FOR DELETE USING (true);
