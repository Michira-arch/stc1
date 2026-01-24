
export interface User {
  id: string;
  name: string;
  avatar: string;
  coverPhoto?: string;
  bio?: string;
  // added specifically for DB sync
  email?: string;
  privacySettings?: PrivacySettings;
}

export interface PrivacySettings {
  showBio: boolean;
  showTimeline: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  replies?: Comment[]; // Recursive nesting in UI
  parentId?: string | null; // For flattening interactions
}

export interface Story {
  id: string;
  authorId: string;
  timestamp: number;
  title: string;
  description?: string; // New field for feed preview/hook
  content: string; // Can be HTML
  imageUrl?: string;
  audioUrl?: string; // Base64 audio string or URL
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
  addStory: (title: string, description: string, content: string, imageUrl?: string, audioUrl?: string) => Promise<void>; // Updated to Promise
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

// --- Supabase Database Types ---

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          font_size: 'sm' | 'base' | 'lg' | null
          is_italic: boolean | null
          privacy_settings: PrivacySettings | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          font_size?: 'sm' | 'base' | 'lg' | null
          is_italic?: boolean | null

          privacy_settings?: PrivacySettings | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          font_size?: 'sm' | 'base' | 'lg' | null
          is_italic?: boolean | null

          privacy_settings?: PrivacySettings | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stories: {
        Row: {
          id: string
          author_id: string
          title: string
          description: string | null
          content: string | null
          image_url: string | null
          audio_url: string | null
          views_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          description?: string | null
          content?: string | null
          image_url?: string | null
          audio_url?: string | null
          views_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          description?: string | null
          content?: string | null
          image_url?: string | null
          audio_url?: string | null
          views_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          story_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_story_id_fkey"
            columns: ["story_id"]
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          user_id: string
          story_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          story_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          story_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_story_id_fkey"
            columns: ["story_id"]
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}