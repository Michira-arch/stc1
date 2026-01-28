import React, { useState } from 'react';
import { House, Compass, PenTool, User as UserIcon, ChevronDown, Video } from 'lucide-react';
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

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <div className="fixed bottom-6 left-0 right-0 mx-auto z-40 w-full max-w-md flex items-center justify-center pointer-events-none">
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 88 : "auto",
          height: 88, // Constant height prevents vertical squashing
          borderRadius: isCollapsed ? 44 : 32, // 44px is exactly half of 88px (circle)
          padding: isCollapsed ? 0 : "0 24px",
        }}
        transition={{
          type: "spring",
          bounce: isCollapsed ? 0 : 0.25, // No bounce on collapse (prevents squashing), bounce on expand
          duration: 0.5
        }}
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
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.3 }}
              className="flex justify-center gap-4 items-center w-full min-w-0" // Reduced gap slightly
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <CarvedButton
                    key={item.id}
                    layoutId={`dock-item-${item.id}`} // Shared layout ID base
                    active={isActive}
                    onClick={() => onTabChange(item.id)}
                    className={`!w-12 !h-12 sm:!w-14 sm:!h-14 !rounded-2xl transition-all duration-300 flex-shrink-0 relative ${isActive ? 'text-accent-glow z-10' : 'z-0'}`}
                  >
                    <div className={`${isActive ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]' : ''}`}>
                      {item.icon}
                    </div>
                  </CarvedButton>
                );
              })}

              {/* Collapse Trigger - Separated to avoid layout interference */}
              <motion.button
                layout
                onClick={() => setIsCollapsed(true)}
                className="ml-2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
              >
                <ChevronDown size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              layoutId={`dock-item-${activeItem.id}`} // Match the active item's ID
              key="collapsed"
              onClick={() => setIsCollapsed(false)}
              className="w-full h-full flex items-center justify-center text-accent-glow relative z-10"
              whileTap={{ scale: 0.9 }}
            >
              <div className="drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">
                {activeItem.icon}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};