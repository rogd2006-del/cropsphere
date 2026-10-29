import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, X, Loader2, Sprout, Trash2, RotateCcw, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

const ALL_QUICK_QUESTIONS = [
  '🥗 What fresh recipes can I make with local spinach and heirloom tomatoes?',
  '🌱 What are regenerative soil practices used by organic farms?',
  '📍 How can I find the nearest sustainable farm to my location?',
  '🍯 What makes raw wildflower honey different from supermarket honey?',
  '🥕 What vegetables are in season right now?',
  '🌾 How do I start my own backyard vegetable garden?',
  '🧀 What is the difference between artisan and commercial cheese?',
  '🍅 How do I store tomatoes to keep them fresh longer?',
];

function formatMessage(text) {
  if (!text) return text;
  // Bold: **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Bullet points: lines starting with - or •
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<span style="display:block;padding-left:12px;position:relative"><span style="position:absolute;left:0">•</span>$1</span>');
  // Numbered lists: lines starting with digits.
  formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<span style="display:block;padding-left:16px;position:relative"><span style="position:absolute;left:0;font-weight:600;color:#2d6a4f">$1.</span>$2</span>');
  return formatted;
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState(() => {
    const shuffled = [...ALL_QUICK_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm **CropSphere AI**, powered by Google Gemini.\n\nAsk me anything about:\n- 🌱 Seasonal crops & farming tips\n- 📍 Finding local farms near you\n- 🥗 Recipes with fresh local ingredients\n- 🌿 Sustainable agriculture practices",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const lastFailedRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const handleSend = async (questionText) => {
    const query = questionText || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    lastFailedRef.current = null;

    try {
      const res = await api.askAI(query.trim());
      const botMsg = {
        role: 'assistant',
        text: res.answer || 'I could not generate an answer at this time. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      // Rotate quick questions
      setQuickQuestions(() => {
        const shuffled = [...ALL_QUICK_QUESTIONS].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
      });
    } catch (err) {
      lastFailedRef.current = query.trim();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: '⚠️ Unable to reach the AI service right now. This could be a temporary network issue.\n\nClick the **retry button** below or try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedRef.current) {
      // Remove the error message
      setMessages(prev => prev.filter(m => !m.isError));
      handleSend(lastFailedRef.current);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        text: "🔄 Chat cleared! I'm ready for a fresh conversation.\n\nWhat would you like to know about local farming, fresh produce, or recipes?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    lastFailedRef.current = null;
    setQuickQuestions(() => {
      const shuffled = [...ALL_QUICK_QUESTIONS].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-chat-fab"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
            color: '#ffffff',
            border: '2px solid rgba(82, 183, 136, 0.4)',
            borderRadius: '999px',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(8, 28, 21, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          title="Ask CropSphere Gemini AI"
        >
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            background: '#52b788',
            borderRadius: '50%',
            color: '#081c15'
          }}>
            <Sparkles size={14} />
          </div>
          <span>Gemini AI Advisor</span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.15)',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '6px',
            fontWeight: 500,
            color: '#d8f3dc',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            Live
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '400px',
          maxWidth: 'calc(100vw - 32px)',
          height: '580px',
          maxHeight: 'calc(100vh - 48px)',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 48px -8px rgba(8, 28, 21, 0.35)',
          border: '1px solid #d8f3dc',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 120,
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #081c15 0%, #1b4332 100%)',
            color: '#ffffff',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(82, 183, 136, 0.25)',
                border: '1px solid rgba(82, 183, 136, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#74c69d'
              }}>
                <Sprout size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  CropSphere AI
                  <span style={{ fontSize: '10px', background: '#52b788', color: '#081c15', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    GEMINI
                  </span>
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#b7e4c7' }}>
                  {loading ? '✍️ Generating response...' : '🟢 Online — Smart Farm Advisor'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleClear}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#d8f3dc',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  borderRadius: '6px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#d8f3dc',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  borderRadius: '6px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#f8faf9',
              position: 'relative'
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  padding: '12px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user'
                    ? '#2d6a4f'
                    : msg.isError
                      ? '#fef3c7'
                      : '#ffffff',
                  color: msg.role === 'user'
                    ? '#ffffff'
                    : msg.isError
                      ? '#92400e'
                      : '#1f2937',
                  boxShadow: msg.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: msg.role === 'user'
                    ? 'none'
                    : msg.isError
                      ? '1px solid #fcd34d'
                      : '1px solid #e5e7eb',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}>
                  <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                </div>
                <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#52b788',
                        display: 'inline-block',
                        animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite both`
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>
                    Gemini is thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Retry button if last message was an error */}
            {lastFailedRef.current && !loading && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleRetry}
                  style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    color: '#9a3412',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                >
                  <RotateCcw size={13} /> Retry last question
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              style={{
                position: 'absolute',
                bottom: '140px',
                right: '36px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2d6a4f',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 130
              }}
            >
              <ChevronDown size={16} />
            </button>
          )}

          {/* Quick Suggestions */}
          {messages.length <= 3 && !loading && (
            <div style={{ padding: '8px 12px', background: '#f0fdf4', borderTop: '1px solid #d8f3dc' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: '#2d6a4f' }}>
                💡 Try asking:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    style={{
                      textAlign: 'left',
                      background: '#ffffff',
                      border: '1px solid #b7e4c7',
                      borderRadius: '8px',
                      padding: '7px 10px',
                      fontSize: '11.5px',
                      color: '#1b4332',
                      cursor: 'pointer',
                      lineHeight: '1.3',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#52b788';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.borderColor = '#b7e4c7';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about crops, farms, recipes..."
              disabled={loading}
              maxLength={500}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2d6a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: loading || !input.trim() ? '#d1d5db' : '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                if (!loading && input.trim()) e.currentTarget.style.backgroundColor = '#1b4332';
              }}
              onMouseLeave={e => {
                if (!loading && input.trim()) e.currentTarget.style.backgroundColor = '#2d6a4f';
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
