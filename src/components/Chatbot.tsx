
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { Input } from './ui/input';
import { chat } from '@/ai/flows/store-assistant';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setIsVisible(!isScrollingDown || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const response = await chat({ query: input });
        const aiMessage: Message = { sender: 'ai', text: response.answer };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Chatbot error:", error);
        const errorMessage: Message = { sender: 'ai', text: "Lo siento, no pude procesar tu pregunta. Intenta de nuevo." };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
            scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className={cn(
            "fixed bottom-24 right-4 md:bottom-8 md:right-8 h-16 w-16 rounded-full shadow-2xl z-50 transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-110",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          )}
          size="icon"
        >
          <Bot className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0" side="right">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-3 text-lg">
            <Bot className="text-primary"/>
            Asistente Virtual
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
             <div className="p-4 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>¡Hola! Soy tu asistente de Duo Eats. ¿Cómo puedo ayudarte hoy? Pregúntame sobre nuestros horarios, días de apertura, etc.</p>
                    </div>
                )}
                {messages.map((message, index) => (
                <div
                    key={index}
                    className={cn(
                    'flex items-start gap-3',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                >
                    {message.sender === 'ai' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                            <Bot className="h-5 w-5" />
                        </Avatar>
                    )}
                    <div
                    className={cn(
                        'rounded-2xl p-3 max-w-xs md:max-w-sm',
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    )}
                    >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                     {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Tú'} />
                            <AvatarFallback><User/></AvatarFallback>
                        </Avatar>
                    )}
                </div>
                ))}
                 {isThinking && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                            <Bot className="h-5 w-5" />
                        </Avatar>
                        <div className="bg-muted rounded-2xl p-3 rounded-bl-none">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
             </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center w-full gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              autoComplete="off"
              disabled={isThinking}
            />
            <Button type="submit" size="icon" disabled={isThinking || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
