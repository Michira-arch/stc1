import React, { useRef } from 'react';
import { useApp } from '../store/AppContext';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Edit2, Camera, User, Download, Check, MapPin, Link as LinkIcon, Share2, Eye, Heart } from 'lucide-react';
import { CarvedButton } from '../components/CarvedButton';
import { timeAgo } from '../utils';
import { StoryCard } from '../components/StoryCard';

interface Props {
  onStoryClick: (id: string) => void;
  onOpenSettings: () => void;
}

export const Profile: React.FC<Props> = ({ onStoryClick, onOpenSettings }) => {
  const { currentUser, stories, isGuest, deferredPrompt, installApp, setManagingStoryId, updateUserImage, updateUserBio, setAuthPage } = useApp();
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [bioText, setBioText] = React.useState(currentUser.bio || '');
  const myStories = stories.filter(s => s.authorId === currentUser.id);
  const totalLikes = myStories.reduce((acc, curr) => acc + curr.likes.length, 0);
  const totalViews = myStories.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      // Optimistic preview/loading could be added here, 
      // but for now we just pass the file to context which handles upload
      // We might want to show a toast "Uploading..."
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

  if (isGuest) {
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
      {/* Inputs */}
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />

      {/* Cover Photo */}
      <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden group cursor-pointer" onClick={() => coverInputRef.current?.click()}>
        {currentUser.coverPhoto ? (
          <img src={currentUser.coverPhoto} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span>Tap to add Cover Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Camera size={24} />
        </div>

        {/* Settings Button (Top Right) */}
        <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
          <CarvedButton onClick={onOpenSettings} className="!w-10 !h-10 !rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
            <SettingsIcon size={20} />
          </CarvedButton>
        </div>
      </div>

      <div className="px-4 relative">
        {/* Avatar (Overlapping Cover) */}
        <div className="flex flex-col items-center -mt-16 mb-6">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={() => avatarInputRef.current?.click()}
            className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-slate-200 to-slate-50 dark:from-slate-700 dark:to-slate-900 
                        shadow-[10px_10px_20px_rgba(0,0,0,0.2)] mb-4 relative z-10 cursor-pointer group"
          >
            <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-20">
              <Camera size={20} />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold mb-1">{currentUser.name}</h2>
          <p className="text-accent font-medium tracking-widest text-xs uppercase mb-1">Pro Storyteller</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mb-4">Powered by Dispatch STC</p>

          {/* Bio Section */}
          <div className="text-center mb-6 px-6 relative group">
            {isEditingBio ? (
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
              <div onClick={() => { setBioText(currentUser.bio || ''); setIsEditingBio(true); }} className="cursor-pointer hover:opacity-70 transition-opacity">
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  "{currentUser.bio || "No bio yet. Tap to add one."}"
                </p>
                <div className="flex justify-center gap-4 mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1"><MapPin size={12} /> Campus Center</div>
                  <div className="flex items-center gap-1"><LinkIcon size={12} /> github.com/student</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            {deferredPrompt && (
              <CarvedButton onClick={installApp} className="!h-9 !px-4 !text-xs font-bold text-slate-500">
                <Download size={14} className="mr-1" /> Install
              </CarvedButton>
            )}
            <CarvedButton className="!h-9 !px-4 !text-xs font-bold text-slate-500">
              <Share2 size={14} className="mr-1" /> Share
            </CarvedButton>
          </div>

          {/* Stats - Flattened as requested */}
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

        <h3 className="font-bold text-xl mb-6 pl-2 border-l-4 border-accent">Your Timeline</h3>

        <div className="space-y-4">
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
              <div onClick={(e) => { e.stopPropagation(); setManagingStoryId(story.id); }} className="absolute top-3 right-3 p-2">
                <OutsetDots />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
