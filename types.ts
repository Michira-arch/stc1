
export interface User {
  id: string;
  name: string;
  avatar: string;
  coverPhoto?: string;
  bio?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  replies?: Comment[]; // Recursive nesting
}

export interface Story {
  id: string;
  authorId: string;
  timestamp: number;
  title: string;
  description?: string; // New field for feed preview/hook
  content: string; // Can be HTML
  imageUrl?: string;
  audioUrl?: string; // Base64 audio string
  likes: string[]; // Array of user IDs
  comments: Comment[];
  views: number;
  isHidden: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  fontSize: 'sm' | 'base' | 'lg';
  isItalic: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AppContextType {
  currentUser: User;
  users: Record<string, User>;
  stories: Story[];
  theme: ThemeMode;
  settings: AppSettings;
  deferredPrompt: any;
  toasts: Toast[];

  // Actions
  installApp: () => void;
  toggleTheme: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateUserImage: (type: 'avatar' | 'cover', base64: string) => void;
  updateUserBio: (bio: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Story Actions
  toggleLike: (storyId: string) => void;
  addComment: (storyId: string, text: string, parentId?: string) => void;
  deleteComment: (storyId: string, commentId: string) => void;
  addStory: (title: string, description: string, content: string, imageUrl?: string, audioUrl?: string) => void;
  deleteStory: (storyId: string) => void;
  incrementViews: (storyId: string) => void;
  toggleHideStory: (storyId: string) => void;
  updateStory: (storyId: string, title: string, description: string, content: string, imageUrl?: string) => void;

  // State
  feedScrollPosition: number;
  setFeedScrollPosition: (pos: number) => void;

  // Management Modal State
  managingStoryId: string | null;
  setManagingStoryId: (id: string | null) => void;

  // Utils
  sanitizeInput: (html: string) => string;

  // Guest Mode
  loginAsGuest: () => void;
  login: () => void;
  logout: () => void;
  isGuest: boolean;

  // Auth Navigation
  authPage: 'login' | 'signup' | 'forgot-password' | null;
  setAuthPage: (page: 'login' | 'signup' | 'forgot-password' | null) => void;

  // Editor Draft (Session Only)
  editorDraft: { title: string; description: string; content: string; isProMode: boolean };
  setEditorDraft: (draft: { title: string; description: string; content: string; isProMode: boolean }) => void;
}