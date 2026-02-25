/**
 * App Registry — Central discovery system for AI agent integration.
 * 
 * Every page/app registers its capabilities and actions here.
 * The AI uses this to know what it can see and do, regardless of
 * how many pages are added, removed, or restructured.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface ActionParameter {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    description: string;
    enum?: string[]; // optional allowed values
}

export interface ActionResult {
    success: boolean;
    message: string;
    data?: any;
}

export interface AppCapability {
    id: string;              // e.g., "feed.stories.list"
    label: string;           // Human-readable: "View Feed Stories"
    description: string;     // For the AI system prompt
    category: 'read' | 'write' | 'navigate';
}

export interface AppAction {
    id: string;              // e.g., "editor.story.publish"
    label: string;           // "Publish a Story"
    description: string;     // AI-facing description
    category: 'content_read' | 'content_write' | 'social' | 'profile' | 'settings' | 'navigation';
    requiresConfirmation: boolean; // Default true for writes
    parameters: ActionParameter[];
    execute: (params: any, userId: string) => Promise<ActionResult>;
}

export interface PageRegistration {
    pageId: string;          // e.g., "feed", "profile", "settings"
    name: string;            // Human-readable display name
    capabilities: AppCapability[];
    actions: AppAction[];
    getContext: () => Promise<string>;  // Dynamic context for this page
}

// ─── Registry Singleton ──────────────────────────────────────────

class AppRegistryImpl {
    private pages: Map<string, PageRegistration> = new Map();
    private activePage: string | null = null;
    private listeners: Set<() => void> = new Set();

    /**
     * Register a page/app with the registry.
     * Called in useEffect on page mount.
     */
    register(page: PageRegistration): void {
        this.pages.set(page.pageId, page);
        this.notifyListeners();
    }

    /**
     * Unregister a page (on unmount).
     */
    unregister(pageId: string): void {
        this.pages.delete(pageId);
        if (this.activePage === pageId) {
            this.activePage = null;
        }
        this.notifyListeners();
    }

    /**
     * Set the currently active page (the one the user is viewing).
     */
    setActive(pageId: string): void {
        this.activePage = pageId;
    }

    /**
     * Get the currently active page registration.
     */
    getActive(): PageRegistration | null {
        if (!this.activePage) return null;
        return this.pages.get(this.activePage) || null;
    }

    /**
     * Get all registered pages.
     */
    getAll(): PageRegistration[] {
        return Array.from(this.pages.values());
    }

    /**
     * Get a specific page by ID.
     */
    getPage(pageId: string): PageRegistration | null {
        return this.pages.get(pageId) || null;
    }

    /**
     * Get all available actions across all registered pages.
     */
    getAllActions(): AppAction[] {
        const actions: AppAction[] = [];
        for (const page of this.pages.values()) {
            actions.push(...page.actions);
        }
        return actions;
    }

    /**
     * Find a specific action by ID across all pages.
     */
    findAction(actionId: string): { page: PageRegistration; action: AppAction } | null {
        for (const page of this.pages.values()) {
            const action = page.actions.find(a => a.id === actionId);
            if (action) return { page, action };
        }
        return null;
    }

    /**
     * Generate a summary of all capabilities for the AI system prompt.
     * This is sent to the backend so the AI knows what it can do.
     */
    generateCapabilitySummary(): string {
        const pages = this.getAll();
        if (pages.length === 0) return 'No pages currently registered.';

        const sections = pages.map(page => {
            const caps = page.capabilities.map(c => `  - ${c.label}: ${c.description}`).join('\n');
            const acts = page.actions.map(a => {
                const params = a.parameters.map(p => `${p.name}${p.required ? '*' : ''}: ${p.type}`).join(', ');
                return `  - ${a.label} (${a.id}): ${a.description} [${params}]`;
            }).join('\n');

            return `### ${page.name} (${page.pageId})\nCapabilities:\n${caps}\nActions:\n${acts}`;
        });

        return sections.join('\n\n');
    }

    /**
     * Get dynamic context from the active page, plus a high-level overview.
     */
    async getEnrichedContext(): Promise<string> {
        const activePage = this.getActive();
        let context = `Registered Pages: ${this.getAll().map(p => p.name).join(', ')}\n`;
        context += `Active Page: ${activePage?.name || 'None'}\n\n`;

        if (activePage) {
            try {
                const pageContext = await activePage.getContext();
                context += `--- Active Page Context ---\n${pageContext}\n`;
            } catch (e) {
                context += `--- Active Page Context ---\n(Could not load context)\n`;
            }
        }

        return context;
    }

    /**
     * Subscribe to registry changes.
     */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(l => l());
    }
}

// Global singleton
export const appRegistry = new AppRegistryImpl();
