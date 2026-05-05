'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat() as any;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as any);
      }
    }
  };

  const manualSubmit = () => {
    console.log('AIChat: Manual button click trigger');
    if (input.trim() && !isLoading) {
      const fakeEvent = { 
        preventDefault: () => {},
        target: { input: { value: input } } 
      } as any;
      handleSubmit(fakeEvent);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-brand-surface rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[380px] h-[520px] bg-brand-surface border border-brand-border rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-[110] ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-bg rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
              <Bot size={20} className="text-brand-surface" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-text">AI Assistant</h3>
              <p className="text-[10px] text-brand-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-brand-muted hover:text-brand-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/30">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 bg-brand-bg border border-brand-border rounded-full flex items-center justify-center mb-4">
                <Bot size={24} className="text-brand-muted" />
              </div>
              <h4 className="font-bold text-brand-text mb-1 text-sm">Ada yang bisa dibantu?</h4>
              <p className="text-[11px] text-brand-muted">Tanyakan seputar coding, teknologi, atau bantuan navigasi di KodeRuang.</p>
            </div>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                m.role === 'user' 
                  ? 'bg-brand-primary text-brand-surface rounded-br-none shadow-sm' 
                  : 'bg-brand-surface border border-brand-border text-brand-text rounded-bl-none shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-brand-surface border border-brand-border px-3 py-2 rounded-lg rounded-bl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center text-xs text-brand-accent p-2 bg-brand-accent/10 rounded-md border border-brand-accent/20">
              Maaf, terjadi gangguan koneksi.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              handleSubmit(e);
            }
          }} 
          className="p-3 border-t border-brand-border bg-brand-surface flex gap-2 relative z-[200]"
        >
          <input
            className="flex-1 bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text min-w-0"
            value={input}
            placeholder="Tanya sesuatu..."
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={manualSubmit}
            disabled={isLoading || !input?.trim()}
            className="w-10 h-10 bg-brand-primary text-brand-surface rounded-md disabled:opacity-50 hover:bg-brand-primary/90 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 pointer-events-auto shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-brand-surface border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </>
  );
}
