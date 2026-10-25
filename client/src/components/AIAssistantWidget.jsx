import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, Sprout } from 'lucide-react';
import { api } from '../services/api';

const QUICK_QUESTIONS = [
  '🥗 What fresh recipes can I make with local spinach and heirloom tomatoes?',
  '🌱 What are regenerative soil practices used by organic farms?',
  '📍 How can I find the nearest sustainable farm to my location?',
  '🍯 What makes raw wildflower honey different from supermarket honey?'
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm **CropSphere AI**, powered by Google Gemini. Ask me anything about seasonal crops, farm locations, sustainable agriculture, or recipe ideas using our local harvest!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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

    try {
      const res = await api.askAI(query.trim());
      const botMsg = {
        role: 'assistant',
        text: res.answer || 'I could not generate an answer at this time. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: '⚠️ Unable to connect to Gemini AI right now. Please check server status.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
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
            color: '#d8f3dc'
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
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
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
            padding: '16px 20px',
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
                  Smart Local Food & Farm Advisor
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#d8f3dc',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                borderRadius: '6px'
              }}
              title="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#f8faf9'
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#2d6a4f' : '#ffffff',
                  color: msg.role === 'user' ? '#ffffff' : '#1f2937',
                  boxShadow: msg.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2d6a4f', fontSize: '12px', padding: '8px' }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Gemini is generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (if only 1 or 2 messages) */}
          {messages.length <= 2 && (
            <div style={{ padding: '8px 12px', background: '#f0fdf4', borderTop: '1px solid #d8f3dc' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: '#2d6a4f' }}>
                💡 Suggested Questions:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {QUICK_QUESTIONS.slice(0, 2).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    style={{
                      textAlign: 'left',
                      background: '#ffffff',
                      border: '1px solid #b7e4c7',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      fontSize: '11px',
                      color: '#1b4332',
                      cursor: 'pointer',
                      lineHeight: '1.3'
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
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, farms, recipes..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
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
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
