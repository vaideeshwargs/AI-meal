import React, { useState } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { GroceryItem } from "../types";
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  RefreshCw, 
  Printer, 
  Check, 
  Apple, 
  Carrot, 
  Egg, 
  Wheat, 
  Sparkles, 
  Package,
  Milk
} from "lucide-react";

export const GroceryListView: React.FC = () => {
  const { 
    groceryList, 
    toggleGroceryItem, 
    addGroceryItem, 
    removeGroceryItem, 
    clearPurchasedGrocery, 
    syncGroceryWithPlan 
  } = useMealPlanner();

  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("1 portion");
  const [newItemCategory, setNewItemCategory] = useState<GroceryItem["category"]>("Vegetables");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories: Array<GroceryItem["category"]> = [
    "Vegetables",
    "Fruits",
    "Protein",
    "Dairy",
    "Grains",
    "Spices",
    "Other",
  ];

  const categoryIcons: Record<string, any> = {
    Vegetables: Carrot,
    Fruits: Apple,
    Protein: Egg,
    Dairy: Milk,
    Grains: Wheat,
    Spices: Sparkles,
    Other: Package,
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addGroceryItem({
      name: newItemName.trim(),
      amount: newItemAmount.trim() || "1 item",
      category: newItemCategory,
      purchased: false,
    });
    setNewItemName("");
    setNewItemAmount("1 portion");
  };

  const purchasedCount = groceryList.filter((g) => g.purchased).length;
  const totalCount = groceryList.length;
  const progressPercent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  // Filter items by category
  const filteredList = groceryList.filter((item) => {
    if (filterCategory !== "All" && item.category !== filterCategory) return false;
    return true;
  });

  // Group by category
  const groupedByCategory: Record<string, GroceryItem[]> = {};
  filteredList.forEach((item) => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Smart Grocery List
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ingredients auto-aggregated from your weekly meal schedule, categorized for efficient shopping
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={syncGroceryWithPlan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors border border-emerald-200/80 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync from Weekly Plan
          </button>
          <button
            onClick={clearPurchasedGrocery}
            disabled={purchasedCount === 0}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
          >
            Clear Purchased ({purchasedCount})
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Print Grocery List"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Quick Add Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shopping Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shopping Progress</span>
            <span className="text-xs font-bold text-emerald-700">{progressPercent}% done</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-heading">{purchasedCount}</span>
            <span className="text-xs text-slate-400">of {totalCount} items bought</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Add Custom Item Form */}
        <form
          onSubmit={handleAddItem}
          className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Add Item</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              required
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Organic Almond Milk"
              className="sm:col-span-2 p-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              placeholder="Qty (e.g. 1 liter)"
              className="p-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="p-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
              filterCategory === c
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Categorized Grocery List */}
      {totalCount === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Grocery List Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Sync from Weekly Plan" to automatically generate ingredients from your scheduled meals.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, items]) => {
            const Icon = categoryIcons[category] || Package;
            const categoryCompleted = items.filter((i) => i.purchased).length;

            return (
              <div
                key={category}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs"
              >
                {/* Category Header */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">{category}</h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {categoryCompleted}/{items.length} bought
                  </span>
                </div>

                {/* Items in this category */}
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                        item.purchased ? "bg-slate-50/50" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <div
                        onClick={() => toggleGroceryItem(item.id)}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            item.purchased
                              ? "bg-emerald-600 text-white"
                              : "border border-slate-300 text-transparent hover:border-slate-400"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div className="min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-medium transition-all block break-words ${
                              item.purchased
                                ? "line-through text-slate-400"
                                : "text-slate-800"
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.mealSource && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              From: {item.mealSource}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {item.amount}
                        </span>
                        <button
                          onClick={() => removeGroceryItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
