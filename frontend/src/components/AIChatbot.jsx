import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bot,
  X,
  Send,
  SlidersHorizontal,
  ArrowRight,
  Tag,
  Layers,
  ShoppingBag,
  Check,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const SUGGESTIONS = [
  "Show me electronics under $100",
  "Find brand new items",
  "Show products with at least 2 in stock",
  "Find the cheapest products",
];

const AIChatbot = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! 👋 I'm your AI Shopping Assistant. Tell me what product you want, what price or condition, and I'll find it and sort your dashboard automatically!",
      products: [],
      filters: null,
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/ai/chat", {
        message: query,
      });

      const { reply, filters, products } = res.data;

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: reply || "Here is what I found for you:",
        products: products || [],
        filters: filters || null,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Automatically apply extracted filters to the dashboard
      if (filters && onApplyFilters) {
        onApplyFilters(filters);
      }
    } catch (err) {
      console.error("Chatbot request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Oops, I had trouble finding products right now. Please try again or rephrase your request!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Hi! 👋 I'm your AI Shopping Assistant. Tell me what product you want, what price or condition, and I'll find it and sort your dashboard automatically!",
        products: [],
        filters: null,
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 btn btn-primary btn-circle btn-lg shadow-2xl hover:scale-110 transition-transform duration-200 border-2 border-primary-content/20 flex items-center justify-center group"
          title="Open AI Shopping Assistant"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-2 -right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[550px] max-h-[85vh] bg-base-100 rounded-3xl shadow-2xl border border-base-content/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-primary text-primary-content flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-content/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-content" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-none">AI Shopping Assistant</h3>
                  <span className="badge badge-xs badge-secondary font-semibold text-[10px] uppercase">
                    AI
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">Finds & filters products for you</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost btn-xs btn-circle text-primary-content hover:bg-primary-content/20"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-xs btn-circle text-primary-content hover:bg-primary-content/20"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="chat-image avatar">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div
                  className={`chat-bubble text-xs ${
                    msg.sender === "user"
                      ? "chat-bubble-primary text-primary-content font-medium"
                      : "bg-base-100 text-base-content shadow-sm border border-base-content/5 leading-relaxed"
                  }`}
                >
                  {msg.text}

                  {/* Active Filter Tags */}
                  {msg.filters && (
                    <div className="mt-2.5 pt-2 border-t border-base-content/10 flex flex-wrap gap-1">
                      {msg.filters.category && msg.filters.category !== "All" && (
                        <span className="badge badge-xs badge-primary font-medium">
                          {msg.filters.category}
                        </span>
                      )}
                      {msg.filters.condition && (
                        <span className="badge badge-xs badge-secondary font-medium">
                          {msg.filters.condition}
                        </span>
                      )}
                      {msg.filters.maxPrice && (
                        <span className="badge badge-xs badge-ghost font-medium">
                          ≤ ${msg.filters.maxPrice}
                        </span>
                      )}
                      {msg.filters.minStock && (
                        <span className="badge badge-xs badge-ghost font-medium">
                          Stock ≥ {msg.filters.minStock}
                        </span>
                      )}
                      {msg.filters.sortBy && msg.filters.sortBy !== "default" && (
                        <span className="badge badge-xs badge-outline font-medium">
                          Sort: {msg.filters.sortBy}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Product Cards preview inside chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-base-content/70">
                        <span>Recommended Items ({msg.products.length})</span>
                        {onApplyFilters && msg.filters && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyFilters(msg.filters);
                              toast.success("Applied to dashboard!");
                            }}
                            className="link link-primary inline-flex items-center gap-1 font-bold"
                          >
                            <Check className="w-3 h-3" />
                            Apply filters
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {msg.products.map((item) => (
                          <Link
                            key={item._id}
                            to={`/product/${item._id}`}
                            className="flex items-center gap-2 p-2 rounded-xl bg-base-200/70 hover:bg-base-200 transition-colors border border-base-content/5 group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-base-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-base-content/10">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-base-content/30" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-base-content truncate group-hover:text-primary transition-colors">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-base-content/60">
                                <span className="font-bold text-primary">
                                  ${Number(item.price).toFixed(2)}
                                </span>
                                <span>•</span>
                                <span>{item.stock} in stock</span>
                              </div>
                            </div>

                            <ArrowRight className="w-3.5 h-3.5 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Suggestions (Shown when only welcome message exists) */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">
                  Suggested Prompts:
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="btn btn-outline btn-xs justify-start normal-case text-[11px] font-normal hover:btn-primary text-left"
                    >
                      💬 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="chat-bubble bg-base-100 text-base-content shadow-sm border border-base-content/5 flex items-center gap-2">
                  <span className="loading loading-dots loading-xs text-primary" />
                  <span className="text-[11px] text-base-content/60">Thinking & sorting...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-base-100 border-t border-base-content/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="e.g. Find used cars or cheap electronics..."
              className="input input-bordered input-sm flex-1 text-xs focus:outline-primary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn btn-primary btn-sm btn-circle"
              title="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
