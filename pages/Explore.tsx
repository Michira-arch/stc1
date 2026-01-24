
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Search, Hash, Frown, Flame, TrendingUp } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StoryCard } from '../components/StoryCard';

interface Props {
   onStoryClick: (id: string) => void;
}

const TRENDING_TAGS = ['Campus', 'Coding', 'Coffee', 'Rant', 'Advice', 'Art', 'LateNight'];

export const Explore: React.FC<Props> = ({ onStoryClick }) => {
   const { stories } = useApp();
   const [searchQuery, setSearchQuery] = useState('');
   const [activeTag, setActiveTag] = useState<string | null>(null);

   // Fix: Scroll to top on mount to prevent auto-scroll to bottom
   React.useLayoutEffect(() => {
      window.scrollTo(0, 0);
   }, []);

   const filteredStories = useMemo(() => {
      let result = stories;

      if (activeTag) {
         result = result.filter(s =>
            (s.title + s.content).toLowerCase().includes(activeTag.toLowerCase())
         );
      }

      if (searchQuery.trim()) {
         const q = searchQuery.toLowerCase();
         result = result.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q)
         );
      }

      // Filter hidden unless it's your own is handled in Feed, but here we might just show public
      let final = result.filter(s => !s.isHidden);

      // If no search/tag, sort by popularity (Trending)
      if (!activeTag && !searchQuery.trim()) {
         final = final.sort((a, b) => b.likes.length - a.likes.length);
      }

      return final;
   }, [stories, searchQuery, activeTag]);

   return (
      <div className="pt-6 pb-32 px-4 max-w-2xl mx-auto min-h-screen flex flex-col">
         <header className="mb-6">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 mb-2">
               Explore
            </h1>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories, people, vibes..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none text-slate-700 dark:text-slate-200
                           bg-ceramic-base dark:bg-obsidian-surface
                           shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]
                           dark:shadow-[inset_4px_4px_8px_#151618,inset_-4px_-4px_8px_#35363e]
                           transition-shadow focus:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
               />
            </div>
         </header>

         {/* Trending Section */}
         <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 px-2">
               <Flame className="text-orange-500" size={20} />
               <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Trending Now</h2>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar px-2 -mx-2">
               {TRENDING_TAGS.map(tag => {
                  const isActive = activeTag === tag;
                  return (
                     <button
                        key={tag}
                        onClick={() => setActiveTag(isActive ? null : tag)}
                        className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border
                                    ${isActive
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] scale-105'
                              : 'bg-ceramic-base dark:bg-obsidian-surface text-slate-600 dark:text-slate-400 border-white/50 dark:border-white/5 shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff] dark:shadow-[5px_5px_10px_#151618,-5px_-5px_10px_#35363e]'
                           }`}
                     >
                        <Hash size={14} className={isActive ? 'text-white/80' : 'text-emerald-500'} />
                        {tag}
                        {isActive && <motion.div layoutId="activeTag" className="absolute inset-0 rounded-2xl ring-2 ring-white/20" />}
                     </button>
                  );
               })}
            </div>
         </div>

         {/* Results */}
         <div className="space-y-6">
            <AnimatePresence mode='popLayout'>
               {filteredStories.length > 0 ? (
                  filteredStories.map(story => (
                     <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story.id)} />
                  ))
               ) : (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="flex flex-col items-center justify-center py-16 text-slate-400 opacity-60 text-center"
                  >
                     <div className="w-24 h-24 rounded-full bg-ceramic-surface dark:bg-obsidian-surface flex items-center justify-center mb-4 shadow-inner">
                        <Frown size={40} />
                     </div>
                     <h3 className="text-lg font-bold mb-1">No stories found</h3>
                     <p className="text-sm">Try searching for something else or select a different tag.</p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
};
