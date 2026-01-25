import React, { useState } from 'react';
import { House, Compass, PenTool, User as UserIcon, ChevronDown, ChevronUp, Video } from 'lucide-react';
import { CarvedButton } from './CarvedButton';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'feed', icon: <House size={24} />, label: 'Home' },
    { id: 'explore', icon: <Compass size={24} />, label: 'Explore' },
    { id: 'meet', icon: <Video size={24} />, label: 'Meet' },
    { id: 'editor', icon: <PenTool size={24} />, label: 'Create' },
    { id: 'profile', icon: <UserIcon size={24} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md flex justify-center pointer-events-none">
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 64 : "90%",
          height: isCollapsed ? 64 : 72,
          borderRadius: isCollapsed ? 32 : 24,
          padding: isCollapsed ? 0 : 8,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="pointer-events-auto bg-ceramic-base dark:bg-obsidian-surface
                    neu-convex border border-white/5 shadow-2xl overflow-hidden relative
                    flex items-center justify-center"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex justify-between items-center w-full min-w-0"
            >
              {navItems.map((item) => (
                <CarvedButton
                  key={item.id}
                  active={activeTab === item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`!w-14 !h-14 !rounded-2xl transition-all duration-300 flex-shrink-0 ${activeTab === item.id ? 'text-accent-glow' : ''}`}
                >
                  <div className={`${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]' : ''}`}>
                    {item.icon}
                  </div>
                </CarvedButton>
              ))}

              {/* Collapse Trigger */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="ml-2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
              >
                <ChevronDown size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              onClick={() => setIsCollapsed(false)}
              className="w-full h-full flex items-center justify-center text-accent-glow"
            >
              <House size={24} className="drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};