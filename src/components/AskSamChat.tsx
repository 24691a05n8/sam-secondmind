import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Link2, 
  Lightbulb, 
  ArrowRight,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { ChatMessage, Memory } from '../types';
import { aiService } from '../services/aiService';
import { SUGGESTED_QUESTIONS, CATEGORIES } from '../utils/constants';

interface AskSamChatProps {
  memories: Memory[];
  onViewMemory: (memoryId: string) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AskSamChat: React.FC<AskSamChatProps> = ({
  memories,
  onViewMemory,
  onToast
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'sam',
      text: "Greetings Alex. I am SAM, your Second Mind. I hold your captured conversations, promises, ideas, and reflections. Ask me anything about what you've learned, committed to, or planned.",
      timestamp: new Date().toISOString(),
      suggestedActions: [
        "What did Rahul tell me?",
        "What business ideas have I saved?",
        "What promises have I made?"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response = await aiService.askSam(q, memories);

      const samMsg: ChatMessage = {
        id: `msg_${Date.now()}_s`,
        sender: 'sam',
        text: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        suggestedActions: response.suggestedActions
      };

      setIsThinking(false);
      setMessages(prev => [...prev, samMsg]);
    } catch (e) {
      setIsThinking(false);
      onToast('Error retrieving from memory repository.', 'error');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'sam',
        text: "Conversation reset. What would you like to recall from your second mind?",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl bg-sam-surface/90 border border-sam-purple/20 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-sam-card/60 border-b border-sam-purple/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-sam-purple via-sam-blue to-sam-highlight flex items-center justify-center shadow-glow-purple">
            <Brain className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-sam-surface" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-sam-text">Ask SAM</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sam-purple/20 text-sam-highlight border border-sam-purple/30">
                Grounded Retrieval Engine
              </span>
            </div>
            <p className="text-xs text-sam-muted">
              Strict memory querying • No fabricated answers • {memories.length} indexed records
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sam-surface hover:bg-sam-card text-xs text-sam-muted hover:text-sam-text border border-sam-purple/15 transition"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Questions Marquee / Chips */}
      <div className="px-6 py-2.5 bg-sam-bg/40 border-b border-sam-purple/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-sam-muted shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggestions:</span>
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1 rounded-full bg-sam-surface hover:bg-sam-purple/20 border border-sam-purple/20 hover:border-sam-purple/40 text-[11px] text-sam-text/90 shrink-0 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'sam' && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sam-purple to-sam-blue flex items-center justify-center shrink-0 shadow-glow-purple">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-sam-purple to-sam-blue text-white shadow-glow-purple rounded-tr-none'
                  : 'bg-sam-card/90 border border-sam-purple/20 text-sam-text rounded-tl-none'
              }`}
            >
              {/* Message text with whitespace formatting */}
              <div className="whitespace-pre-line text-xs sm:text-sm">
                {msg.text}
              </div>

              {/* Source Memory Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-sam-purple/20 space-y-2">
                  <div className="text-[11px] font-bold text-sam-highlight flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Source Citations ({msg.sources.length} Saved Records):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map(src => {
                      const cat = CATEGORIES[src.category] || CATEGORIES.daily_life;
                      return (
                        <div
                          key={src.memoryId}
                          onClick={() => onViewMemory(src.memoryId)}
                          className="p-2.5 rounded-xl bg-sam-surface/70 hover:bg-sam-surface border border-sam-purple/20 hover:border-sam-purple/50 cursor-pointer transition group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-sam-muted mb-1">
                            <span style={{ color: cat.color }} className="font-semibold">
                              {cat.label}
                            </span>
                            <ExternalLink className="w-3 h-3 text-sam-muted group-hover:text-sam-highlight" />
                          </div>
                          <p className="text-xs font-bold text-sam-text line-clamp-1 group-hover:text-sam-highlight">
                            {src.title}
                          </p>
                          <p className="text-[11px] text-sam-muted line-clamp-1 mt-0.5">
                            {src.snippet}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(action)}
                      className="text-[11px] font-medium text-sam-highlight hover:underline flex items-center gap-1 bg-sam-surface/40 px-2.5 py-1 rounded-lg border border-sam-purple/15"
                    >
                      <span>{action}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2 text-[10px] opacity-60 text-right font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-sam-card border border-sam-purple/30 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-sam-highlight" />
              </div>
            )}
          </div>
        ))}

        {/* Animated AI Thinking State */}
        {isThinking && (
          <div className="flex gap-3.5 justify-start items-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sam-purple to-sam-blue flex items-center justify-center shrink-0 shadow-glow-purple">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="rounded-2xl p-4 bg-sam-card/90 border border-sam-purple/20 text-sam-muted flex items-center gap-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-sam-highlight animate-ping" />
                <span className="w-2 h-2 rounded-full bg-sam-purple animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-sam-blue animate-pulse" />
              </div>
              <span className="text-xs font-mono text-sam-highlight">
                Searching neural memory index...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-sam-surface border-t border-sam-purple/15">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask SAM anything... (e.g. 'What did Rahul tell me?')"
              className="w-full px-4 py-3 rounded-xl bg-sam-bg/90 border border-sam-purple/25 text-sam-text placeholder-sam-muted text-xs sm:text-sm focus:outline-none focus:border-sam-purple/60 focus:ring-1 focus:ring-sam-purple/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white font-bold text-xs shadow-glow-purple hover:opacity-95 disabled:opacity-40 flex items-center gap-2 transition"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

