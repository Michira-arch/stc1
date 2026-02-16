import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '../store/AppContext';
import { StoryCard } from '../components/StoryCard';
import { motion } from 'framer-motion';
import { Sun, Moon, Download, Grid } from 'lucide-react';
import { Loader } from '../components/Loader';
import { CarvedButton } from '../components/CarvedButton';
import { Logo } from '../components/Logo';

export const Feed = ({ onStoryClick, onNavigate }: { onStoryClick: (id: string) => void, onNavigate: (path: string) => void }) => {
  const { stories, currentUser, feedScrollPosition, setFeedScrollPosition, isGuest, setAuthPage, theme, toggleTheme, deferredPrompt, installApp, hasMoreStories, isLoadingMore, fetchMoreStories } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const visibleStories = stories.filter(s => !s.isHidden || s.authorId === currentUser.id);

  // Adaptive Skeleton Loading: show skeleton until stories arrive, but replace empty state with Loader on delay/offline
  useEffect(() => {
    if (stories.length > 0) {
      setIsLoading(false);
      return;
    }
    // Extended timeout to allow for "delayed" state perception before showing strictly empty state
    // Actually, we want to SHOW the loader if there's a delay.
    // So let's keep isLoading true for a bit (Skeleton), then maybe switch to Loader logic if we want?
    // User request: "shows when there's a delay in loading stories, instead of showing 'no stories yet'"
    // Implementation: 
    // 1. isLoading = true (Standard Skeleton)
    // 2. After 2s, isLoading = false. 
    // 3. Render logic: If visibleStories.length === 0, show Loader instead of "No stories yet".

    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [stories.length]);

  // Scroll Persistence
  const scrollRef = useRef(feedScrollPosition);

  // 1. Restore scroll position only when loading is done
  useLayoutEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, feedScrollPosition);
      scrollRef.current = feedScrollPosition;
    }
  }, [isLoading, feedScrollPosition]);

  // 2. Track scroll position continuously
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // 2. Track scroll position continuously for header collapse
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Collapse logic
      if (currentScrollY > 50) { // Only collapse after some scrolling
        if (currentScrollY > lastScrollY.current + 10) {
          // Scrolling Down
          setShowHeader(false);
        } else if (currentScrollY < lastScrollY.current - 10) {
          // Scrolling Up
          setShowHeader(true);
        }
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
      scrollRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Save scroll position on unmount... (keep existing)
  useEffect(() => {
    return () => {
      setFeedScrollPosition(scrollRef.current);
    };
  }, [setFeedScrollPosition]);

  // --- Infinite Scroll ---
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const sentinelCallback = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
  }, []);

  useEffect(() => {
    if (!sentinelRef.current || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreStories && !isLoadingMore) {
          fetchMoreStories();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before the sentinel is visible
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMoreStories, isLoadingMore, isLoading, fetchMoreStories]);

  const handleStoryClick = (id: string) => {
    // Unmount effect will handle saving scroll
    onStoryClick(id);
  };

  return (
    <div
      className="pt-4 pb-32 px-4 max-w-2xl mx-auto min-h-screen"
    >
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex justify-between items-center mb-8 py-4 px-6 sticky top-4 z-30 bg-ceramic-base/90 dark:bg-obsidian-base/90 backdrop-blur-xl transition-colors duration-500 rounded-3xl neu-convex"
      >
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 font-display"
            >
              StudentCenter
            </motion.h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-bold text-accent tracking-widest uppercase">Daily Feed</p>
              <button
                onClick={() => onNavigate('apps')}
                className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs uppercase font-bold px-3 py-1.5 rounded-xl shadow-[2px_2px_4px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.2)] border border-white/10 active:shadow-inner active:scale-95 transition-all"
              >
                <Grid size={14} className="drop-shadow-md" />
                <span className="drop-shadow-sm">STC APPS</span>
              </button>
            </div>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">Powered by Dispatch STC</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isGuest && (
            <CarvedButton onClick={() => setAuthPage('login')} className="!h-12 !px-4 font-bold text-xs">
              Login
            </CarvedButton>
          )}
          {deferredPrompt && (
            <CarvedButton onClick={installApp} className="!w-12 !h-12 !rounded-full text-emerald-600 dark:text-emerald-400">
              <Download size={20} />
            </CarvedButton>
          )}
          <CarvedButton onClick={toggleTheme} className="!w-12 !h-12 !rounded-full">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </CarvedButton>
        </div>
      </motion.header>

      {/* PWA Install Banner */}
      {deferredPrompt && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-6 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center"
        >
          <div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Install App</h3>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">Add to home screen for best experience.</p>
          </div>
          <CarvedButton onClick={installApp} className="!h-10 !px-4 !text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Download size={14} className="mr-1" /> Install
          </CarvedButton>
        </motion.div>
      )}

      {/* Loading Skeleton or List */}
      <div className="space-y-8 snap-y snap-mandatory">
        {isLoading ? (
          // SKELETAL SHIMMER
          [1, 2].map(i => (
            <div key={i} className="p-5 rounded-[2rem] bg-ceramic-base dark:bg-obsidian-surface shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[10px_10px_20px_#151618,-10px_-10px_20px_#35363e] h-96 animate-pulse-slow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
              </div>
              <div className="w-full h-48 bg-slate-300 dark:bg-slate-700 rounded-2xl mb-4 opacity-50" />
              <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : (
          <>
            {visibleStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(story.id)}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelCallback} className="h-4" />

            {isLoadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!hasMoreStories && visibleStories.length > 0 && (
              <div className="text-center py-10 opacity-50 snap-end">
                <p className="text-sm tracking-widest uppercase">You're all caught up</p>
                <div className="w-2 h-2 bg-accent rounded-full mx-auto mt-4 animate-pulse"></div>
              </div>
            )}

            {!isLoading && visibleStories.length === 0 && (
              <div className="flex justify-center py-10 opacity-80">
                <Loader />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};