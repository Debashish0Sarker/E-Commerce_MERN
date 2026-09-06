import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Send, ArrowRight, RotateCcw, MessageSquare } from "lucide-react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const SUGGESTIONS = [
  "Electronics under $100",
  "Only brand new things",
  "At least 2 in stock",
  "Cheapest first",
];

const WELCOME = {
  id: "welcome",
  sender: "bot",
  text: "Tell me what you're after — a category, a budget, new or used — and I'll filter the listings for you.",
  products: [],
  filters: null,
};

const AIChatbot = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);

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
          text: "I couldn't reach the listings just then. Try again, or word it differently.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME]);
  };

  return (
    <>
      {/* Launcher */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 h-11 pl-4 pr-5 rounded-full bg-base-content text-base-100 text-sm font-medium shadow-lift hover:opacity-90 transition-opacity"
        >
          <MessageSquare className="w-4 h-4" />
          Help me find something
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-40 w-[92vw] sm:w-[24rem] h-[32rem] max-h-[80vh] bg-base-100 border border-base-300 rounded-box shadow-lift flex flex-col overflow-hidden animate-riseIn">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-base-300">
            <div>
              <h2 className="text-sm font-medium text-base-content">Find something</h2>
              <p className="text-xs text-base-content/50">Filters the listings as you ask</p>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-btn text-base-content/45 hover:text-base-content hover:bg-base-200 transition-colors"
                title="Start over"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-btn text-base-content/45 hover:text-base-content hover:bg-base-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto thin-scroll px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === "user" ? "flex justify-end" : ""}
              >
                <div
                  className={
                    msg.sender === "user"
                      ? "max-w-[85%] px-3.5 py-2 rounded-box bg-base-content text-base-100 text-[13px] leading-relaxed"
                      : "max-w-[92%] text-[13px] leading-relaxed text-base-content/85"
                  }
                >
                  {msg.text}

                  {/* Filters the assistant applied */}
                  {msg.filters && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[
                        msg.filters.category !== "All" && msg.filters.category,
                        msg.filters.condition,
                        msg.filters.maxPrice && `under $${msg.filters.maxPrice}`,
                        msg.filters.minStock && `${msg.filters.minStock}+ in stock`,
                        msg.filters.sortBy &&
                          msg.filters.sortBy !== "default" &&
                          `sorted by ${msg.filters.sortBy}`,
                      ]
                        .filter(Boolean)
                        .map((label) => (
                          <span
                            key={label}
                            className="px-2 py-0.5 rounded-badge border border-base-300 bg-base-200/70 text-[11px] text-base-content/65"
                          >
                            {label}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Matching listings */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="eyebrow">
                          {msg.products.length} match
                          {msg.products.length === 1 ? "" : "es"}
                        </span>
                        {onApplyFilters && msg.filters && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyFilters(msg.filters);
                              toast.success("Filters applied");
                            }}
                            className="text-[11px] text-base-content/55 hover:text-base-content underline underline-offset-4 transition-colors"
                          >
                            Apply to page
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 max-h-52 overflow-y-auto thin-scroll -mx-1.5 px-1.5">
                        {msg.products.map((item) => (
                          <Link
                            key={item._id}
                            to={`/product/${item._id}`}
                            className="flex items-center gap-2.5 p-1.5 rounded-btn hover:bg-base-200 transition-colors group"
                          >
                            <div className="w-11 h-11 shrink-0 rounded-btn overflow-hidden bg-base-200 border border-base-300/60">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="w-full h-full grid place-items-center font-display text-[10px] text-base-content/25">
                                  {item.category?.slice(0, 3)}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-base-content truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-base-content/50 tnum">
                                ${Number(item.price).toFixed(2)} · {item.stock} in stock
                              </p>
                            </div>

                            <ArrowRight className="w-3.5 h-3.5 text-base-content/25 group-hover:text-base-content/60 transition-colors shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Openers */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-2.5 py-1.5 rounded-badge border border-base-300 text-xs text-base-content/65 hover:border-base-content/25 hover:text-base-content transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <p className="text-[13px] text-base-content/45">Looking…</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 px-3 py-3 border-t border-base-300"
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 h-9 px-3 rounded-btn border border-base-300 bg-base-100 text-[13px] text-base-content placeholder:text-base-content/35 focus:outline-none focus:border-primary transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 shrink-0 grid place-items-center rounded-btn bg-base-content text-base-100 disabled:opacity-25 hover:opacity-90 transition-opacity"
              aria-label="Send"
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
