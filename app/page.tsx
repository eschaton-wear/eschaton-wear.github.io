'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

import Hero from '@/components/Hero';
import GlassSphereBackground from '@/components/GlassSphereBackground';
import AnimatedGradient from '@/components/AnimatedGradient';
import { soundManager } from '@/utils/sounds';
import { createClient } from '@/utils/supabase/client';
import { signOut } from '@/utils/supabase/auth';
import { hasActiveSubscription, getSubscriptionTier, getSubscriptionStatus, getFullSubscriptionInfo } from '@/utils/supabase/subscription';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/ToastProvider';
import { ChatSession } from '@/components/Sidebar';
import { useI18n } from '@/utils/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Dynamic Imports for Performance
const FAQ = dynamic(() => import('@/components/FAQ'), { ssr: false });
const Chat = dynamic(() => import('@/components/Chat'), { ssr: false });
const Features = dynamic(() => import('@/components/Features'), { ssr: false });
const Trust = dynamic(() => import('@/components/Trust'), { ssr: false });

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });
const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });
const UpgradeModal = dynamic(() => import('@/components/UpgradeModal'), { ssr: false });
const UserProfileModal = dynamic(() => import('@/components/UserProfileModal'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const ConfirmDialog = dynamic(() => import('@/components/ui/ConfirmDialog'), { ssr: false });

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}



function HomeContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const theme = 'dark'; // Always use dark theme
  const [plan, setPlan] = useState<'base' | 'ultra'>('base');
  const [currentModel, setCurrentModel] = useState<'normal' | 'portal'>('normal');

  // Handle Model Change with persistence
  const handleModelChange = (model: 'normal' | 'portal') => {
    setCurrentModel(model);
    localStorage.setItem('model_preference', model);
  };
  const [showGradient, setShowGradient] = useState(true);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'base' | 'ultra' | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Chat History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const supabase = createClient();
  const { error, success } = useToast();
  const { t } = useI18n();

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      // Load model preference
      const savedModel = localStorage.getItem('model_preference') as 'normal' | 'portal';
      if (savedModel) setCurrentModel(savedModel);

      if (user) {
        const fullInfo = await getFullSubscriptionInfo(user.id);
        setHasSubscription(fullInfo.hasSubscription);
        setSubscriptionTier(fullInfo.tier);
        setSubscriptionStatus(fullInfo);

        // PERSISTENCE FIX: Prioritize DB profile data over Google metadata
        const metadataChanged =
          (fullInfo.fullName && fullInfo.fullName !== user.user_metadata?.full_name) ||
          (fullInfo.avatarUrl && fullInfo.avatarUrl !== user.user_metadata?.avatar_url);

        if (metadataChanged) {
          setUser(prev => prev ? ({
            ...prev,
            user_metadata: {
              ...prev.user_metadata,
              full_name: fullInfo.fullName || prev.user_metadata.full_name,
              avatar_url: fullInfo.avatarUrl || prev.user_metadata.avatar_url
            }
          }) : null);
        }

        if (fullInfo.hasSubscription) {
          setPlan(fullInfo.tier || 'base');
          // Auto-switch from Portal if user doesn't have Ultra
          if (!fullInfo.canUsePortal && currentModel === 'portal') {
            setCurrentModel('normal');
          }
        } else {
          setPlan('base');
          setCurrentModel('normal');
        }
      } else {
        setHasSubscription(false);
        setSubscriptionTier(null);
        setPlan('base');
        setCurrentModel('normal');
      }
    };
    checkSubscription();
  }, [user, currentModel]);

  // Auth state management
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // We don't fetch profile here immediately to avoid double-fetch, 
      // rely on the checkSubscription effect which depends on 'user'
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Check for auth query param
  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth === 'signup') {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);



  // History Synchronization for Chat Mode
  useEffect(() => {
    // If messages were added (chat started), push a state
    if (messages.length > 0) {
      // Only push if not already in "chat" state in history (to avoid loops)
      if (window.history.state?.view !== 'chat') {
        window.history.pushState({ view: 'chat' }, '');
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // If we go back and there's no chat state, and we have messages, clear them
      if (!e.state?.view && messages.length > 0) {
        setMessages([]);
        setCurrentChatId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [messages.length]);

  // Scroll effect for Landing Page ONLY
  useEffect(() => {
    // If we are in chat mode (messages exist), we do NOT want background dimming.
    // So we force opacity to 1 and remove listener.
    if (messages.length > 0) {
      setBgOpacity(1);
      return;
    }

    const handleScroll = () => {
      // Calculate opacity based on scroll position (Landing Page logic)
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const fadeStart = windowHeight * 0.3; // Start fading after 30% of viewport
      const fadeEnd = windowHeight * 1.2;   // Fully faded by 120%

      if (scrollPosition <= fadeStart) {
        setBgOpacity(1);
      } else if (scrollPosition >= fadeEnd) {
        setBgOpacity(0);
      } else {
        const newOpacity = 1 - (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        setBgOpacity(Math.max(0, Math.min(1, newOpacity)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [messages.length]); // Re-run when messages change state (Landing <-> Chat)

  useEffect(() => {
    // Always use dark theme
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Fetch Chats
  useEffect(() => {
    if (user) {
      fetchChats();
    } else {
      setChats([]);
      setCurrentChatId(null);
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) setChats(data);
  };

  const handleNewChat = async (title?: string) => {
    if (!user) return;
    const chatTitle = title || t('general.new_chat');

    try {
      // Create new chat session in DB immediately
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({ user_id: user.id, title: chatTitle })
        .select()
        .single();

      if (newChat && !chatError) {
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setMessages([]); // Start with empty messages

        // This will trigger the transition to Chat view in the UI
        success(t('system.chat_created'));
      }
    } catch (e) {
      console.error("Error creating chat", e);
      error(t('system.chat_create_fail'));
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (isLoading) return;
    setCurrentChatId(chatId);
    setMessages([]); // Clear current view while loading
    setIsLoading(true);

    try {
      const { data: chatMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (chatMessages) {
        setMessages(chatMessages.map(m => ({ role: m.role as any, content: m.content }))); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      setIsSidebarOpen(false); // Close mobile sidebar
    } catch (e) {
      console.error("Error loading chat", e);
      error(t('system.load_fail'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    const { error: err } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatToDelete);

    if (err) {
      error(t('system.delete_fail'));
    } else {
      success(t('system.deleted'));
      setChats(prev => prev.filter(c => c.id !== chatToDelete));
      if (currentChatId === chatToDelete) {
        setMessages([]);
        setCurrentChatId(null);
      }
    }
  };



  const handleSearch = async (query: string) => {
    // 1. Check Auth
    if (!user) {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Check Subscription
    if (!hasSubscription) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // 3. Check Empty Input
    if (!query.trim()) {
      error(t('system.enter_message'));
      return;
    }

    const userMsg: Message = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Play Send Sound immediately when user sends a message
    // "Send First" if this is the first message (meaning previous messages length was 0), 
    // otherwise "Send Reply"
    const isFirstMessage = messages.length === 0;
    soundManager.play(isFirstMessage ? 'send_first' : 'send_reply', currentModel);

    setIsLoading(true);

    // Save to DB
    let chatIdToUse = currentChatId;

    // Create new chat if none exists
    if (!chatIdToUse) {
      try {
        // Generate a title from the first few words
        const title = query.slice(0, 30) + (query.length > 30 ? '...' : '');
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({ user_id: user.id, title })
          .select()
          .single();

        if (newChat && !chatError) {
          chatIdToUse = newChat.id;
          setCurrentChatId(newChat.id);
          setChats(prev => [newChat, ...prev]);
        }
      } catch (e) {
        console.error("Error creating chat", e);
      }
    }

    // Save User Message
    if (chatIdToUse) {
      await supabase.from('messages').insert({
        chat_id: chatIdToUse,
        role: 'user',
        content: query
      });

      // Touch chat to update updated_at
      const now = new Date().toISOString();
      await supabase.from('chats').update({ updated_at: now }).eq('id', chatIdToUse);

      // Update local chats state to move to top
      setChats(prev => {
        const chat = prev.find(c => c.id === chatIdToUse);
        if (chat) {
          const updated = { ...chat, updated_at: now };
          return [updated, ...prev.filter(c => c.id !== chatIdToUse)];
        }
        return prev;
      });
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
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
      }

      // Save Assistant Message
      if (chatIdToUse) {
        await supabase.from('messages').insert({
          chat_id: chatIdToUse,
          role: 'assistant',
          content: streamedContent
        });

        // Touch chat to update updated_at again (after response finished)
        const now = new Date().toISOString();
        await supabase.from('chats').update({ updated_at: now }).eq('id', chatIdToUse);

        // Re-sync local state
        setChats(prev => {
          const chat = prev.find(c => c.id === chatIdToUse);
          if (chat) {
            const updated = { ...chat, updated_at: now };
            return [updated, ...prev.filter(c => c.id !== chatIdToUse)];
          }
          return prev;
        });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('system.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'base' | 'ultra') => {
    setIsUpgradeModalOpen(false);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };



  return (
    <main className="relative min-h-screen w-full overflow-x-hidden transition-colors duration-500 bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      <CustomCursor isPortal={currentModel === 'portal'} />

      {/* Sidebar */}
      {user && (
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={(id) => {
            setChatToDelete(id);
            setIsConfirmDeleteOpen(true);
          }}
        />
      )}



      {/* Animated Gradient Background */}
      {showGradient && (
        <motion.div
          style={{ opacity: bgOpacity }}
          className="fixed inset-0 z-0 transition-opacity duration-300 ease-out"
        >
          <AnimatePresence>
            {currentModel === 'portal' ? (
              <motion.div
                key="portal-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="fixed inset-0"
              >
                <GlassSphereBackground theme={theme} isPortal={true} />
              </motion.div>
            ) : (
              <motion.div
                key="standard-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="fixed inset-0"
              >
                <AnimatedGradient theme={theme} isPortal={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Background Effect */}
      <div className="bg-smoke" />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-4 md:px-12 md:py-6 bg-[var(--card-bg)] backdrop-blur-md border-b border-[var(--card-border)] transition-colors">
        <div className="flex items-center gap-3 md:gap-8 h-full shrink-0">
          <div
            className="text-lg md:text-2xl font-medium tracking-tight cursor-pointer hover:opacity-80 transition-opacity leading-none flex items-center whitespace-nowrap"
            onClick={() => {
              if (messages.length > 0 || currentChatId) {
                setMessages([]);
                setCurrentChatId(null);
                if (window.history.state?.view === 'chat') {
                  window.history.back();
                }
              }
            }}
          >
            Léger AI
          </div>
          {messages.length === 0 && (
            <Link
              href="/pricing"
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[var(--foreground)]/20 bg-[var(--foreground)]/5 text-[10px] md:text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300 shadow-sm uppercase flex items-center justify-center whitespace-nowrap shrink-0"
            >
              {t('general.pricing')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-1.5 md:gap-3">
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all cursor-pointer shadow-sm"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || 'User'}
                    className="w-5 h-5 md:w-5 md:h-5 rounded-full border border-[var(--card-border)] shrink-0"
                  />
                ) : (
                  <UserIcon size={16} className="text-[var(--foreground)]/60" />
                )}
                <span className="hidden md:block text-xs font-semibold max-w-[100px] truncate uppercase leading-none">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="md:hidden text-[10px] font-semibold uppercase leading-none">
                  {/* Mobile: Show nothing or maybe initials if needed, but icon is enough */}
                </span>
              </button>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-1.5 md:p-2 rounded-full text-[var(--foreground)]/60 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shadow-sm shrink-0"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('signin');
                setIsAuthModalOpen(true);
              }}
              className="text-sm font-medium px-5 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all active:scale-95 shadow-sm"
            >
              {t('general.signin')}
            </button>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
      />

      {user && (
        <>
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            subscriptionStatus={subscriptionStatus}
            onProfileUpdate={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              setUser(session?.user ?? null);
            }}
          />
          <ConfirmDialog
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            onConfirm={handleDeleteChat}
            title={t('general.delete_chat_title')}
            message={t('general.delete_chat_msg')}
            confirmText={t('general.confirm_delete')}
            isDestructive={true}
          />
          <ConfirmDialog
            isOpen={isLogoutConfirmOpen}
            onClose={() => setIsLogoutConfirmOpen(false)}
            onConfirm={async () => {
              await signOut();
              setIsLogoutConfirmOpen(false);
              window.location.reload();
            }}
            title={t('general.signout')}
            message={t('general.signout') + "?"}
            confirmText={t('general.signout')}
            isDestructive={false}
          />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 pt-24 min-h-screen flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {messages.length === 0 && !currentChatId ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)', y: -40 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 flex flex-col items-center"
            >
              <Hero
                onSearch={handleSearch}
                user={user}
                hasSubscription={hasSubscription}
                onShowAuthModal={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                onShowUpgradeModal={() => setIsUpgradeModalOpen(true)}
                currentModel={currentModel}
                onModelChange={handleModelChange}
                isUltra={subscriptionTier === 'ultra'}
              />
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
                onModelChange={handleModelChange}
                isUltra={plan === 'ultra'}
                user={user}
                hasSubscription={hasSubscription}
                subscriptionTier={subscriptionTier}
                onShowAuthModal={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                onShowUpgradeModal={() => setIsUpgradeModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer (only on Home) */}
      {messages.length === 0 && (
        <footer className="w-full py-12 text-center text-sm text-gray-400 font-serif italic">
          <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
        </footer>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
