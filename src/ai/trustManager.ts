/**
 * Trust Manager — Controls AI agent autonomy per user.
 * 
 * Users can set trust levels per action category:
 * - 'ask': AI must get user approval before executing (default)
 * - 'auto': AI can execute without asking
 * 
 * Persisted to Supabase (ai_trust_settings) + cached in localStorage.
 */

import { supabase } from '../../store/supabaseClient';

// ─── Types ───────────────────────────────────────────────────────

export type TrustLevel = 'ask' | 'auto';

export type TrustCategory =
    | 'navigation'      // Navigate to pages
    | 'content_read'    // Read/summarize content  
    | 'content_write'   // Post, edit, delete stories
    | 'social'          // Like, comment
    | 'profile'         // Update bio, avatar, handle
    | 'settings';       // Change app settings

export interface TrustSettings {
    navigation: TrustLevel;
    content_read: TrustLevel;
    content_write: TrustLevel;
    social: TrustLevel;
    profile: TrustLevel;
    settings: TrustLevel;
}

// ─── Defaults ────────────────────────────────────────────────────

export const DEFAULT_TRUST: TrustSettings = {
    navigation: 'ask',
    content_read: 'ask',
    content_write: 'ask',
    social: 'ask',
    profile: 'ask',
    settings: 'ask',
};

const STORAGE_KEY = 'stc_ai_trust_settings';

// ─── Trust Category Metadata ─────────────────────────────────────

export const TRUST_CATEGORIES: { key: TrustCategory; label: string; description: string; icon: string }[] = [
    { key: 'navigation', label: 'Navigation', description: 'Navigate to pages and apps', icon: '🧭' },
    { key: 'content_read', label: 'Read Content', description: 'Search and read stories, profiles, events', icon: '📖' },
    { key: 'content_write', label: 'Write Content', description: 'Create, edit, and delete stories', icon: '✍️' },
    { key: 'social', label: 'Social Actions', description: 'Like posts, add comments, cast votes', icon: '💬' },
    { key: 'profile', label: 'Profile Changes', description: 'Update bio, handle, and avatar', icon: '👤' },
    { key: 'settings', label: 'App Settings', description: 'Change theme, text size, privacy', icon: '⚙️' },
];

// ─── Trust Manager ───────────────────────────────────────────────

class TrustManagerImpl {
    private settings: TrustSettings = { ...DEFAULT_TRUST };
    private userId: string | null = null;
    private listeners: Set<(settings: TrustSettings) => void> = new Set();
    private loaded = false;

    /**
     * Initialize trust settings for a user.
     * Loads from localStorage first (fast), then syncs from Supabase.
     */
    async initialize(userId: string): Promise<void> {
        this.userId = userId;

        // 1. Load from localStorage (instant)
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            try {
                this.settings = { ...DEFAULT_TRUST, ...JSON.parse(cached) };
            } catch {
                this.settings = { ...DEFAULT_TRUST };
            }
        }

        // 2. Sync from Supabase (background)
        try {
            const { data, error } = await (supabase as any)
                .from('ai_trust_settings')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (data && !error) {
                this.settings = {
                    navigation: data.navigation || 'ask',
                    content_read: data.content_read || 'ask',
                    content_write: data.content_write || 'ask',
                    social: data.social || 'ask',
                    profile: data.profile || 'ask',
                    settings: data.settings || 'ask',
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
            } else if (error && error.code !== 'PGRST116') {
                console.warn('Failed to load trust settings:', error);
            }
        } catch (e) {
            console.warn('Trust settings sync failed, using cached:', e);
        }

        this.loaded = true;
        this.notifyListeners();
    }

    /**
     * Get current trust settings.
     */
    getSettings(): TrustSettings {
        return { ...this.settings };
    }

    /**
     * Check if a specific action category is trusted (auto-execute).
     */
    isTrusted(category: TrustCategory): boolean {
        return this.settings[category] === 'auto';
    }

    /**
     * Check if an action needs user confirmation.
     */
    needsConfirmation(category: TrustCategory): boolean {
        return this.settings[category] === 'ask';
    }

    /**
     * Update trust level for a category.
     */
    async updateTrust(category: TrustCategory, level: TrustLevel): Promise<void> {
        this.settings[category] = level;

        // Persist to localStorage immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        this.notifyListeners();

        // Persist to Supabase (background)
        if (this.userId) {
            try {
                await (supabase as any)
                    .from('ai_trust_settings')
                    .upsert({
                        user_id: this.userId,
                        [category]: level,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' });
            } catch (e) {
                console.warn('Failed to persist trust settings:', e);
            }
        }
    }

    /**
     * Revoke all trust — reset everything to 'ask'.
     */
    async revokeAll(): Promise<void> {
        this.settings = { ...DEFAULT_TRUST };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        this.notifyListeners();

        if (this.userId) {
            try {
                await (supabase as any)
                    .from('ai_trust_settings')
                    .upsert({
                        user_id: this.userId,
                        ...DEFAULT_TRUST,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' });
            } catch (e) {
                console.warn('Failed to revoke trust settings:', e);
            }
        }
    }

    /**
     * Clear on logout.
     */
    clear(): void {
        this.settings = { ...DEFAULT_TRUST };
        this.userId = null;
        this.loaded = false;
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Subscribe to trust setting changes.
     */
    subscribe(listener: (settings: TrustSettings) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(l => l({ ...this.settings }));
    }
}

// Global singleton
export const trustManager = new TrustManagerImpl();
