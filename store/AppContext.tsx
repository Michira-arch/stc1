import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Story, AppContextType, ThemeMode, AppSettings, Comment, Toast } from '../types';
import { triggerHaptic } from '../utils';

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
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dopamine_user');
    return saved ? JSON.parse(saved) : { id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' };
  });

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('dopamine_stories');
      return saved ? JSON.parse(saved) : INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  });

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('dopamine_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [managingStoryId, setManagingStoryId] = useState<string | null>(null);
  const [feedScrollPosition, setFeedScrollPosition] = useState(0);

  // Track which stories have been viewed in this session to prevent spamming views
  const [sessionViews, setSessionViews] = useState<Set<string>>(new Set());
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot-password' | null>(null);
  const [editorDraft, setEditorDraft] = useState({ title: '', description: '', content: '', isProMode: false });

  useEffect(() => { localStorage.setItem('dopamine_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('dopamine_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('dopamine_user', JSON.stringify(currentUser)); }, [currentUser]);

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

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateUserImage = (type: 'avatar' | 'cover', base64: string) => {
    setCurrentUser(prev => ({
      ...prev,
      [type === 'avatar' ? 'avatar' : 'coverPhoto']: base64
    }));
    showToast(type === 'avatar' ? 'Avatar updated' : 'Cover photo updated', 'success');
  };

  const updateUserBio = (bio: string) => {
    setCurrentUser(prev => ({ ...prev, bio }));
    showToast('Bio updated', 'success');
  };

  const incrementViews = (storyId: string) => {
    // Idempotent check: If already viewed in this session, don't add count
    if (sessionViews.has(storyId)) return;

    setSessionViews(prev => new Set(prev).add(storyId));
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, views: s.views + 1 } : s));
  };

  const toggleLike = (storyId: string) => {
    incrementViews(storyId); // Infer view
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const isLiked = s.likes.includes(currentUser.id);
      if (!isLiked) {
        triggerHaptic('success');
      } else {
        triggerHaptic('light');
      }

      return {
        ...s,
        likes: isLiked
          ? s.likes.filter(id => id !== currentUser.id)
          : [...s.likes, currentUser.id]
      };
    }));
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

  const addComment = (storyId: string, text: string, parentId?: string) => {
    triggerHaptic('medium');
    incrementViews(storyId); // Infer view

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      text,
      timestamp: Date.now(),
      replies: []
    };

    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;

      if (parentId) {
        return { ...s, comments: addReplyToTree(s.comments, parentId, newComment) };
      } else {
        return { ...s, comments: [...s.comments, newComment] };
      }
    }));
  };

  const deleteComment = (storyId: string, commentId: string) => {
    triggerHaptic('heavy');
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return { ...s, comments: deleteCommentFromTree(s.comments, commentId) };
    }));
    showToast('Comment deleted', 'info');
  };

  const addStory = (title: string, description: string, content: string, imageUrl?: string, audioUrl?: string) => {
    triggerHaptic('success');
    const newStory: Story = {
      id: `s-${Date.now()}`,
      authorId: currentUser.id,
      timestamp: Date.now(),
      title,
      description,
      content,
      imageUrl,
      audioUrl,
      likes: [],
      comments: [],
      views: 0,
      isHidden: false
    };
    setStories(prev => [newStory, ...prev]);
  };

  const deleteStory = (storyId: string) => {
    triggerHaptic('heavy');
    setStories(prev => prev.filter(s => s.id !== storyId));
    setManagingStoryId(null);
    showToast('Story deleted', 'info');
  };

  const toggleHideStory = (storyId: string) => {
    triggerHaptic('medium');
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, isHidden: !s.isHidden } : s));
    const story = stories.find(s => s.id === storyId);
    showToast(story?.isHidden ? 'Story visible in feed' : 'Story hidden from feed', 'info');
  };

  const updateStory = (storyId: string, title: string, description: string, content: string, imageUrl?: string) => {
    triggerHaptic('success');
    setStories(prev => prev.map(s => s.id === storyId ? {
      ...s,
      title,
      description,
      content,
      imageUrl: imageUrl !== undefined ? imageUrl : s.imageUrl
    } : s));
    setManagingStoryId(null);
    showToast('Story updated', 'success');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users: MOCK_USERS,
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
        const guestUser: User = { id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' };
        setCurrentUser(guestUser);
        localStorage.setItem('dopamine_user', JSON.stringify(guestUser));
      },
      login: () => {
        setCurrentUser(MOCK_USERS["user_me"]);
        localStorage.setItem('dopamine_user', JSON.stringify(MOCK_USERS["user_me"]));
      },
      logout: () => {
        const guestUser: User = { id: 'guest', name: 'Guest', avatar: 'https://ui-avatars.com/api/?name=Guest', bio: 'Just passing through.' };
        setCurrentUser(guestUser);
        localStorage.setItem('dopamine_user', JSON.stringify(guestUser));
      },
      isGuest: currentUser.id === 'guest',
      authPage,
      setAuthPage,
      editorDraft,
      setEditorDraft
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