import React from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { MealItem } from "../types";
import {
  LayoutDashboard,
  Sparkles,
  UtensilsCrossed,
  CalendarDays,
  BookOpen,
  ShoppingCart,
  BarChart3,
  BotMessageSquare,
  User,
  Settings,
  Flame,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { activeTab, setActiveTab, userProfile, groceryList, weeklySchedule, selectedDay } = useMealPlanner();

  const currentDayPlan = weeklySchedule.find((d) => d.day === selectedDay) || weeklySchedule[0];
  const completedCount = (Object.values(currentDayPlan?.meals || {}) as MealItem[]).filter((m) => m.completed).length;
  const pendingGroceryCount = groceryList.filter((g) => !g.purchased).length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "planner", label: "AI Meal Planner", icon: Sparkles, badge: "AI" },
    { id: "meals", label: "My Meals", icon: UtensilsCrossed, badge: `${completedCount}/4` },
    { id: "weekly", label: "Weekly Planner", icon: CalendarDays },
    { id: "recipes", label: "Recipes", icon: BookOpen },
    { id: "grocery", label: "Grocery List", icon: ShoppingCart, badge: pendingGroceryCount > 0 ? String(pendingGroceryCount) : undefined },
    { id: "analytics", label: "Nutrition Analytics", icon: BarChart3 },
    { id: "assistant", label: "AI Assistant", icon: BotMessageSquare, badge: "Live" },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick("dashboard")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 font-heading block leading-none">
                AI Smart Meal
              </span>
              <span className="text-[11px] text-emerald-600 font-medium tracking-wide uppercase mt-0.5 block">
                Planner Pro
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      item.badge === "AI" || item.badge === "Live"
                        ? "bg-emerald-100 text-emerald-700 font-semibold"
                        : isActive
                        ? "bg-white text-emerald-800 shadow-xs"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Daily Goal Mini Widget */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-emerald-100/70">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Daily Calorie Goal
            </span>
            <span className="font-bold text-emerald-700">{userProfile.calorieTarget} kcal</span>
          </div>
          <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(((currentDayPlan?.totalCalories || 0) / userProfile.calorieTarget) * 100)
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 text-right">
            Planned: {currentDayPlan?.totalCalories || 0} kcal
          </p>
        </div>

        {/* Profile Footer */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => handleNavClick("profile")}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-emerald-100">
                {userProfile.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{userProfile.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{userProfile.fitnessGoal}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
