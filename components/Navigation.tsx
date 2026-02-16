import React, { useState, useEffect, useRef } from 'react';
import { House, Compass, PenTool, User as UserIcon, ChevronDown, Video, Calendar } from 'lucide-react';
import { CarvedButton } from './CarvedButton';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const navItems = [
    { id: 'feed', icon: <House size={24} />, label: 'Home' },
    { id: 'events', icon: <Calendar size={24} />, label: 'Events' },
    { id: 'explore', icon: <Compass size={24} />, label: 'Explore' },
    // { id: 'meet', icon: <Video size={24} />, label: 'Meet' }, // Removed from Dock
    { id: 'editor', icon: <PenTool size={24} />, label: 'Create' },
    { id: 'profile', icon: <UserIcon size={24} />, label: 'Profile' },
  ];

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0];

  // Onboarding Logic
  const [showCollapseHint, setShowCollapseHint] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(false);

  useEffect(() => {
    // Check if user has seen the collapse hint
    const hasSeenCollapse = localStorage.getItem('dock_onboarding_collapse');
    if (!hasSeenCollapse) {
      const timer = setTimeout(() => {
        setShowCollapseHint(true);
      }, 60000); // 1 minute
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(true);
    setShowCollapseHint(false);
    localStorage.setItem('dock_onboarding_collapse', 'true');

    // Show gesture hint if first time collapsing
    const hasSeenGesture = localStorage.getItem('dock_onboarding_gesture');
    if (!hasSeenGesture) {
      setShowGestureHint(true);
      localStorage.setItem('dock_onboarding_gesture', 'true');
      setTimeout(() => setShowGestureHint(false), 4000);
    }
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Reset dragging flag after a short delay to block immediate clicks
    setTimeout(() => {
      isDragging.current = false;
    }, 150);

    const { innerWidth, innerHeight } = window;
    const buttonSize = 88;
    const radius = buttonSize / 2;
    const margin = 16;

    // Layout origin is center-bottom: (innerWidth/2, innerHeight - 44)
    const layoutCenterX = innerWidth / 2;
    const layoutCenterY = innerHeight - 44;

    const currentX = info.point.x;
    const currentY = info.point.y;

    // Define snap targets (coordinate centers)
    const targets = {
      left: { x: radius + margin, y: currentY },
      right: { x: innerWidth - radius - margin, y: currentY },
      top: { x: currentX, y: radius + margin },
      bottom: { x: currentX, y: innerHeight - 44 }
    };

    // Calculate distances
    const distLeft = Math.abs(currentX - (radius + margin));
    const distRight = Math.abs(currentX - (innerWidth - radius - margin));
    const distTop = Math.abs(currentY - (radius + margin));
    const distBottom = Math.abs(currentY - (innerHeight - 44));

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let targetX = currentX;
    let targetY = currentY;

    if (minDist === distLeft) {
      targetX = targets.left.x;
      targetY = Math.max(radius + margin, Math.min(innerHeight - radius - margin, currentY));
    } else if (minDist === distRight) {
      targetX = targets.right.x;
      targetY = Math.max(radius + margin, Math.min(innerHeight - radius - margin, currentY));
    } else if (minDist === distTop) {
      targetX = Math.max(radius + margin, Math.min(innerWidth - radius - margin, currentX));
      targetY = targets.top.y;
    } else {
      // Bottom Snap
      targetX = Math.max(radius + margin, Math.min(innerWidth - radius - margin, currentX));
      targetY = innerHeight - 44;
    }

    // Convert absolute target to relative delta
    const deltaX = targetX - layoutCenterX;
    const deltaY = targetY - layoutCenterY;

    setDragPosition({ x: deltaX, y: deltaY });
  };

  const handleCollapsedClick = () => {
    if (isDragging.current) return;
    setIsCollapsed(false);
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-end justify-center">
      {/* Onboarding Bubble */}
      <AnimatePresence>
        {showCollapseHint && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-1/2 translate-x-[60px] bg-accent text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg pointer-events-auto whitespace-nowrap"
            onClick={() => { setShowCollapseHint(false); localStorage.setItem('dock_onboarding_collapse', 'true'); }}
          >
            Try collapsing the dock!
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rotate-45" />
          </motion.div>
        )}
        {showGestureHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-32 left-0 right-0 mx-auto w-max bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-2xl z-50 pointer-events-none flex items-center gap-3"
          >
            <span>Drag to snap</span>
            <motion.div
              animate={{ x: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-8 h-8 rounded-full border-2 border-white/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag={isCollapsed}
        dragMomentum={false}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={false}
        animate={{
          width: isCollapsed ? 88 : "auto",
          height: 88, // Constant height prevents vertical squashing

          borderTopLeftRadius: isCollapsed ? 44 : 32,
          borderTopRightRadius: isCollapsed ? 44 : 32,
          borderBottomLeftRadius: isCollapsed ? 44 : 0,
          borderBottomRightRadius: isCollapsed ? 44 : 0,

          padding: isCollapsed ? 0 : "0 24px",

          // Position Handling
          x: isCollapsed ? dragPosition.x : '-50%', // Centered when expanded
          y: isCollapsed ? dragPosition.y : 0,
        }}
        transition={{
          type: "spring",
          bounce: isCollapsed ? 0.1 : 0.2,
          duration: 0.5
        }}
        className="pointer-events-auto bg-transparent backdrop-blur-xl
                    neu-convex border-t border-x border-white/5 shadow-2xl overflow-hidden fixed bottom-0 left-1/2
                    flex items-center justify-center max-w-md w-full z-50"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.3 }}
              className="flex justify-center gap-4 items-center w-full min-w-0 pb-2"
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

              {/* Collapse Trigger */}
              <motion.button
                layout
                onClick={handleCollapse}
                className="ml-2 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm relative overflow-hidden"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-accent/10 rounded-full"
                />
                <ChevronDown size={20} strokeWidth={3} className="relative z-10" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              layoutId={`dock-item-${activeItem.id}`} // Match the active item's ID
              key="collapsed"
              onClick={handleCollapsedClick}
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