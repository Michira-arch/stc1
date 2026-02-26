import React, { useRef } from 'react';
import { useApp } from '../store/AppContext';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Edit2, Camera, User, Download, Check, MapPin, Link as LinkIcon, Share2, Eye, Heart, Gamepad2, Bell, Video } from 'lucide-react';
import { CarvedButton } from '../components/CarvedButton';
import { timeAgo } from '../utils';
import { StoryCard } from '../components/StoryCard';
import { InstallAppButton } from '../components/InstallAppButton';
import { useFcm } from '../src/hooks/useFcm';

import { StreamingAccessModal } from '../components/StreamingAccessModal';

interface Props {
  onStoryClick: (id: string) => void;
  onOpenSettings: () => void;
  onPlayGame: () => void;
  onOpenRealtime?: () => void;
}

export const Profile: React.FC<Props> = ({ onStoryClick, onOpenSettings, onPlayGame, onOpenRealtime }) => {
  const { currentUser, stories, hiddenStories, isGuest, deferredPrompt, installApp, setManagingStoryId, updateUserImage, updateUserBio, updateUserName, setAuthPage, viewedProfile, clearViewedProfile, isOnline, showToast } = useApp();
  const [showHidden, setShowHidden] = React.useState(false);
  const { notificationPermission, requestPermission } = useFcm();

  // Determine who we are viewing
  const userToDisplay = viewedProfile || currentUser;
  const isMe = userToDisplay.id === currentUser.id;

  // Cleanup on unmount if viewing someone else
  // Cleanup on unmount if viewing someone else - REMOVED to fix race condition/strict mode issue.
  // Instead, we handle clearing in App.tsx navigation.
  /*
  React.useEffect(() => {
    return () => {
      if (!isMe) clearViewedProfile();
    };
  }, [isMe]);
  */

  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameText, setNameText] = React.useState(userToDisplay.name || '');
  const [bioText, setBioText] = React.useState(userToDisplay.bio || '');
  const [isStreamingModalOpen, setIsStreamingModalOpen] = React.useState(false);

  // Update local state when user changes
  React.useEffect(() => {
    setBioText(userToDisplay.bio || '');
    setNameText(userToDisplay.name || '');
  }, [userToDisplay]);

  // Privacy Checks
  const showBio = isMe || (userToDisplay.privacySettings?.showBio !== false); // Default true
  const showTimeline = isMe || (userToDisplay.privacySettings?.showTimeline !== false); // Default true
  const showName = isMe || (userToDisplay.privacySettings?.showName !== false); // Default true

  const myStories = stories.filter(s => s.authorId === userToDisplay.id);
  const totalLikes = myStories.reduce((acc, curr) => acc + curr.likes.length, 0);
  const totalViews = myStories.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (!isMe) return;
    const file = e.target.files?.[0];
    if (file) {
      updateUserImage(type, file);
    }
  };

  const OutsetDots = () => (
    <div className="flex flex-col gap-1 p-2 group hover:scale-110 transition-transform duration-200">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)] group-hover:shadow-[0_0_8px_rgba(16,185,129,1)] transition-shadow duration-300" />
      ))}
    </div>
  );

  if (isGuest && isMe) {
    return (
      <div className="min-h-screen p-6 pb-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-ceramic-base dark:bg-obsidian-base neu-convex flex items-center justify-center text-slate-300 dark:text-slate-600">
          <User size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Guest Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
          Sign in to view your profile, manage your stories, and customize your experience.
        </p>

        <div className="w-full max-w-xs space-y-4">
          <CarvedButton
            onClick={() => setAuthPage('login')}
            className="w-full py-4 font-bold text-emerald-600 dark:text-emerald-400 text-lg"
          >
            Sign In
          </CarvedButton>
          {deferredPrompt && (
            <CarvedButton
              onClick={installApp}
              className="w-full py-4 font-bold text-slate-500 dark:text-slate-400 text-lg"
            >
              <Download size={20} className="mr-2" /> Install App
            </CarvedButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-2xl mx-auto">
      {/* Inputs (Only if isMe) */}
      {isMe && (
        <>
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
        </>
      )}

      {/* Cover Photo */}
      <div className={`relative h-48 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden group ${isMe ? 'cursor-pointer' : ''}`} onClick={() => isMe && coverInputRef.current?.click()}>
        {userToDisplay.coverPhoto ? (
          <img src={userToDisplay.coverPhoto} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            {isMe && <span>Tap to add Cover Photo</span>}
          </div>
        )}
        {isMe && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Camera size={24} />
          </div>
        )}

        {/* Settings Button (Only for Me) */}
        {isMe && (
          <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
            <CarvedButton onClick={onOpenSettings} className="!w-10 !h-10 !rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
              <SettingsIcon size={20} />
            </CarvedButton>
          </div>
        )}
      </div>

      <div className="px-4 relative">
        {/* Avatar */}
        <div className="flex flex-col items-center -mt-16 mb-6">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={() => isMe && avatarInputRef.current?.click()}
            className={`w-32 h-32 rounded-full p-1 bg-gradient-to-br from-slate-200 to-slate-50 dark:from-slate-700 dark:to-slate-900 
                        shadow-[10px_10px_20px_rgba(0,0,0,0.2)] mb-4 relative z-10 group ${isMe ? 'cursor-pointer' : ''}`}
          >
            <img src={userToDisplay.avatar} className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-800" alt="Profile" />
            {isMe && (
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-20">
                <Camera size={20} />
              </div>
            )}
          </motion.div>

          <div className="flex items-center gap-1 justify-center mb-0">
            {isEditingName && isMe ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={nameText}
                  onChange={(e) => setNameText(e.target.value)}
                  className="bg-transparent border-b border-emerald-500 outline-none text-2xl font-bold leading-tight text-center w-full max-w-[200px]"
                  autoFocus
                  onBlur={() => {
                    // Auto-save on blur if desired, or just wait for button. Let's wait for button to match style.
                  }}
                />
                <CarvedButton onClick={() => { updateUserName(nameText); setIsEditingName(false); }} className="!h-6 !px-2 !text-[10px]">Save</CarvedButton>
              </div>
            ) : (
              <>
                {showName ? (
                  <h2
                    className={`text-2xl font-bold leading-tight ${isMe ? 'cursor-pointer hover:text-emerald-500 transition-colors' : ''}`}
                    onClick={() => isMe && setIsEditingName(true)}
                  >
                    {userToDisplay.name}
                  </h2>
                ) : (
                  <h2 className="text-2xl font-bold leading-tight text-slate-400 italic">Name Hidden</h2>
                )}
              </>
            )}

            {userToDisplay.isCertified && (
              <div className="bg-blue-500 text-white p-0.5 rounded-full shadow-sm ml-1" title="Verified">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
            {!showName && isMe && <span className="ml-2 text-xs text-slate-400 border border-slate-300 px-1 rounded">Hidden from public</span>}
          </div>
          <p className="text-slate-500 font-medium mb-1">
            @{userToDisplay.handle}
          </p>
          <p className="text-accent font-medium tracking-widest text-xs uppercase mb-1">
            {isMe ? '🌟' : '✨'}
          </p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mb-4">Powered by Dispatch STC</p>

          {/* Bio Section */}
          <div className="text-center mb-6 px-6 relative group w-full">
            {showBio ? (
              <>
                {isEditingBio && isMe ? (
                  <div className="flex flex-col items-center gap-2">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="w-full bg-transparent border border-emerald-500/50 rounded-xl p-2 text-sm text-center outline-none text-slate-600 dark:text-slate-300"
                      rows={3}
                    />
                    <CarvedButton onClick={() => { updateUserBio(bioText); setIsEditingBio(false); }} className="!h-8 !px-4 !text-xs">
                      <Check size={12} className="mr-1" /> Save Bio
                    </CarvedButton>
                  </div>
                ) : (
                  <div onClick={() => { if (isMe) { setBioText(userToDisplay.bio || ''); setIsEditingBio(true); } }} className={isMe ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {userToDisplay.bio || (isMe ? "No bio yet. Tap to add one." : "No bio.")}
                    </p>
                    {isMe && (
                      <div className="flex justify-center gap-4 mt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1"><MapPin size={12} /> Campus Center</div>
                        <div className="flex items-center gap-1"><LinkIcon size={12} /> github.com/xxxx/studentcenter</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 text-xs italic">
                Bio is hidden by user.
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {isMe && (
              <InstallAppButton className="!h-9 !px-4 !text-xs" />
            )}

            {/* Notification Button */}
            {isMe && notificationPermission !== 'granted' && (
              <CarvedButton
                onClick={async () => {
                  // Desktop check
                  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
                  if (isDesktop) return; // Should be hidden anyway

                  // iOS Standalone Check
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
                  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

                  if (isIOS && !isStandalone) {
                    showToast("Install the app first to enable notifications on iOS.", "info");
                    return;
                  }

                  if (notificationPermission === 'default') {
                    // Request permission
                    await requestPermission();
                  } else if (notificationPermission === 'denied') {
                    showToast('Notifications are blocked. Please enable them in your browser settings.', 'info');
                  }
                }}
                className={`!h-9 !px-4 !text-xs font-bold text-emerald-600 dark:text-emerald-400 ${typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'hidden' : ''}`}
              >
                <Bell size={14} className="mr-1" /> Enable Notifications
              </CarvedButton>
            )}
            <CarvedButton
              onClick={() => {
                if (isOnline) onPlayGame();
                else showToast("Games require internet connection", "info");
              }}
              className={`!h-9 !px-4 !text-xs font-bold text-emerald-600 dark:text-emerald-400 ${!isOnline ? 'opacity-50 grayscale' : ''}`}
            >
              <Gamepad2 size={14} className="mr-1" /> Play Runner
            </CarvedButton>
            <CarvedButton
              onClick={() => {
                const url = `${window.location.origin}?profile=${userToDisplay.id}`;
                navigator.clipboard.writeText(url);
                showToast('Profile link copied!', 'success');
              }}
              className="!h-9 !px-4 !text-xs font-bold text-slate-500"
            >
              <Share2 size={14} className="mr-1" /> Share
            </CarvedButton>

            {isMe && (
              <CarvedButton
                onClick={() => {
                  if (userToDisplay.role === 'admin') {
                    // Navigate to Meet (need to lift state or use window location as quick fix if prop not available?)
                    // Prop `onPlayGame` is for Runner. `onOpenSettings` is for Settings.
                    // I need to add a new prop `onOpenRealtime` to Profile.
                    if (onOpenRealtime) onOpenRealtime();
                  } else {
                    setIsStreamingModalOpen(true);
                  }
                }}
                className={`!h-9 !px-4 !text-xs font-bold ${userToDisplay.role === 'admin' ? 'text-red-500' : 'text-slate-400'}`}
              >
                <Video size={14} className="mr-1" /> {userToDisplay.role === 'admin' ? 'Go Live' : 'Stream'}
              </CarvedButton>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-3 w-full justify-center px-2">
            <div className="flex-1 max-w-[100px] bg-ceramic-base dark:bg-obsidian-surface py-3 rounded-2xl text-center border border-white/20">
              <span className="block text-lg font-bold text-slate-700 dark:text-slate-200">{myStories.length}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Stories</span>
            </div>
            <div className="flex-1 max-w-[100px] bg-ceramic-base dark:bg-obsidian-surface py-3 rounded-2xl text-center border border-white/20">
              <span className="block text-lg font-bold text-emerald-500">{totalLikes}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Likes</span>
            </div>
            <div className="flex-1 max-w-[100px] bg-ceramic-base dark:bg-obsidian-surface py-3 rounded-2xl text-center border border-white/20">
              <span className="block text-lg font-bold text-blue-400">{totalViews}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Views</span>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-xl mb-6 pl-2 border-l-4 border-accent">
          {isMe ? 'Your Timeline' : 'Timeline'}
        </h3>

        <div className="space-y-4">
          {!showTimeline ? (
            <div className="p-8 text-center rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-400">
              <p className="italic">Timeline is hidden by user.</p>
            </div>
          ) : (
            <>
              {myStories.length === 0 && <p className="text-center text-slate-400 py-8">No stories yet.</p>}
              {myStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onStoryClick(story.id)}
                  className={`relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer
                                    bg-ceramic-base dark:bg-obsidian-surface
                                    shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] 
                                    dark:shadow-[6px_6px_12px_#151618,-6px_-6px_12px_#35363e]
                                    border border-white/20 dark:border-white/5
                                    ${story.isHidden ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]">
                    {story.imageUrl ? (
                      <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400"><span className="text-[10px]">No IMG</span></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate mb-1">{story.title || 'Untitled'}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                      {timeAgo(story.timestamp)}
                      {story.isHidden && <span className="text-red-400 ml-2">• HIDDEN</span>}
                    </p>
                    <div className="flex gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1"><Eye size={12} /><span>{story.views}</span></div>
                      <div className="flex items-center gap-1"><Heart size={12} /><span>{story.likes.length}</span></div>
                    </div>
                  </div>
                  {isMe && (
                    <div onClick={(e) => { e.stopPropagation(); setManagingStoryId(story.id); }} className="absolute top-3 right-3 p-2">
                      <OutsetDots />
                    </div>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Hidden Stories Section (Only for Me) */}
        {isMe && hiddenStories.length > 0 && (
          <div className="mt-8 mb-8 border-t border-dashed border-slate-300 dark:border-slate-700 pt-6">
            <div
              onClick={() => setShowHidden(!showHidden)}
              className="flex items-center justify-between cursor-pointer group select-none"
            >
              <h3 className="font-bold text-lg text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Hidden Stories</span>
                <span className="bg-slate-200 dark:bg-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{hiddenStories.length}</span>
              </h3>
              <div className={`transition-transform duration-300 ${showHidden ? 'rotate-180' : ''}`}>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-400 group-hover:border-t-emerald-500 transition-colors" />
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{ height: showHidden ? 'auto' : 0, opacity: showHidden ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                {hiddenStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onStoryClick(story.id)}
                    className="relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer
                                bg-slate-100 dark:bg-slate-800/50
                                border border-slate-200 dark:border-slate-700
                                opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 grayscale">
                      {story.imageUrl ? (
                        <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><span className="text-[9px]">No IMG</span></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 truncate mb-1">{story.title || 'Untitled'}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        <span>{timeAgo(story.timestamp)}</span>
                        <span className="text-red-400 border border-red-200 dark:border-red-900/30 px-1 rounded">HIDDEN</span>
                      </div>
                    </div>

                    {/* Management dots */}
                    <div onClick={(e) => { e.stopPropagation(); setManagingStoryId(story.id); }} className="absolute top-3 right-3 p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                      <div className="flex flex-col gap-0.5">
                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-400" />)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>


      <StreamingAccessModal
        isOpen={isStreamingModalOpen}
        onClose={() => setIsStreamingModalOpen(false)}
      />
    </div >
  );
};
