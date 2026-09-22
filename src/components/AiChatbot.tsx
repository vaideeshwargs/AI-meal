import React, { useState, useRef, useEffect } from "react";
import { useMealPlanner } from "../context/MealPlannerContext";
import { 
  BotMessageSquare, 
  Send, 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2, 
  User, 
  Lightbulb, 
  RefreshCw 
} from "lucide-react";

interface AiChatbotProps {
  isFullPage?: boolean;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({ isFullPage = false }) => {
  const { userProfile, weeklySchedule, selectedDay } = useMealPlanner();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-welcome",
      sender: "assistant",
      text: `Hello ${userProfile.name}! 👋 I am your AI Nutritionist & Culinary Assistant. Ask me about ingredient substitutes, healthy high-protein snacks, meal prep strategies, or recipe adjustments for your ${userProfile.fitnessGoal} plan!`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Suggest a 200 kcal high-protein snack",
    "What can I substitute for Greek yogurt?",
    "How can I meal-prep dinner faster?",
    "Why was salmon recommended for today?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text,
          })),
          userProfile,
          currentDayPlan: weeklySchedule.find((d) => d.day === selectedDay),
        }),
      });

      const data = await response.json();
      if (!response.ok && !data.reply) {
        throw new Error(data.error || "Server returned an error");
      }

      const replyMessage: Message = {
        id: `reply-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "I'm here to help tailor your nutrition plan. What else would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, replyMessage]);
    } catch (err: any) {
      console.error("AI Chatbot fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: err.message || "I experienced a brief connection interruption. Please try again in a moment.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Full-page layout for the "AI Assistant" sidebar tab
  if (isFullPage) {
    return (
      <div className="space-y-4 pb-12 max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Banner */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <BotMessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 font-heading">
                AI Nutritionist & Culinary Assistant
              </h1>
              <p className="text-xs text-slate-500">
                Grounding answers in your personal goals: {userProfile.calorieTarget} kcal • {userProfile.fitnessGoal}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Assistant
          </span>
        </div>

        {/* Chat Log */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 overflow-y-auto flex flex-col space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-2xl ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-emerald-600 text-white shadow-xs"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tr-xs"
                    : "bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-xs whitespace-pre-line"
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[10px] mt-1.5 block ${
                    m.sender === "user" ? "text-emerald-100 text-right" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
                <span>AI Nutritionist is formulating recommendations...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about meals, nutrition, or cooking instructions..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    );
  }

  // Floating button & drawer mode (rendered globally on all views)
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {isOpen ? (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[480px] sm:h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">AI Nutrition Assistant</h3>
                <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.slice(0, 2).map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors shrink-0 truncate max-w-[170px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask anything..."
              className="flex-1 p-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer group"
          aria-label="Open AI Assistant Chat"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span>Ask AI Nutritionist</span>
        </button>
      )}
    </div>
  );
};
