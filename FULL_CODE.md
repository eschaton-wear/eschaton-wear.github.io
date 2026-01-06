# Léger AI - Full Source Code (Latest Build)

> [!IMPORTANT]
> This file contains the complete source code for the Léger AI project as of the latest cinematic update. Your friend can use this to understand the architecture or recreate the project.

## Project Structure & Dependencies

### package.json
```json
{
  "name": "leger-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.562.0",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-markdown": "^10.1.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## Global Styles & Layout

### app/globals.css
```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-serif: var(--font-instrument-serif);

  --shadow-soft: 0 40px 100px -20px rgba(0, 0, 0, 0.1);
  --shadow-glow: var(--glow-shadow);
}

:root[data-theme='white'] {
  --background: #FFFFFF;
  --foreground: #000000;
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-border: rgba(0, 0, 0, 0.1);
  --glow-shadow: 0 0 60px rgba(79, 70, 229, 0.1);
  --accent: #4F46E5;
}

:root[data-theme='dark'] {
  --background: #050505;
  /* Deep Matte Black */
  --foreground: #EDEDED;
  --card-bg: rgba(20, 20, 20, 0.8);
  --card-border: rgba(255, 255, 255, 0.1);
  --glow-shadow: 0 0 80px rgba(255, 255, 255, 0.05);
  /* White glow */
  --accent: #FFFFFF;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  letter-spacing: -0.02em;
  transition: background-color 0.5s ease, color 0.5s ease;
}

/* Noise overlay */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.35;
  mix-blend-mode: overlay;
}

/* Permanent Background Effect - Dynamic based on theme */
.bg-smoke {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  z-index: -1;
  background-image:
    radial-gradient(circle at 15% 50%, var(--glow-shadow) 0%, transparent 45%),
    radial-gradient(circle at 85% 30%, var(--glow-shadow) 0%, transparent 45%);
  filter: blur(80px);
  transition: opacity 0.5s ease;
  opacity: 0.3;
}
```

### app/layout.tsx
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Léger AI",
  description: "Pure Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

## Main Page

### app/page.tsx
```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Layers, Layers2 } from 'lucide-react';
import Hero from '@/components/Hero';
import FAQ from '@/components/FAQ';
import Chat from '@/components/Chat';
import Features from '@/components/Features';
import Trust from '@/components/Trust';
import TokenTracker from '@/components/TokenTracker';
import Intro from '@/components/Intro';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import CustomCursor from '@/components/CustomCursor';
import AnimatedGradient from '@/components/AnimatedGradient';
import MetaballBackground from '@/components/MetaballBackground';
import { soundManager } from '@/utils/sounds';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Theme = 'white' | 'dark';

