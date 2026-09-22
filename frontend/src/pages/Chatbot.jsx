import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Send, Bot, User, Sparkles, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Chatbot = () => {
  const { menuItems, addToCart } = useCart();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello Alex! I'm your CanteenHub AI assistant. You can ask me about today's campus specials, ingredients, allergen warnings, or for quick recommendations."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What's popular today?",
    "Any vegetarian options?",
    "What are the canteen opening hours?",
    "Check allergen info for Teriyaki Bowl"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "I can definitely help with that! You can browse all fresh dishes directly in our Menu or let me know what flavor profile you are craving.";
      const lower = query.toLowerCase();

      if (lower.includes('popular') || lower.includes('recommend') || lower.includes('best')) {
        botResponse = "Today's campus top picks are the Teriyaki Chicken Bowl ($9.20) and the freshly baked Margherita Pizza ($8.50)! Both have 15-20 min prep times.";
      } else if (lower.includes('vegetarian') || lower.includes('vegan') || lower.includes('veg')) {
        botResponse = "For vegetarian options, our Mozzarella Margherita Pizza, Grilled Cheese Sandwich, and crisp Caesar Salad (ask for no bacon) are student favorites!";
      } else if (lower.includes('hour') || lower.includes('time') || lower.includes('open')) {
        botResponse = "Main Canteen Building A is open Monday to Friday from 8:00 AM to 8:30 PM. Breakfast ends at 10:30 AM, and lunch service starts at 11:15 AM.";
      } else if (lower.includes('allergen') || lower.includes('teriyaki') || lower.includes('gluten')) {
        botResponse = "The Teriyaki Chicken Bowl contains soy and sesame seeds. It can be made gluten-friendly upon counter request!";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Canteen Chatbot
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Ask our smart assistant anything about campus food, hours & allergens
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today, Oct 24, 2024</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#14805f] flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111827]">CanteenHub Assistant</h3>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online & Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Sparkles size={14} className="text-[#14805f]" />
            <span className="hidden sm:inline">AI Powered</span>
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
                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#14805f] text-white rounded-br-xs'
                    : 'bg-[#f4f5f8] text-[#1f2937] rounded-bl-xs'
                }`}
              >
                {m.text}
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
              <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#14805f] flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-[#f4f5f8] text-gray-500 text-xs px-4 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-gray-400 shrink-0">Try asking:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              type="button"
              className="text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-[#ecfdf5] hover:text-[#14805f] border border-gray-200/80 px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
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
              placeholder="Ask about meal choices, counters, daily specials..."
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#14805f] focus:ring-2 focus:ring-[#14805f]/15 transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={!input.trim()}
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
