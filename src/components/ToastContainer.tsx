import React from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMealPlanner();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderClass = "border-emerald-200 bg-white";
        let titleColor = "text-slate-900";

        if (toast.type === "success") {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          borderClass = "border-emerald-200 bg-white shadow-emerald-900/5";
        } else if (toast.type === "warning") {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          borderClass = "border-amber-200 bg-white shadow-amber-900/5";
        } else if (toast.type === "error") {
          icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = "border-rose-200 bg-white shadow-rose-900/5";
        }

        return (
          <div
            key={toast.id}
            id={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${titleColor}`}>{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
