import React, { useState, useEffect } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  Settings, 
  Bell, 
  Database, 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  Sliders, 
  Check, 
  AlertTriangle,
  Server,
  RefreshCw,
  Layers,
  ArrowRight,
  Copy,
  ExternalLink,
  Code
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const { resetAllData, userProfile, weeklySchedule, groceryList, addToast } = useMealPlanner();

  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  const [mealReminders, setMealReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [aiStrictAllergens, setAiStrictAllergens] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Database / Supabase state
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string; message: string } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationReport, setMigrationReport] = useState<any>(null);
  const [copyingSql, setCopyingSql] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const fetchDbStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/db/status");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleCopySchemaSql = async () => {
    setCopyingSql(true);
    try {
      const res = await fetch("/api/db/schema");
      const data = await res.json();
      if (data.sql) {
        await navigator.clipboard.writeText(data.sql);
        setSqlCopied(true);
        addToast("success", "SQL Copied to Clipboard", "Paste into your Supabase SQL Editor and click 'Run'");
        setTimeout(() => setSqlCopied(false), 4000);
      }
    } catch (err: any) {
      addToast("error", "Failed to Copy SQL", err.message || "Could not read schema");
    } finally {
      setCopyingSql(false);
    }
  };

  const handleRunMigration = async () => {
    setMigrating(true);
    setMigrationReport(null);
    try {
      const res = await fetch("/api/db/migrate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMigrationReport(data.report);
        addToast("success", "Supabase Migration Complete", "All profiles, recipes, schedules, and groceries migrated!");
        fetchDbStatus();
      } else {
        addToast("error", "Migration Failed", data.error || "Could not complete Supabase migration.");
      }
    } catch (err: any) {
      addToast("error", "Migration Request Error", err.message || "Failed to reach server.");
    } finally {
      setMigrating(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: userProfile,
      schedule: weeklySchedule,
      groceries: groceryList,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-smart-meal-planner-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Data Exported", "Downloaded your weekly meal plans and profile settings.");
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage system preferences, notifications, unit systems, and data storage
        </p>
      </div>

      {/* Measurement Units */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Measurement Units</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setUnitSystem("metric")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              unitSystem === "metric"
                ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Metric System</span>
              {unitSystem === "metric" && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Grams (g), Milliliters (ml), Kilograms (kg), Centimeters (cm)</p>
          </button>

          <button
            onClick={() => setUnitSystem("imperial")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              unitSystem === "imperial"
                ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Imperial System</span>
              {unitSystem === "imperial" && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ounces (oz), Fluid Oz (fl oz), Pounds (lbs), Inches (in)</p>
          </button>
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Notifications & Intelligent Alerts</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Meal Timing Prompts</span>
              <span className="text-[11px] text-slate-500">Receive timely meal reminders for breakfast, lunch, and dinner</span>
            </div>
            <input
              type="checkbox"
              checked={mealReminders}
              onChange={(e) => setMealReminders(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Daily Hydration Check-ins</span>
              <span className="text-[11px] text-slate-500">Pacing alerts every 2-3 hours to reach your water target</span>
            </div>
            <input
              type="checkbox"
              checked={waterReminders}
              onChange={(e) => setWaterReminders(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Strict AI Allergen Protection</span>
              <span className="text-[11px] text-slate-500">Strictly forbid generation of ingredients matching your allergen list</span>
            </div>
            <input
              type="checkbox"
              checked={aiStrictAllergens}
              onChange={(e) => setAiStrictAllergens(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
          </label>
        </div>
      </div>

      {/* Supabase PostgreSQL Database Integration */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Supabase PostgreSQL Database</h2>
          </div>
          <button
            onClick={fetchDbStatus}
            disabled={loadingStatus}
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.connected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-xs font-bold text-slate-800">
                Mode: {dbStatus?.mode === "supabase_postgresql" ? "Connected (Supabase PostgreSQL)" : "Local In-Memory / Standby"}
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono font-medium">
              Schema v20260921
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {dbStatus?.message || "Checking database connection..."}
          </p>

          <div className="pt-2 border-t border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Relational PostgreSQL Tables</span>
            <div className="flex flex-wrap gap-1.5">
              {["user_profiles", "recipes", "weekly_schedules", "meals", "grocery_items", "hydration_logs"].map((tbl) => (
                <span key={tbl} className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono">
                  {tbl}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200/70">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySchemaSql}
                disabled={copyingSql}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {sqlCopied ? "SQL Copied!" : "1. Copy Schema SQL"}
              </button>
              <button
                onClick={handleRunMigration}
                disabled={migrating}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${migrating ? "animate-spin" : ""}`} />
                {migrating ? "Migrating Data..." : "2. Run Migration to Supabase"}
              </button>
            </div>
            <div className="text-[11px] text-slate-500 text-right">
              Project: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">xtshfbjevkazwtzfscxa</code>
            </div>
          </div>

          {migrationReport && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                Migration Succeeded Without Data Loss:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div>• Profile: <strong>{migrationReport.userProfileMigrated}</strong></div>
                <div>• Recipes: <strong>{migrationReport.recipesMigrated}</strong></div>
                <div>• Schedules: <strong>{migrationReport.schedulesMigrated}</strong></div>
                <div>• Meals: <strong>{migrationReport.mealsMigrated}</strong></div>
                <div>• Groceries: <strong>{migrationReport.groceriesMigrated}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Backup & Storage Management</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Export Meal Plan & Settings</span>
            <span className="text-[11px] text-slate-500">Download your schedule, custom meals, and profile as JSON</span>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
          <div>
            <span className="text-xs font-bold text-rose-900 block">Reset Application Data</span>
            <span className="text-[11px] text-rose-600">Reverts all scheduled meals, groceries, and profiles back to defaults</span>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reset All Meal Data?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will restore default sample plans, clear your grocery checkmarks, and reset your daily hydration tracker.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
