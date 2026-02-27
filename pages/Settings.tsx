import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Sun, Moon, Type, Italic, MessageSquare, Shield } from 'lucide-react';
import { FileText, Scale } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CarvedButton } from '../components/CarvedButton';
import { InstallAppButton } from '../components/InstallAppButton';

import { useNotificationPreference } from '../src/hooks/useNotificationPreference';

interface Props {
  onBack: () => void;
  onOpenFeedback?: () => void;
  onNavigate?: (page: string) => void;
}

export const Settings: React.FC<Props> = ({ onBack, onOpenFeedback, onNavigate }) => {
  const { settings, updateSettings, showToast, deferredPrompt, installApp, theme, toggleTheme, clayMode, toggleClayMode, colorfulMode, toggleColorfulMode, sleekMode, toggleSleekMode, currentUser, updatePrivacySettings, isGuest, isOnline } = useApp();
  const privacy = currentUser.privacySettings || { showBio: true, showTimeline: true, showName: true };

  const { notificationsEnabled, setNotificationsEnabled } = useNotificationPreference();

  // Detect Desktop (Hover capable + Fine pointer)
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleUpdate = (newSettings: Partial<typeof settings>, skipToast: boolean = false) => {
    updateSettings(newSettings);
    if (!skipToast) {
      showToast('Settings updated', 'success');
    }

    if (newSettings.fontFamily && newSettings.fontFamily !== 'sans') {
      if (settings.textScale < 1.2) {
        setTimeout(() => {
          showToast('For cursive fonts, consider increasing the text size for better readability.', 'info');
        }, 1500); // slight delay so it doesn't overlap the success toast completely
      }
    }
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
      drag={typeof window !== 'undefined' && window.innerWidth <= 768 && 'ontouchstart' in window ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.5 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100 || info.velocity.x > 500) {
          onBack();
        }
      }}
      className="fixed inset-0 z-50 bg-ceramic-base dark:bg-obsidian-base overflow-y-auto pt-safe pb-safe touch-pan-y"
    >
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center bg-ceramic-base/90 dark:bg-obsidian-base/90 backdrop-blur-lg">
        <CarvedButton onClick={onBack} className="!w-12 !h-12 !rounded-full mr-4">
          <ArrowLeft size={20} />
        </CarvedButton>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8">

        {/* Privacy Settings */}
        {!isGuest && (
          <div className="mb-8 p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface neu-convex">
            <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400">
              <Shield size={24} />
              <h3 className="font-bold text-lg">Privacy</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Show Name</span>
                <div
                  onClick={() => updatePrivacySettings({ showName: !privacy.showName })}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${privacy.showName ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${privacy.showName ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Show Bio</span>
                <div
                  onClick={() => updatePrivacySettings({ showBio: !privacy.showBio })}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${privacy.showBio ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${privacy.showBio ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Show Timeline</span>
                <div
                  onClick={() => updatePrivacySettings({ showTimeline: !privacy.showTimeline })}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${privacy.showTimeline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${privacy.showTimeline ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Control what others see when visiting your profile.
              </p>
            </div>
          </div>
        )}

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

          {/* Clay Mode Toggle */}
          <CarvedButton
            active={clayMode}
            onClick={toggleClayMode}
            className="w-full py-4 flex justify-between px-6 mb-4"
          >
            <div className="flex items-center gap-3">
              <span role="img" aria-label="clay">🏺</span>
              <span>Clay Mode</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${clayMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${clayMode ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>

          {/* Colorful Mode Toggle - Only visible if Clay Mode is ON */}
          {clayMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CarvedButton
                active={colorfulMode}
                onClick={toggleColorfulMode}
                className="w-full py-4 flex justify-between px-6 mb-4"
              >
                <div className="flex items-center gap-3">
                  <span role="img" aria-label="rainbow">🌈</span>
                  <span>Colorful Mode</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${colorfulMode ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${colorfulMode ? 'left-6' : 'left-1'}`} />
                </div>
              </CarvedButton>
            </motion.div>
          )}

          {/* Sleek Mode Toggle */}
          <CarvedButton
            active={sleekMode}
            onClick={toggleSleekMode}
            className="w-full py-4 flex justify-between px-6 mb-4"
          >
            <div className="flex items-center gap-3">
              <span role="img" aria-label="sparkles">✨</span>
              <span>Sleek Mode</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${sleekMode ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${sleekMode ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>

          {/* Dark Mode */}
          <CarvedButton
            active={theme === 'dark'}
            onClick={toggleTheme}
            className={`w-full py-4 flex justify-between px-6 ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{isOnline ? 'Dark Mode' : 'Dark Mode (Offline Locked)'}</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>

          {/* Hide AI Icon */}
          <CarvedButton
            active={!!settings.hideAIIcon}
            onClick={() => handleUpdate({ hideAIIcon: !settings.hideAIIcon })}
            className="w-full py-4 flex justify-between px-6 mb-4"
          >
            <div className="flex items-center gap-3">
              <span role="img" aria-label="robot">🤖</span>
              <span>Hide AI Assistant Icon</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.hideAIIcon ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${settings.hideAIIcon ? 'left-6' : 'left-1'}`} />
            </div>
          </CarvedButton>

          {/* Push Notifications - HIDDEN ON DESKTOP */}
          {!isDesktop && (
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
          )}

          {/* Install App */}
          <InstallAppButton variant="settings" className="w-full py-4 flex justify-between px-6" />
        </section>

        {/* Font Size Section */}
        <section>
          <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
            <Type size={16} /> Typography Size
          </h2>

          <div className="mb-6 px-2">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Small</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={settings.textScale}
              onChange={(e) => handleUpdate({ textScale: parseFloat(e.target.value) }, true)}
              onPointerUp={() => showToast('Text scale updated', 'success')}
              onTouchEnd={() => showToast('Text scale updated', 'success')}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-emerald-500"
            />
            <div className="text-center mt-2 font-mono text-xs text-slate-400">
              Scale: {Math.round(settings.textScale * 100)}%
            </div>
          </div>

          {/* Family */}
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Font Style</h3>
          <div
            className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center"
            style={{
              fontFamily: settings.fontFamily === 'sans' || !settings.fontFamily ? 'Outfit, sans-serif' :
                settings.fontFamily === 'luxurious' ? '"Luxurious Script", cursive' :
                  settings.fontFamily === 'imperial' ? '"Imperial Script", cursive' :
                    'Tangerine, cursive'
            }}
          >
            <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm mt-1 opacity-70">1234 567 890</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CarvedButton
              active={settings.fontFamily === 'sans' || !settings.fontFamily}
              onClick={() => handleUpdate({ fontFamily: 'sans' })}
              className="py-3"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Modern (Default)
            </CarvedButton>
            <CarvedButton
              active={settings.fontFamily === 'luxurious'}
              onClick={() => handleUpdate({ fontFamily: 'luxurious' })}
              className="py-3 text-lg"
              style={{ fontFamily: '"Luxurious Script", cursive' }}
            >
              Luxurious
            </CarvedButton>
            <CarvedButton
              active={settings.fontFamily === 'imperial'}
              onClick={() => handleUpdate({ fontFamily: 'imperial' })}
              className="py-3 text-xl"
              style={{ fontFamily: '"Imperial Script", cursive' }}
            >
              Imperial
            </CarvedButton>
            <CarvedButton
              active={settings.fontFamily === 'tangerine'}
              onClick={() => handleUpdate({ fontFamily: 'tangerine' })}
              className="py-3 text-2xl"
              style={{ fontFamily: 'Tangerine, cursive' }}
            >
              Tangerine
            </CarvedButton>
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

        {/* Legal Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Legal</h2>

          {/* Privacy Policy */}
          <CarvedButton
            onClick={() => window.open('/privacy_policy.html', '_blank')}
            className="w-full py-4 flex justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span>Privacy Policy</span>
            </div>
          </CarvedButton>

          {/* Terms of Service */}
          <CarvedButton
            onClick={() => window.open('/terms_of_service.html', '_blank')}
            className="w-full py-4 flex justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <Scale size={18} />
              <span>Terms of Service</span>
            </div>
          </CarvedButton>
        </section>

        {/* Preview */}
        <section className="mt-10">
          <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest">Preview</h2>
          <div className="p-6 rounded-3xl bg-ceramic-base dark:bg-obsidian-surface 
                            shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] 
                            dark:shadow-[10px_10px_20px_#151618,-10px_-10px_20px_#35363e]">
            <p className={`text-base ${settings.isItalic ? 'italic' : ''} text-slate-600 dark:text-slate-300`}>
              "The details are not the details. They make the design."
            </p>
          </div>
        </section>

      </div>
    </motion.div>
  );
};