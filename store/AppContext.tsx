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
  fontSize: 'base',
  isItalic: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User>({ id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' });
  const [isGuest, setIsGuest] = useState(true);
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot-password' | null>(null);

  // --- Data State ---
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({}); // Cache for user profiles

  // --- UI State ---
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [managingStoryId, setManagingStoryId] = useState<string | null>(null);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);
  const [sessionViews, setSessionViews] = useState<Set<string>>(new Set());
  const [editorDraft, setEditorDraft] = useState({ title: '', description: '', content: '', isProMode: false });

  // --- Initial Load: Auth & Settings ---
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        setIsGuest(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        setIsGuest(false);
      } else {
        setCurrentUser({ id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' });
        setIsGuest(true);
      }
    });

    // Load local settings as fallback or initial
    const savedSettings = localStorage.getItem('dopamine_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));

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
        avatar: data.avatar_url || 'https://ui-avatars.com/api/?name=?',
        coverPhoto: data.cover_url || undefined,
        bio: data.bio || undefined,
        email: supabase.auth.getUser().then(u => u.data.user?.email).toString() // approximate
      };
      setCurrentUser(user);

      // Sync settings if they exist in DB
      if (data.font_size) {
        setSettings(prev => ({
          ...prev,
          fontSize: data.font_size as 'sm' | 'base' | 'lg',
          isItalic: data.is_italic || false
        }));
      }
    }
  };

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles!stories_author_id_fkey(id, full_name, avatar_url),
        likes(user_id),
        comments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    if (data) {
      const mappedStories: Story[] = data.map(dbStory => ({
        id: dbStory.id,
        authorId: dbStory.author_id,
        timestamp: new Date(dbStory.created_at).getTime(),
        title: dbStory.title,
        description: dbStory.description || '',
        content: dbStory.content || '',
        imageUrl: dbStory.image_url || undefined,
        audioUrl: dbStory.audio_url || undefined,
        likes: dbStory.likes.map((l: any) => l.user_id),
        comments: [], // TODO: Reconstruct comment tree from flat fetch if needed
        views: dbStory.views_count || 0,
        isHidden: dbStory.is_hidden || false
      }));

      // Process comments separately or nested? 
      // For now, we fetched comments(*) flat. We need to construct tree.
      // Optimization: Fetch comments only when story is opened? 
      // For feed, we might not need all comments. 
      // But let's map what we have.

      const storiesWithComments = mappedStories.map((story, index) => {
        const rawComments = data[index].comments;
        return {
          ...story,
          comments: buildCommentTree(rawComments || [])
        };
      });

      setStories(storiesWithComments);

      // Update Users Cache
      const newUsers = { ...users };
      data.forEach((item: any) => {
        if (item.author) {
          newUsers[item.author.id] = {
            id: item.author.id,
            name: item.author.full_name || 'Unknown',
            avatar: item.author.avatar_url || ''
          };
        }
      });
      setUsers(newUsers);
    }
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

    // Realtime subscription for Stories
    const channel = supabase.channel('public:stories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, (payload) => {
        fetchStories(); // Brute force refresh for now, optimize later
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);



  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Global Font Scaling
  useEffect(() => {
    const sizeMap = {
      'sm': '14px',
      'base': '16px',
      'lg': '18px'
    };
    document.documentElement.style.fontSize = sizeMap[settings.fontSize];
  }, [settings.fontSize]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
    if (!deferredPrompt) return;
    triggerHaptic('medium');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const toggleTheme = () => {
    triggerHaptic('medium');
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    if (!isGuest && currentUser.id) {
      // Persist to DB
      await supabase.from('profiles').update({
        font_size: newSettings.fontSize || settings.fontSize,
        is_italic: newSettings.isItalic !== undefined ? newSettings.isItalic : settings.isItalic
      }).eq('id', currentUser.id);
    }
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
        privacySettings: (data.privacy_settings as any) || { showBio: true, showTimeline: true }
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
    const updated = { ...(currentUser.privacySettings || { showBio: true, showTimeline: true }), ...newSettings };
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

    // DB Update (RPC would be better for atomicity, but simple update works for low scale)
    const story = stories.find(s => s.id === storyId);
    if (story) {
      await supabase.from('stories').update({ views_count: story.views + 1 }).eq('id', storyId);
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

  const addStory = async (title: string, description: string, content: string, imageFile?: File, audioUrl?: string) => {
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

    const { error } = await supabase.from('stories').insert({
      author_id: currentUser.id,
      title,
      description,
      content,
      image_url: uploadedImageUrl,
      audio_url: audioUrl
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
      theme,
      settings,
      deferredPrompt,
      toasts,
      installApp,
      toggleTheme,
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

      authPage,
      setAuthPage,
      editorDraft,
      setEditorDraft,
      viewedProfile,
      loadPublicProfile,
      clearViewedProfile,
      updatePrivacySettings
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