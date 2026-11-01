import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Send, Bot, User, Sparkles, Utensils, HeartPulse, Flame, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to render basic markdown formatting (bold, bullets, line breaks)
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : line;

        // Parse bold markers **text**
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

        const renderedContent = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[#14805f] font-bold text-xs shrink-0">•</span>
              <span className="flex-1">{renderedContent}</span>
            </div>
          );
        }

        return <p key={idx}>{renderedContent}</p>;
      })}
    </div>
  );
};

const Chatbot = () => {
  const { menuItems } = useCart();

  const storedUser = (() => {
    try {
      const s = sessionStorage.getItem('user');
      if (s) return JSON.parse(s);
      const u = localStorage.getItem('user');
      if (u) return JSON.parse(u);
      const c = localStorage.getItem('customer_user');
      if (c) return JSON.parse(c);
    } catch {
      return null;
    }
    return null;
  })();

  const studentName = storedUser?.username || storedUser?.name || 'there';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${studentName}! I'm your CanteenHub AI food advisor, powered by Gemini. You can ask me anything about our live campus menu, including:

• What to eat when you are **sick or have an upset stomach**
• What is suitable during **fasts or religious vrat**
• Low-calorie & healthy picks for your **diet & fitness**
• Quick meals ready in under 10 minutes
• Detailed ingredients, allergen alerts, and prices in ₹`
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: "What to eat when sick?", prompt: "I'm feeling sick with an upset stomach and cold. What light, gentle food should I eat from the canteen?", icon: HeartPulse },
    { label: "Fasting / Vrat options?", prompt: "I'm observing a fast (vrat/upvas) today. What can I eat or drink from the menu?", icon: Sparkles },
    { label: "Diet & Healthy picks?", prompt: "I'm on a diet and watching my calories. What are the healthiest, low-oil dishes on the menu?", icon: Flame },
    { label: "Ready under 10 mins?", prompt: "I'm in a rush between lectures. What items have a quick prep time under 10 minutes?", icon: Clock },
    { label: "Check allergens & spice?", prompt: "Which dishes are dairy-free or gluten-free, and what are their ingredients?", icon: Utensils },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('customer_token') ||
        localStorage.getItem('token');

      // Send recent messages as context for multi-turn chat
      const recentHistory = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: query,
          history: recentHistory,
        }),
      });

      const data = await res.json();

      let botReply = data.reply;
      if (!res.ok || !botReply) {
        botReply = data.message || "I'm having a brief connection hiccup. Please ask again or check our live Menu page!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
        },
      ]);
    } catch (err) {
      console.error('Chatbot request error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I couldn't reach the server right now. For gentle food when sick, try our light Sada Dosa (₹47) or hot Chai (₹15). Please verify with counter staff!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Canteen AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Gemini-powered dietary recommendations, fasts/vrat guidance & live menu insights
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <span>CanteenHub Food Advisor</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Gemini 3.5 Flash
                </span>
              </h3>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Menu Connected ({menuItems.length} items)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Sparkles size={14} className="text-[#14805f]" />
            <span className="hidden sm:inline font-medium">Diet & Fast Aware</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#14805f] text-white rounded-br-xs'
                    : 'bg-[#f8fafc] text-[#1f2937] border border-gray-100 rounded-bl-xs'
                }`}
              >
                <FormattedMessage text={m.text} />
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shrink-0 shadow-xs">
                <Bot size={16} />
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 text-gray-500 text-xs px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-500">Thinking with Gemini</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14805f] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14805f] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14805f] animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-gray-400 shrink-0 uppercase tracking-wider">
            Quick Ask:
          </span>
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                disabled={isTyping}
                type="button"
                className="text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-[#ecfdf5] hover:text-[#14805f] border border-gray-200/80 px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Icon size={12} className="text-[#14805f]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-4 px-6 border-t border-gray-100 bg-[#fafafa]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ask: 'What can I eat when sick?', 'Fasting options?', 'Healthy for diet?'..."
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#14805f] focus:ring-2 focus:ring-[#14805f]/15 transition-all shadow-xs disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-11 px-5 rounded-xl bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
