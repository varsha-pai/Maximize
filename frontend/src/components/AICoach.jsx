import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Trash2 } from 'lucide-react';

export default function AICoach({ apiBase }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your AI Productivity Companion. I analyze your focus hours, sleep logs, habits, and mood scores to help you build better routines. Ask me anything about your productivity patterns!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${apiBase}/api/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      
      const data = await response.json();
      setIsTyping(false);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response || "I'm having trouble analyzing your request right now. Let me review your logs shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I couldn't reach the productivity engine. Please make sure the backend server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Chat cleared. Ask me anything about your productivity, sleep, or habit logs!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col glass-panel rounded-3xl overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600/10 rounded-xl border border-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Coach Conversation</h2>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Productivity Intelligence Active
            </span>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Board */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${msg.sender === 'user' ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-violet-600/20 border-violet-500/30'}`}>
              {msg.sender === 'user' ? <User className="w-4.5 h-4.5 text-indigo-400" /> : <Bot className="w-4.5 h-4.5 text-violet-400" />}
            </div>
            {/* Bubble */}
            <div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/60 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
              <span className={`text-[10px] text-slate-500 mt-1 block ${msg.sender === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-violet-600/20 border-violet-500/30 shrink-0">
              <Bot className="w-4.5 h-4.5 text-violet-400" />
            </div>
            <div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 rounded-tl-none flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900/60 border-t border-slate-800/80 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your logs (e.g. 'Why was my productivity low yesterday?')"
          className="flex-1 px-4 py-3 rounded-xl glass-input text-sm text-slate-200 placeholder:text-slate-600"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="px-5 bg-violet-600 hover:bg-violet-500 active:bg-violet-750 disabled:opacity-50 text-white rounded-xl shadow-lg transition flex items-center justify-center"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
