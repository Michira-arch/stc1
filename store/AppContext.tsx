import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Story, AppContextType, ThemeMode, AppSettings, Comment, Toast, Database, PrivacySettings } from '../types';
import { triggerHaptic } from '../utils';
import { supabase } from './supabaseClient';


const MOCK_USERS: Record<string, User> = {
  "user_me": { id: "user_me", name: "You", avatar: "https://picsum.photos/id/64/200/200", coverPhoto: "https://picsum.photos/id/20/800/300", bio: "Exploring the intersection of caffeine and code. ☕💻 Always looking for the next big idea." },
  "user_ana": { id: "user_ana", name: "Ana K.", avatar: "https://picsum.photos/id/65/200/200", bio: "Art student. Coffee addict. 🎨" },
  "user_dj": { id: "user_dj", name: "DJ", avatar: "https://picsum.photos/id/91/200/200", bio: "Music is life. 🎧" },
};

const INITIAL_STORIES: Story[] = [
  {
    id: "s1",
    authorId: "user_ana",
    timestamp: Date.now() - 7200000,
    title: "The chaotic art of coding at 3AM",
    description: "A quick rant about coffee and bugs.",
    content: "I tried to build an app in 24 hours. Spoiler: it didn't work, but I drank enough coffee to vibrate through walls.",
    imageUrl: "https://picsum.photos/seed/code/600/400",
    likes: ["user_dj"],
    comments: [
      { id: "c1", userId: "user_dj", text: "This is too relatable.", timestamp: Date.now() - 3600000, replies: [] }
    ],
    views: 124,
    isHidden: false
  },
  {
    id: "s2",
    authorId: "user_dj",
    timestamp: Date.now() - 86400000,
    title: "Hidden spots on campus",
    description: "Found the perfect reading nook.",
    content: "Found this little corner behind the engineering block. Perfect for reading.",
    imageUrl: "https://picsum.photos/seed/campus/600/800", // Portrait example
    likes: ["user_ana", "user_me"],
    comments: [],
    views: 89,
    isHidden: false
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  textScale: 1,
  isItalic: false,
  fontFamily: 'sans'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User>({ id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' });
  const [isGuest, setIsGuest] = useState(true);
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot-password' | 'set-username' | null>(null);

  // --- Data State ---
  const [stories, setStories] = useState<Story[]>([]);
  const [hiddenStories, setHiddenStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({
    'anonymous': { id: 'anonymous', name: 'Anonymous', avatar: 'https://ui-avatars.com/api/?name=?', bio: '' }
  }); // Cache for user profiles

  // --- UI State ---
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('dopamine_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    }
    return 'light';
  });

  const [clayMode, setClayMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dopamine_clay_mode') === 'true';
    }
    return false;
  });

  const [colorfulMode, setColorfulMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dopamine_colorful_mode') === 'true';
    }
    return false;
  });

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [managingStoryId, setManagingStoryId] = useState<string | null>(null);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const [sessionViews, setSessionViews] = useState<Set<string>>(new Set());
  const [editorDraft, setEditorDraft] = useState({ title: '', description: '', content: '', isProMode: false, isAnonymous: false });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{ type: 'page' | 'post' | 'selection'; content: string; id?: string; imageUrl?: string } | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Global video mute (default: muted)

  const openChat = (context?: { type: 'page' | 'post' | 'selection'; content: string; id?: string; imageUrl?: string }) => {
    if (context) setChatContext(context);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setChatContext(null);
  };

  // --- Connectivity Listener ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setTheme('dark'); // Force dark mode when offline
      showToast("You are offline. Switched to Safe Mode.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Clay Mode Effect ---
  useEffect(() => {
    console.log("Clay Mode Effect Triggered:", clayMode);
    const html = document.documentElement;
    if (clayMode) {
      html.classList.add('clay');
      console.log("Added clay class.");
    } else {
      html.classList.remove('clay');
      console.log("Removed clay class.");
    }
  }, [clayMode]);

  const toggleClayMode = () => {
    triggerHaptic('medium');
    setClayMode(prev => {
      const newState = !prev;
      localStorage.setItem('dopamine_clay_mode', String(newState));
      return newState;
    });
  };

  // --- Colorful Mode Effect ---
  useEffect(() => {
    const html = document.documentElement;
    if (colorfulMode) {
      html.classList.add('colorful');
    } else {
      html.classList.remove('colorful');
    }
  }, [colorfulMode]);

  const toggleColorfulMode = () => {
    triggerHaptic('medium');
    setColorfulMode(prev => {
      const newState = !prev;
      localStorage.setItem('dopamine_colorful_mode', String(newState));
      return newState;
    });
  };

  const [sleekMode, setSleekMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dopamine_sleek_mode') === 'true';
    }
    return false;
  });

  // --- Sleek Mode Effect ---
  useEffect(() => {
    const html = document.documentElement;
    if (sleekMode) {
      html.classList.add('sleek');
    } else {
      html.classList.remove('sleek');
    }
  }, [sleekMode]);

  const toggleSleekMode = () => {
    triggerHaptic('medium');
    setSleekMode(prev => {
      const newState = !prev;
      localStorage.setItem('dopamine_sleek_mode', String(newState));
      return newState;
    });
  };

  const toggleTheme = () => {
    // Offline check removed for theme - local preference should always work
    triggerHaptic('medium');
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dopamine_theme', newTheme);
      return newTheme;
    });
  };
  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Try getting standard session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Valid session found
        fetchProfile(session.user.id);
        setIsGuest(false);
      } else {
        // 2. No session? Try Recovery from Backup
        const backupStr = localStorage.getItem('STC_SESSION_BACKUP');
        if (backupStr) {
          try {
            const backup = JSON.parse(backupStr);
            console.log("Attempting session recovery from backup...");
            const { data: recoveryData, error: recoveryError } = await supabase.auth.setSession({
              access_token: backup.access_token,
              refresh_token: backup.refresh_token
            });

            if (!recoveryError && recoveryData.session) {
              console.log("Session recovered successfully!");
              fetchProfile(recoveryData.session.user.id);
              setIsGuest(false);
              showToast("Session restored", "success");
            } else {
              console.warn("Session recovery failed:", recoveryError);
              localStorage.removeItem('STC_SESSION_BACKUP'); // Bad backup
            }
          } catch (e) {
            console.error("Backup parse error", e);
            localStorage.removeItem('STC_SESSION_BACKUP');
          }
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Backup the session!
        localStorage.setItem('STC_SESSION_BACKUP', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        }));

        fetchProfile(session.user.id);
        setIsGuest(false);
      } else {
        // Signed out
        localStorage.removeItem('STC_SESSION_BACKUP');

        setCurrentUser({ id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' });
        setIsGuest(true);
      }
    });

    // Load local settings as fallback or initial
    // Load local settings as fallback or initial
    const savedSettings = localStorage.getItem('dopamine_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...DEFAULT_SETTINGS, ...parsed, textScale: parsed.textScale || DEFAULT_SETTINGS.textScale }));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  // --- Fetchers ---

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      const user: User = {
        id: data.id,
        name: data.full_name || 'Anonymous',
        handle: data.handle || undefined,
        avatar: data.avatar_url || 'https://ui-avatars.com/api/?name=?',
        coverPhoto: data.cover_url || undefined,
        bio: data.bio || undefined,
        email: supabase.auth.getUser().then(u => u.data.user?.email).toString(), // approximate
        isCertified: data.is_certified || false
      };
      setCurrentUser(user);

      // Sync settings if they exist in DB
      // Sync settings if they exist in DB
      if (data.font_size) {
        // Map old font_size to new textScale if needed, or just keep existing textScale
        // For now, we ignore data.font_size mapping as we moved to textScale
        setSettings(prev => ({
          ...prev,
          isItalic: data.is_italic !== undefined ? data.is_italic : prev.isItalic
        }));
      }
    }
  };

  // --- Pagination State ---
  const PAGE_SIZE = 20;
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const STORY_SELECT = `
    *,
    author:profiles!stories_author_id_fkey(id, full_name, avatar_url, handle, is_certified),
    likes(user_id),
    comments(*)
  `;

  const processStories = (rawData: any[]) => {
    return rawData.map(dbStory => ({
      id: dbStory.id,
      authorId: (dbStory.is_anonymous && dbStory.author_id !== currentUser.id) ? 'anonymous' : dbStory.author_id,
      timestamp: new Date(dbStory.created_at).getTime(),
      title: dbStory.title,
      description: dbStory.description || '',
      content: dbStory.content || '',
      imageUrl: dbStory.image_url || undefined,
      videoUrl: dbStory.video_url || undefined,
      audioUrl: dbStory.audio_url || undefined,
      likes: dbStory.likes.map((l: any) => l.user_id),
      comments: buildCommentTree(dbStory.comments || []),
      views: dbStory.views_count || 0,
      isHidden: dbStory.is_hidden || false,
      isAnonymous: dbStory.is_anonymous || false
    }));
  };

  const updateUsersCache = (rawData: any[]) => {
    const newUsers = { ...users };
    rawData.forEach((item: any) => {
      if (item.author && !item.is_anonymous) {
        newUsers[item.author.id] = {
          id: item.author.id,
          name: item.author.full_name || 'Unknown',
          handle: item.author.handle,
          avatar: item.author.avatar_url || '',
          isCertified: item.author.is_certified || false
        };
      }
    });
    setUsers(newUsers);
  };

  const fetchStories = async () => {
    // 1. Public Feed (Non-hidden) — first page
    const { data, error } = await supabase
      .from('stories')
      .select(STORY_SELECT)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    if (data) {
      setStories(processStories(data));
      setHasMoreStories(data.length >= PAGE_SIZE);
      updateUsersCache(data);
    }

    // 2. Fetch My Hidden Stories
    if (!isGuest && currentUser.id !== 'guest') {
      const { data: hiddenData } = await supabase
        .from('stories')
        .select(STORY_SELECT)
        .eq('author_id', currentUser.id)
        .eq('is_hidden', true)
        .order('created_at', { ascending: false });

      if (hiddenData) {
        setHiddenStories(processStories(hiddenData));
      }
    } else {
      setHiddenStories([]);
    }
  };

  const fetchMoreStories = async () => {
    if (isLoadingMore || !hasMoreStories) return;
    setIsLoadingMore(true);

    try {
      // Use the oldest story's timestamp as cursor
      const oldestStory = stories[stories.length - 1];
      if (!oldestStory) { setIsLoadingMore(false); return; }

      const { data, error } = await supabase
        .from('stories')
        .select(STORY_SELECT)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .lt('created_at', new Date(oldestStory.timestamp).toISOString())
        .limit(PAGE_SIZE);

      if (error) {
        console.error('Error fetching more stories:', error);
        return;
      }

      if (data) {
        const newStories = processStories(data);
        setStories(prev => [...prev, ...newStories]);
        setHasMoreStories(data.length >= PAGE_SIZE);
        updateUsersCache(data);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // --- Delta realtime: fetch a single story by ID ---
  const fetchSingleStory = async (storyId: string): Promise<Story | null> => {
    const { data, error } = await supabase
      .from('stories')
      .select(STORY_SELECT)
      .eq('id', storyId)
      .single();

    if (error || !data) return null;
    updateUsersCache([data]);
    return processStories([data])[0];
  };

  const buildCommentTree = (flatComments: any[]): Comment[] => {
    const commentMap: Record<string, Comment> = {};
    const roots: Comment[] = [];

    // First pass: create objects
    flatComments.forEach(c => {
      commentMap[c.id] = {
        id: c.id,
        userId: c.user_id,
        text: c.content,
        timestamp: new Date(c.created_at).getTime(),
        replies: []
      };
    });

    // Second pass: link parents
    flatComments.forEach(c => {
      if (c.parent_id && commentMap[c.parent_id]) {
        commentMap[c.parent_id].replies?.push(commentMap[c.id]);
      } else {
        roots.push(commentMap[c.id]);
      }
    });

    return roots;
  };

  useEffect(() => {
    fetchStories();

    // --- Delta Realtime: Stories ---
    const storiesChannel = supabase.channel('public:stories:delta')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, async (payload) => {
        const newStory = await fetchSingleStory(payload.new.id);
        if (newStory && !newStory.isHidden) {
          setStories(prev => [newStory, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stories' }, async (payload) => {
        const updated = await fetchSingleStory(payload.new.id);
        if (updated) {
          if (updated.isHidden) {
            // Story was hidden — remove from public feed
            setStories(prev => prev.filter(s => s.id !== updated.id));
          } else {
            setStories(prev => prev.map(s => s.id === updated.id ? updated : s));
          }
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'stories' }, (payload) => {
        setStories(prev => prev.filter(s => s.id !== payload.old.id));
      })
      .subscribe();

    // --- Delta Realtime: Likes & Comments → refresh only the affected story ---
    const engagementChannel = supabase.channel('public:engagement:delta')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, async (payload) => {
        const storyId = (payload.new as any)?.story_id || (payload.old as any)?.story_id;
        if (storyId) {
          const updated = await fetchSingleStory(storyId);
          if (updated) setStories(prev => prev.map(s => s.id === storyId ? updated : s));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, async (payload) => {
        const storyId = (payload.new as any)?.story_id || (payload.old as any)?.story_id;
        if (storyId) {
          const updated = await fetchSingleStory(storyId);
          if (updated) setStories(prev => prev.map(s => s.id === storyId ? updated : s));
        }
      })
      .subscribe();

    // Realtime subscription for My Profile
    // This allows toggling is_certified in DB to immediately show up
    let profileChannel: any = null;
    if (!isGuest && currentUser.id !== 'guest') {
      profileChannel = supabase.channel(`public:profile:${currentUser.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUser.id}`
        }, () => {
          console.log("Profile updated, refetching...");
          fetchProfile(currentUser.id);
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(storiesChannel);
      supabase.removeChannel(engagementChannel);
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [currentUser.id, isGuest]); // Refetch when user changes (for hidden stories)



  useEffect(() => {
    console.log("Theme Effect Triggered:", theme);
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      console.log("Added dark class. ClassList:", html.classList.toString());
    } else {
      html.classList.remove('dark');
      console.log("Removed dark class. ClassList:", html.classList.toString());
    }
  }, [theme]);

  // Global Font Scaling & Family
  useEffect(() => {
    // Apply Text Scale
    document.documentElement.style.setProperty('--text-scale', settings.textScale.toString());

    // Font Family Application
    const familyMap = {
      'sans': 'Outfit, sans-serif',
      'luxurious': '"Luxurious Script", cursive',
      'imperial': '"Imperial Script", cursive',
      'tangerine': 'Tangerine, cursive'
    };
    document.documentElement.style.setProperty('--font-sans', familyMap[settings.fontFamily || 'sans']);

  }, [settings.textScale, settings.fontFamily]);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA Install Prompt Captured");
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showToast("App installed successfully!", "success");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Helper to remove dangerous tags
  const sanitizeInput = (html: string) => {
    return html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
      .replace(/on\w+="[^"]*"/g, "");
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    triggerHaptic(type === 'error' ? 'heavy' : 'medium');
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      if (isAppInstalled) showToast("App is already installed", "info");
      return;
    }
    triggerHaptic('medium');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };



  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    if (!isGuest && currentUser.id) {
      // Persist to DB
      await supabase.from('profiles').update({
        // font_size: newSettings.fontSize || settings.fontSize, // Deprecated in favor of textScale
        // Storing textScale in metadata or similar would be ideal, but for now we rely on LocalStorage.
        // If we strictly needed DB persistence for this new field, we'd add 'text_scale' column.
        // For this iteration, we keep the other fields and trust localStorage for textScale.
        is_italic: newSettings.isItalic !== undefined ? newSettings.isItalic : settings.isItalic,
      }).eq('id', currentUser.id);
    }
    // Local Storage Backup for settings (Good for Guest & Persistence)
    localStorage.setItem('dopamine_settings', JSON.stringify({ ...settings, ...newSettings }));
  };

  const updateUserImage = async (type: 'avatar' | 'cover', file: File) => {
    if (isGuest) {
      showToast('Login to save profile changes', 'error');
      return;
    }

    try {
      const bucket = type === 'avatar' ? 'avatars' : 'covers';
      // Need to import uploadImage from utils, but circular dependency might be an issue if utils imports supabase from here (unlikely, it imports from client).
      // Wait, utils imports supabase from './store/supabaseClient'. AppContext is in './store/AppContext'. 
      // We need to import `uploadImage` from `../utils`.

      const publicUrl = await import('../utils').then(m => m.uploadImage(file, bucket));

      if (!publicUrl) {
        showToast('Failed to upload image', 'error');
        return;
      }

      const updates = type === 'avatar' ? { avatar_url: publicUrl } : { cover_url: publicUrl };
      const { error } = await supabase.from('profiles').update(updates).eq('id', currentUser.id);

      if (!error) {
        setCurrentUser(prev => ({ ...prev, [type === 'avatar' ? 'avatar' : 'coverPhoto']: publicUrl }));
        showToast(type === 'avatar' ? 'Avatar updated' : 'Cover photo updated', 'success');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error uploading image', 'error');
    }
  };

  const updateUserBio = async (bio: string) => {
    if (isGuest) return;
    const { error } = await supabase.from('profiles').update({ bio }).eq('id', currentUser.id);
    if (!error) {
      setCurrentUser(prev => ({ ...prev, bio }));
      showToast('Bio updated', 'success');
    }
  };

  const updateUserHandle = async (handle: string) => {
    if (isGuest) return;
    // Basic validation
    if (handle && !/^[a-zA-Z0-9_]+$/.test(handle)) {
      showToast('Handle can only contain letters, numbers, and underscores', 'error');
      return;
    }

    const { error } = await supabase.from('profiles').update({ handle }).eq('id', currentUser.id);
    if (!error) {
      setCurrentUser(prev => ({ ...prev, handle }));
      showToast('Handle updated', 'success');
    } else {
      if (error.code === '23505') { // Unique violation
        showToast('Handle already taken', 'error');
      } else {
        showToast('Failed to update handle', 'error');
      }
    }
  };

  const updateUserName = async (name: string) => {
    if (isGuest) return;
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', currentUser.id);
    if (!error) {
      setCurrentUser(prev => ({ ...prev, name }));
      showToast('Name updated', 'success');
    } else {
      showToast('Failed to update name', 'error');
    }
  };

  const [viewedProfile, setViewedProfile] = useState<User | null>(null);

  const loadPublicProfile = async (userId: string) => {
    if (userId === currentUser.id) {
      setViewedProfile(currentUser);
      return;
    }

    if (users[userId]?.privacySettings) {
      setViewedProfile(users[userId]);
    }

    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (data) {
      const user: User = {
        id: data.id,
        name: data.full_name || 'Anonymous',
        avatar: data.avatar_url || 'https://ui-avatars.com/api/?name=?',
        coverPhoto: data.cover_url || undefined,
        bio: data.bio || undefined,
        privacySettings: (data.privacy_settings as any) || { showBio: true, showTimeline: true, showName: true },
        isCertified: data.is_certified || false
      };
      setViewedProfile(user);
      setUsers(prev => ({ ...prev, [user.id]: user }));
    } else {
      showToast('User not found', 'error');
    }
  };

  const clearViewedProfile = () => setViewedProfile(null);

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (isGuest) return;
    const updated = { ...(currentUser.privacySettings || { showBio: true, showTimeline: true, showName: true }), ...newSettings };
    setCurrentUser(prev => ({ ...prev, privacySettings: updated }));
    const { error } = await supabase.from('profiles').update({ privacy_settings: updated }).eq('id', currentUser.id);
    if (error) showToast('Failed to update privacy', 'error');
    else showToast('Privacy settings saved', 'success');
  };

  const incrementViews = async (storyId: string) => {
    if (sessionViews.has(storyId)) return;
    setSessionViews(prev => new Set(prev).add(storyId));

    // Optimistic UI
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, views: s.views + 1 } : s));

    // DB Update: Use RPC to bypass specific RLS policy safely
    const { error } = await supabase.rpc('increment_story_view', { p_story_id: storyId });
    if (error) {
      console.error("Failed to increment views:", error);
    }
  };

  const toggleLike = async (storyId: string) => {
    if (isGuest) {
      showToast('Please login to like stories', 'info');
      return;
    }

    incrementViews(storyId);
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const isLiked = story.likes.includes(currentUser.id);

    // Optimistic UI
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        likes: isLiked ? s.likes.filter(id => id !== currentUser.id) : [...s.likes, currentUser.id]
      };
    }));

    triggerHaptic(isLiked ? 'light' : 'success');

    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('story_id', storyId);
    } else {
      await supabase.from('likes').insert({ user_id: currentUser.id, story_id: storyId });
    }
  };

  // Recursive helper to add reply
  const addReplyToTree = (comments: Comment[], parentId: string, newComment: Comment): Comment[] => {
    return comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), newComment] };
      } else if (c.replies && c.replies.length > 0) {
        return { ...c, replies: addReplyToTree(c.replies, parentId, newComment) };
      }
      return c;
    });
  };

  // Recursive helper to delete comment
  const deleteCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments
      .filter(c => c.id !== commentId) // Remove if it matches
      .map(c => ({
        ...c,
        replies: c.replies ? deleteCommentFromTree(c.replies, commentId) : []
      }));
  };

  const addComment = async (storyId: string, text: string, parentId?: string) => {
    if (isGuest) {
      showToast('Please login to comment', 'info');
      return;
    }
    triggerHaptic('medium');
    incrementViews(storyId);

    // DB Insert
    const { data, error } = await supabase.from('comments').insert({
      story_id: storyId,
      user_id: currentUser.id,
      parent_id: parentId || null,
      content: text
    }).select().single();

    if (error || !data) {
      showToast('Failed to post comment', 'error');
      return;
    }

    // Iterate fetch to refresh (easiest for nested comments) or append locally
    fetchStories();
  };

  const deleteComment = async (storyId: string, commentId: string) => {
    triggerHaptic('heavy');
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      showToast('Comment deleted', 'info');
      fetchStories();
    }
  };

  const addStory = async (title: string, description: string, content: string, imageFile?: File, audioUrl?: string, isAnonymous: boolean = false, videoFile?: File) => {
    if (isGuest) return;
    triggerHaptic('success');

    let uploadedImageUrl = null;
    if (imageFile) {
      uploadedImageUrl = await import('../utils').then(m => m.uploadImage(imageFile, 'story-content'));
      if (!uploadedImageUrl) {
        showToast('Failed to upload story image', 'error');
        return;
      }
    }

    let uploadedVideoUrl = null;
    if (videoFile) {
      const { uploadVideoToR2 } = await import('../src/lib/r2');
      uploadedVideoUrl = await uploadVideoToR2(videoFile);
      if (!uploadedVideoUrl) {
        showToast('Failed to upload video', 'error');
        return;
      }
    }

    const { error } = await supabase.from('stories').insert({
      author_id: currentUser.id,
      title,
      description,
      content,
      image_url: uploadedImageUrl,
      video_url: uploadedVideoUrl,
      audio_url: audioUrl,
      is_anonymous: isAnonymous
    });

    if (error) {
      showToast('Failed to publish story', 'error');
      console.error(error);
    } else {
      fetchStories();
    }
  };

  const deleteStory = async (storyId: string) => {
    triggerHaptic('heavy');
    const { error } = await supabase.from('stories').delete().eq('id', storyId);

    if (!error) {
      setStories(prev => prev.filter(s => s.id !== storyId));
      setManagingStoryId(null);
      showToast('Story deleted', 'info');
    } else {
      showToast('Failed to delete story', 'error');
    }
  };

  const toggleHideStory = async (storyId: string) => {
    triggerHaptic('medium');
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const newVal = !story.isHidden;

    // Optimistic
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, isHidden: newVal } : s));

    const { error } = await supabase.from('stories').update({ is_hidden: newVal }).eq('id', storyId);

    if (error) {
      // Revert?
    } else {
      showToast(newVal ? 'Story hidden from feed' : 'Story visible in feed', 'info');
    }
  };

  const updateStory = async (storyId: string, title: string, description: string, content: string, imageFile?: File | string) => {
    triggerHaptic('success');

    const updates: any = { title, description, content };

    // Check if new file or existing string (or undefined if no change)
    if (imageFile && typeof imageFile !== 'string') {
      const url = await import('../utils').then(m => m.uploadImage(imageFile as File, 'story-content'));
      if (url) updates.image_url = url;
    } else if (imageFile === null) {
      // Explicit removal (if we supported removing images) - logic would go here
    }

    const { error } = await supabase.from('stories').update(updates).eq('id', storyId);

    if (!error) {
      setStories(prev => prev.map(s => s.id === storyId ? {
        ...s,
        title,
        description,
        content,
        imageUrl: updates.image_url || s.imageUrl
      } : s));
      setManagingStoryId(null);
      showToast('Story updated', 'success');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      stories,
      hiddenStories,
      hasMoreStories,
      isLoadingMore,
      theme,
      settings,
      deferredPrompt,
      toasts,
      installApp,
      toggleTheme,
      clayMode,
      toggleClayMode,
      colorfulMode,
      toggleColorfulMode,
      updateSettings,
      updateUserImage,
      updateUserBio,
      toggleLike,
      addComment,
      deleteComment,
      addStory,
      deleteStory,
      incrementViews,
      toggleHideStory,
      updateStory,
      fetchMoreStories,
      showToast,
      removeToast,
      feedScrollPosition,
      setFeedScrollPosition,
      managingStoryId,
      setManagingStoryId,
      sanitizeInput,
      loginAsGuest: () => {
        // Guest mode basically means not logged into Supabase
        setIsGuest(true);
        setAuthPage(null); // Return to app
      },
      login: () => {
        setAuthPage('login');
      },
      logout: async () => {
        await supabase.auth.signOut();
        setIsGuest(true);
        setAuthPage('login');
      },
      isGuest,
      isAppInstalled,
      isOnline,
      isVideoMuted,
      setIsVideoMuted,

      authPage,
      setAuthPage,
      editorDraft,
      setEditorDraft,
      viewedProfile,
      loadPublicProfile,
      clearViewedProfile,
      updatePrivacySettings,
      updateUserHandle,
      updateUserName,
      isChatOpen,
      chatContext,
      openChat,
      closeChat,
      sleekMode,
      toggleSleekMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};