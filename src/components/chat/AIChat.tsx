'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat() as any;

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('AIChat: Form submitted with input:', input);
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-brand-primary text-brand-surface rounded-full shadow-lg hover:bg-brand-primary/90 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] h-[500px] bg-brand-surface border border-brand-border rounded-lg shadow-xl flex flex-col overflow-hidden z-50 transition-all origin-bottom-right duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-brand-primary text-brand-surface p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-bold">AI Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:text-brand-surface/70 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg">
          {messages.length === 0 && (
            <div className="text-center text-sm text-brand-muted mt-4">
              Halo! Saya adalah asisten AI KodeRuang. Ada yang bisa saya bantu terkait coding atau teknologi?
            </div>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-brand-primary text-brand-surface' : 'bg-brand-surface border border-brand-border text-brand-text'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-brand-surface border border-brand-border text-brand-text rounded-md px-3 py-2 text-sm">
                <span className="animate-pulse">Mengetik...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center text-xs text-brand-accent p-2 bg-brand-accent/10 rounded-md">
              Terjadi kesalahan: {error.message}
            </div>
          )}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log('AIChat: Submitting...', input);
            if (input.trim() && !isLoading) {
              handleSubmit(e);
            }
          }} 
          className="p-3 border-t border-brand-border bg-brand-surface flex gap-2 relative z-[60]"
        >
          <input
            className="flex-1 bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-brand-text"
            value={input}
            placeholder="Tanya sesuatu..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className="p-2 bg-brand-primary text-brand-surface rounded-md disabled:opacity-50 hover:bg-brand-primary/90 transition-all cursor-pointer active:scale-95 flex items-center justify-center min-w-[40px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-brand-surface border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </>
  );
}
