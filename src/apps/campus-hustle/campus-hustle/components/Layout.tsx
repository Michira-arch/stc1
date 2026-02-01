import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { Home, List, ShoppingBag, PenTool, User, Moon, Sun, Menu, X } from 'lucide-react';
import { NeuButton } from './Neu';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { id: ViewState.DASHBOARD, icon: <Home size={20} />, label: 'Dashboard' },
    { id: ViewState.BOUNTY_BOARD, icon: <List size={20} />, label: 'Bounty Board' },
    { id: ViewState.MARKETPLACE, icon: <ShoppingBag size={20} />, label: 'Marketplace' },
    { id: ViewState.TOOLS, icon: <PenTool size={20} />, label: 'Tools' },
    // { id: ViewState.PROFILE, icon: <User size={20} />, label: 'Profile' },
  ];

  const currentIcon = navItems.find(item => item.id === currentView)?.icon || <Home size={20} />;

  return (
    <div className="min-h-screen bg-ceramic dark:bg-obsidian transition-colors duration-300 flex overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 p-6 fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Campus<span className="text-emerald-500">Hustle</span></h1>
        </div>

        <nav className="flex-1 space-y-4">
          {navItems.map((item) => (
            <NeuButton
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full justify-start ${currentView === item.id ? 'text-emerald-500' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NeuButton>
          ))}
        </nav>

        <div className="pt-6">
            <NeuButton onClick={() => setDarkMode(!darkMode)} className="w-full">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </NeuButton>
        </div>
      </aside>

      {/* Mobile Header (simplified) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-ceramic/90 dark:bg-obsidian/90 backdrop-blur-md pointer-events-none">
         <div className="flex items-center gap-2 pointer-events-auto">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white font-bold">H</span>
            </div>
            <h1 className="font-bold text-slate-800 dark:text-white">Campus<span className="text-emerald-500">Hustle</span></h1>
        </div>
        <div className="pointer-events-auto">
             <NeuButton onClick={() => setDarkMode(!darkMode)} className="!p-2 !rounded-full w-10 h-10 flex items-center justify-center">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </NeuButton>
        </div>
      </div>

      {/* Mobile Floating Nav (Bottom Right) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          
          {/* Expanded Menu Items */}
          {isNavExpanded && (
             <div className="flex flex-col gap-3 animate-[fade-in-up_0.2s_ease-out] mb-2">
                {navItems.filter(item => item.id !== currentView).map(item => (
                   <div key={item.id} className="flex items-center justify-end gap-3 group">
                      <span className="bg-ceramic/90 dark:bg-obsidian/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium shadow-md text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.label}
                      </span>
                      <NeuButton
                        className="!w-12 !h-12 !rounded-full !p-0 flex items-center justify-center"
                        onClick={() => { setView(item.id); setIsNavExpanded(false); }}
                      >
                         {item.icon}
                      </NeuButton>
                   </div>
                ))}
             </div>
          )}

          {/* Main FAB Toggle */}
          <NeuButton
             variant="primary"
             className="!w-16 !h-16 !rounded-full !p-0 flex items-center justify-center shadow-xl z-50"
             onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
             <div className={`transition-transform duration-300 ${isNavExpanded ? 'rotate-180' : ''}`}>
                 {isNavExpanded ? <X size={28} /> : currentIcon}
             </div>
          </NeuButton>
       </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 pt-24 md:pt-6 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-6xl mx-auto pb-24 md:pb-10">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;