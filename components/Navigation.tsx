import React from 'react';
import { House, Compass, PenTool, User as UserIcon } from 'lucide-react';
import { CarvedButton } from './CarvedButton';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'feed', icon: <House size={24} />, label: 'Home' },
    { id: 'explore', icon: <Compass size={24} />, label: 'Explore' },
    { id: 'editor', icon: <PenTool size={24} />, label: 'Create' },
    { id: 'profile', icon: <UserIcon size={24} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
      <div className="flex justify-between items-center p-2 rounded-3xl 
                      bg-ceramic-base dark:bg-obsidian-surface
                      neu-convex border border-white/5 shadow-2xl">
        {navItems.map((item) => (
          <CarvedButton
            key={item.id}
            active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            className={`!w-14 !h-14 !rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-accent-glow' : ''}`}
          >
            <div className={`${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]' : ''}`}>
              {item.icon}
            </div>
          </CarvedButton>
        ))}
      </div>
    </div>
  );
};