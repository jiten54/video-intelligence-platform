import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export const ChatPanel = ({ videoId, videoTitle }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          message: userMessage,
          session_id: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to send message. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glassmorphism rounded-2xl shadow-2xl h-[calc(100vh-200px)] flex flex-col" data-testid="chat-panel-container">
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-text-primary">AI Assistant</h2>
            <p className="text-xs text-text-muted line-clamp-1">{videoTitle}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-6" ref={scrollRef} data-testid="chat-messages">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center px-4">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-primary mx-auto mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <p className="text-text-muted text-sm">Ask me anything about this video!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                data-testid={`chat-message-${index}`}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-800 text-text-primary'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start" data-testid="chat-loading">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-slate-800 rounded-xl px-4 py-3">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-slate-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            data-testid="chat-input"
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900/50 border-slate-800 focus:border-cyan-400 rounded-lg text-text-primary placeholder:text-slate-500"
            disabled={loading}
          />
          <Button
            data-testid="chat-send-btn"
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 bg-primary text-primary-foreground hover:bg-cyan-400 hover:shadow-glow transition-all duration-300 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;