import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Type, Italic, Download, Bell, MessageSquare, Moon, Sun } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CarvedButton } from '../components/CarvedButton';

interface Props {
  onBack: () => void;
  onOpenFeedback?: () => void;
}

export const Settings: React.FC<Props> = ({ onBack, onOpenFeedback }) => {
  const { settings, updateSettings, showToast, deferredPrompt, installApp, theme, toggleTheme } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleUpdate = (newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
    showToast('Settings updated', 'success');
  };

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    if (newVal) showToast("Push notifications enabled", "success");
    else showToast("Push notifications disabled", "info");
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-ceramic-base dark:bg-obsidian-base overflow-y-auto"
    >
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center bg-ceramic-base/90 dark:bg-obsidian-base/90 backdrop-blur-lg">
        <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full mr-4">
          <ArrowLeft size={20} />
        </CarvedButton>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8">

        {/* App Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Application</h2>

          {/* Feedback */}
          {onOpenFeedback && (
            <CarvedButton onClick={onOpenFeedback} className="w-full py-4 flex justify-between px-6">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                <span>Send Feedback</span>
              </div>
            </CarvedButton>
          )}

          {/* Dark Mode */}
          <CarvedButton
            active={theme === 'dark'}
            onClick={toggleTheme}
            className="w-full py-4 flex justify-between px-6"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>Dark Mode</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>

          {/* Push Notifications */}
          <CarvedButton
            active={notificationsEnabled}
            onClick={toggleNotifications}
            className="w-full py-4 flex justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Push Notifications</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>

          {/* Install App */}
          {deferredPrompt && (
            <CarvedButton onClick={installApp} className="w-full py-4 flex justify-between px-6 text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-3">
                <Download size={18} />
                <span>Install as App</span>
              </div>
            </CarvedButton>
          )}
        </section>

        {/* Font Size Section */}
        <section>
          <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
            <Type size={16} /> Typography Size
          </h2>
          <div className="flex gap-4">
            {(['sm', 'base', 'lg'] as const).map((size) => (
              <CarvedButton
                key={size}
                active={settings.fontSize === size}
                onClick={() => handleUpdate({ fontSize: size })}
                className="flex-1 py-4 capitalize"
              >
                {size === 'sm' ? 'Small' : size === 'base' ? 'Normal' : 'Large'}
              </CarvedButton>
            ))}
          </div>
        </section>

        {/* Styling Section */}
        <section>
          <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
            <Italic size={16} /> Text Style
          </h2>
          <CarvedButton
            active={settings.isItalic}
            onClick={() => handleUpdate({ isItalic: !settings.isItalic })}
            className="w-full py-4 flex justify-between px-6"
          >
            <span>Italicize Text</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.isItalic ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${settings.isItalic ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>
        </section>

        {/* Preview */}
        <section className="mt-10">
          <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest">Preview</h2>
          <div className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface 
                            shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] 
                            dark:shadow-[10px_10px_20px_#151618,-10px_-10px_20px_#35363e]">
            <p className={`text-${settings.fontSize} ${settings.isItalic ? 'italic' : ''} text-slate-600 dark:text-slate-300`}>
              "The details are not the details. They make the design."
            </p>
          </div>
        </section>

      </div>
    </motion.div>
  );
};