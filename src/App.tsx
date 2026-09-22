import React, { useState } from "react";
import { MealPlannerProvider, useMealPlanner } from "./context/MealPlannerContext";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { DashboardView } from "./components/DashboardView";
import { AiPlannerView } from "./components/AiPlannerView";
import { MealsManagementView } from "./components/MealsManagementView";
import { WeeklyPlannerView } from "./components/WeeklyPlannerView";
import { RecipesView } from "./components/RecipesView";
import { GroceryListView } from "./components/GroceryListView";
import { NutritionAnalyticsView } from "./components/NutritionAnalyticsView";
import { ProfileView } from "./components/ProfileView";
import { SettingsView } from "./components/SettingsView";
import { AiChatbot } from "./components/AiChatbot";
import { MealDetailModal } from "./components/MealDetailModal";
import { AddEditMealModal } from "./components/AddEditMealModal";
import { ToastContainer } from "./components/ToastContainer";

const MainContent: React.FC = () => {
  const { activeTab } = useMealPlanner();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "planner":
        return <AiPlannerView />;
      case "meals":
        return <MealsManagementView />;
      case "weekly":
        return <WeeklyPlannerView />;
      case "recipes":
        return <RecipesView />;
      case "grocery":
        return <GroceryListView />;
      case "analytics":
        return <NutritionAnalyticsView />;
      case "assistant":
        return <AiChatbot isFullPage={true} />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <TopHeader onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* View Surface */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Floating AI Assistant (when not on the dedicated full-page assistant view) */}
      {activeTab !== "assistant" && <AiChatbot isFullPage={false} />}

      {/* Global Modals & Notifications */}
      <MealDetailModal />
      <AddEditMealModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <MealPlannerProvider>
      <MainContent />
    </MealPlannerProvider>
  );
}