export default function Home() {
  const [tokens, setTokens] = useState({ left: 1500000, total: 1500000 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [plan, setPlan] = useState<'base' | 'ultra'>('ultra');
  const [currentModel, setCurrentModel] = useState<'normal' | 'portal'>('normal');
  const [showGradient, setShowGradient] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('leger-theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('leger-theme', theme);
    }
  }, [theme]);

  const handleSetTheme = (t: Theme) => {
    setTheme(t);
  };

  const handleSearch = async (query: string) => {
    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          tier: plan,
          model: currentModel
        })
      });

      if (!response.body) throw new Error("No response body");

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        streamedContent += chunkValue;

        setMessages(prev => {
          const newMsg = [...prev];
          const lastMsg = newMsg[newMsg.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = streamedContent;
          }
          return newMsg;
        });

        setTokens(prev => ({ ...prev, left: Math.max(0, prev.left - chunkValue.length) }));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!theme) return <Intro onSelect={handleSetTheme} />;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden transition-colors duration-500 bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500 selection:text-white">
      <CustomCursor isPortal={currentModel === 'portal'} />
      <ThemeSwitcher currentTheme={theme} setTheme={handleSetTheme} />

      {showGradient && (
        <AnimatePresence>
          {currentModel === 'portal' ? (
            <motion.div
              key="portal-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="fixed inset-0 z-0"
            >
              <MetaballBackground theme={theme} isPortal={true} />
            </motion.div>
          ) : (
            <motion.div
              key="standard-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="fixed inset-0 z-0"
            >
              <AnimatedGradient theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="bg-smoke" />

      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-[var(--card-bg)] backdrop-blur-md border-b border-[var(--card-border)] transition-colors">
        <div className="flex items-center gap-8">
          <div
            className="text-2xl font-medium tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setMessages([])}
          >
            Léger AI
          </div>
          {messages.length === 0 && (
            <Link href="/pricing" className="text-sm font-medium opacity-60 hover:opacity-100 hover:text-[var(--foreground)] transition-colors mt-1">Pricing</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.play('click');
              setShowGradient(!showGradient);
            }}
            className={`p-2 rounded-full transition-all hover:bg-black/5 ${!showGradient ? 'opacity-40' : 'opacity-100'}`}
            title={showGradient ? "Hide Background Spheres" : "Show Background Spheres"}
          >
            {showGradient ? <Layers className="w-5 h-5" /> : <Layers2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <TokenTracker tokensLeft={tokens.left} totalTokens={tokens.total} />

      <div className="relative z-10 pt-24 min-h-screen flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)', y: -40 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 flex flex-col items-center"
            >
              <Hero onSearch={handleSearch} />
              <Trust />
              <Features />
              <FAQ />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 50, filter: 'blur(30px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 50, filter: 'blur(30px)' }}
              transition={{
                duration: 0.8,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="flex-1"
            >
              <Chat
                messages={messages}
                onSearch={handleSearch}
                isLoading={isLoading}
                isPortal={currentModel === 'portal'}
                currentModel={currentModel}
                onModelChange={setCurrentModel}
                isUltra={plan === 'ultra'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {messages.length === 0 && (
        <footer className="w-full py-12 text-center text-sm text-gray-400 font-serif italic">
          <p>&copy; {new Date().getFullYear()} Léger AI. Designed with pure intelligence.</p>
        </footer>
      )}
    </main>
  );
}
```

## AI Reasoning Components

### components/Chat.tsx
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Sparkles, Copy, Check, Brain, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { soundManager } from '@/utils/sounds';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatProps {
    messages: Message[];
    onSearch: (query: string) => void;
    isLoading: boolean;
    isPortal?: boolean;
    currentModel: 'normal' | 'portal';
    onModelChange: (model: 'normal' | 'portal') => void;
    isUltra: boolean;
}

export default function Chat({
    messages,
    onSearch,
    isLoading,
    isPortal = false,
    currentModel,
    onModelChange,
    isUltra
}: ChatProps) {
    const [input, setInput] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(messages.length);

    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

    const handleScroll = () => {
        if (!bottomRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
        setIsAutoScrollEnabled(isNearBottom);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isAutoScrollEnabled) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        if (messages.length > prevMessagesLength.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
                soundManager.play(isPortal ? 'portal_receive' : 'receive');
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, isAutoScrollEnabled]);

    useEffect(() => {
        if (isLoading && isPortal) {
            const interval = setInterval(() => {
                soundManager.play('portal_typing');
            }, 80);
            return () => clearInterval(interval);
        }
    }, [isLoading, isPortal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        soundManager.play(isPortal ? 'portal_send' : 'send');
        onSearch(input);
        setInput('');
    };

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content);
        soundManager.play('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-60">
            <AnimatePresence>
                {isPortal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-0"
                    >
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-purple-500 rounded-full"
                                initial={{
                                    x: Math.random() * 100 + "%",
                                    y: Math.random() * 100 + "%",
                                    opacity: 0,
                                    scale: 0
                                }}
                                animate={{
                                    y: [null, "-=100"],
                                    opacity: [0, 0.5, 0],
                                    scale: [0, 1.5, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 3 + 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 5
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-12 py-10 relative z-10">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                            duration: 0.6,
                            ease: [0.23, 1, 0.32, 1],
                            layout: { duration: 0.3 }
                        }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-black" />
                            </div>
                        )}
                        <div className={`relative group ${msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
                            <div className={`prose prose-lg ${msg.role === 'user' ? 'bg-gray-100 rounded-2xl px-6 py-3 text-gray-800' : 'text-[var(--foreground)]'}`}>
                                {msg.role === 'user' ? (
                                    <p className="m-0 font-medium">{msg.content}</p>
                                ) : (
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-lg" {...props} />
                                    }}>
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={() => handleCopy(msg.content, i)}
                                    className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Copy response"
                                >
                                    {copiedIndex === i ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 animate-pulse">
                            <span className="w-2 h-2 bg-black rounded-full" />
                        </div>
                        <div className="text-gray-400 italic font-serif">Thinking...</div>
                    </div>
                )}
                <div className="h-48 w-full" />
                <div ref={bottomRef} className="scroll-mt-32" />
            </div>

            <div className="fixed bottom-8 left-0 right-0 z-50 flex flex-col items-center gap-4 px-4">
                {isUltra && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl p-1 flex gap-1 mb-2"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                if (currentModel !== 'normal') {
                                    soundManager.play('click');
                                    onModelChange('normal');
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${currentModel === 'normal' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Brain className="w-4 h-4" />
                            Normal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (currentModel !== 'portal') {
                                    soundManager.play('portal');
                                    onModelChange('portal');
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${currentModel === 'portal' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Zap className="w-4 h-4" />
                            Portal
                        </button>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
                    <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isPortal ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-100 scale-105' : 'bg-gradient-to-r from-gray-100 to-gray-50 opacity-80 group-hover:opacity-100'}`} />
                    <div className={`relative flex items-center bg-white rounded-full shadow-2xl border transition-all duration-500 ${isPortal ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'} p-2`}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Keep exploring..."
                            className="flex-1 bg-transparent border-none px-6 py-3 text-lg focus:ring-0 text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            onClick={() => !isLoading && input.trim() && soundManager.play('click')}
                            className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

## Visual Components

### components/Hero.tsx
```tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { soundManager } from '@/utils/sounds';

interface HeroProps {
    onSearch: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            soundManager.play('click');
            onSearch(query);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center">
            <motion.h1
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center justify-center text-center text-5xl md:text-7xl font-medium tracking-tighter mb-12 max-w-5xl text-[var(--foreground)] transition-colors"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Elevate your Brand with Pure
                </motion.span>
                <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="font-serif italic font-normal text-6xl md:text-8xl mt-2 opacity-90"
                >
                    Intelligence
                </motion.span>
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="w-full max-w-2xl relative group"
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-100 to-purple-50 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-[var(--card-bg)] backdrop-blur-md rounded-full shadow-lg border border-[var(--card-border)] p-2 transition-colors">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask anything about your brand..."
                        className="flex-1 bg-transparent border-none px-6 py-4 text-xl focus:ring-0 placeholder:text-gray-400 outline-none text-current"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-[var(--foreground)] text-[var(--background)] rounded-full px-8 py-4 font-medium text-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-300"
                    >
                        Generate
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
```

### components/Trust.tsx
```tsx
'use client';

import { motion } from 'framer-motion';

const pillars = [
    "Léger AI", "500+ Brands", "Fine-tune",
    "Léger AI", "500+ Brands", "Fine-tune"
];

export default function Trust() {
    return (
        <section className="w-full py-12 border-y border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden mb-20 transition-colors">
            <div className="flex w-full">
                <motion.div
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity
                    }}
                    className="flex whitespace-nowrap gap-16 md:gap-32 px-8 text-2xl font-serif italic opacity-30 select-none"
                >
                    {[...pillars, ...pillars].map((text, i) => (
                        <span key={i} className="shrink-0 hover:opacity-100 transition-opacity cursor-default text-[var(--foreground)] px-4">
                            {text}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
```

### components/Features.tsx
```tsx
'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Globe } from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: "Deep Reasoning",
        description: "Our proprietary engine doesn't just answer; it thinks. Recursive analysis simulates human logic paths."
    },
    {
        icon: Globe,
        title: "Global Context",
        description: "Understanding markets across 140+ regions instantly. Cultural nuances are respected and leveraged."
    },
    {
        icon: Zap,
        title: "Real-Time Synthesis",
        description: "Live data ingestion means your brand strategy isn't static—it evolves with the market pulse."
    }
];

export default function Features() {
    return (
        <section className="py-24 px-4 w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.15,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                        viewport={{ once: true }}
                        whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.4 } }}
                        className="group relative p-8 rounded-3xl bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] shadow-lg cursor-default overflow-hidden transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center mb-6 shadow-xl">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-medium mb-3 tracking-tight">{feature.title}</h3>
                            <p className="opacity-70 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
```

## Graphics & Motion

### components/MetaballBackground.tsx (WebGL2)
```tsx
'use client';
import { useEffect, useRef } from 'react';

interface MetaballBackgroundProps {
  theme: 'white' | 'dark' | null;
  isPortal?: boolean;
}

export default function MetaballBackground({ theme, isPortal = false }: MetaballBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true });
    if (!gl) return;

    const vertexShaderSource = `#version 300 es
      in vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      out vec4 fragColor;
      
      float metaball(vec2 p, vec2 center, float radius) {
        float dist = length(p - center);
        return radius / (dist * dist);
      }
      
      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        vec2 b1 = vec2(sin(time*0.3)*0.4, cos(time*0.4)*0.3);
        vec2 b2 = vec2(sin(time*0.25+2.0)*0.5, cos(time*0.35+2.0)*0.4);
        vec2 b3 = vec2(sin(time*0.2+4.0)*0.35, cos(time*0.3+4.0)*0.45);
        
        float field = metaball(p, b1, 0.15) + metaball(p, b2, 0.18) + metaball(p, b3, 0.16);
        float alpha = smoothstep(1.5, 1.8, field);
        vec3 color = mix(color1, color2, sin(field)*0.5+0.5);
        fragColor = vec4(color * alpha, alpha);
      }
    `;

    const compile = (s: string, t: number) => {
      const sh = gl.createShader(t)!;
      gl.shaderSource(sh, s); gl.compileShader(sh); return sh;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(vertexShaderSource, gl.VERTEX_SHADER));
    gl.attachShader(program, compile(fragmentShaderSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(program); gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const colors = isPortal ? [[0.6,0.2,1.0], [1.0,0.1,0.6], [0.3,0.1,0.8]] : [[0.0,1.0,0.5], [0.0,0.8,1.0], [1.0,0.0,0.8]];
    gl.uniform3fv(gl.getUniformLocation(program, 'color1'), colors[0]);
    gl.uniform3fv(gl.getUniformLocation(program, 'color2'), colors[1]);
    gl.uniform3fv(gl.getUniformLocation(program, 'color3'), colors[2]);

    const resLoc = gl.getUniformLocation(program, 'resolution');
    const timeLoc = gl.getUniformLocation(program, 'time');

    const render = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, performance.now()*0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };
    render();
  }, [theme, isPortal]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}
```

## Core Utilities

### utils/sounds.ts (Pro Synthesis)
```typescript
class SoundManager {
    private audioContext: AudioContext | null = null;
    private init() {
        if (!this.audioContext) this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        return this.audioContext;
    }

    private playTone(freqs: number[], duration: number, vol: number, delay: number = 0) {
        const ctx = this.init();
        const start = ctx.currentTime + delay;
        freqs.forEach(f => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.frequency.setValueAtTime(f, start);
            g.gain.setValueAtTime(0, start);
            g.gain.linearRampToValueAtTime(vol/freqs.length, start + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, start + duration);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(start); osc.stop(start + duration);
        });
    }

    play(name: string) {
        switch(name) {
            case 'click': this.playTone([3000], 0.02, 0.05); break;
            case 'portal': this.playTone([400, 800], 0.6, 0.02); break;
            case 'send': this.playTone([150], 0.2, 0.1); break;
            case 'receive': this.playTone([659, 830], 0.4, 0.08); break;
        }
    }
}
export const soundManager = new SoundManager();
```

> [!NOTE]
> Many components (AnimatedGradient, Intro, ThemeSwitcher) follow a similar logic but were shortened here for clarity. The friend can expand these basic patterns to recreate transitions.
