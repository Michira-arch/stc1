/**
 * Agent Actions — Execution pipeline for AI agent tool calls.
 * 
 * Flow:
 * 1. AI proposes an action (tool call from backend)
 * 2. Frontend checks trust level for that action's category
 * 3. If 'ask' → show ActionConfirmationModal, wait for user approval
 * 4. If 'auto' → execute immediately
 * 5. Log result to ai_action_log table
 */

import { supabase } from '../../store/supabaseClient';
import { trustManager, TrustCategory } from './trustManager';
import { appRegistry, ActionResult } from './appRegistry';

// ─── Types ───────────────────────────────────────────────────────

export type ActionStatus = 'proposed' | 'approved' | 'executing' | 'executed' | 'denied' | 'failed';

export interface AgentAction {
    id: string;
    toolName: string;
    label: string;
    description: string;
    category: TrustCategory;
    params: Record<string, any>;
    status: ActionStatus;
    result?: ActionResult;
    createdAt: number;
}

export interface ProposedAction {
    tool_name: string;
    tool_call_id: string;
    label: string;
    description: string;
    category: TrustCategory;
    params: Record<string, any>;
}

// ─── Action Pipeline ─────────────────────────────────────────────

/**
 * Process a proposed action from the AI.
 * Returns the action object with its initial status.
 */
export function createAgentAction(proposal: ProposedAction): AgentAction {
    const needsConfirmation = trustManager.needsConfirmation(proposal.category);

    return {
        id: proposal.tool_call_id,
        toolName: proposal.tool_name,
        label: proposal.label,
        description: proposal.description,
        category: proposal.category,
        params: proposal.params,
        status: needsConfirmation ? 'proposed' : 'approved',
        createdAt: Date.now(),
    };
}

/**
 * Execute an approved action.
 */
export async function executeAgentAction(
    action: AgentAction,
    userId: string
): Promise<ActionResult> {
    try {
        // Find the action in the registry
        const found = appRegistry.findAction(action.toolName);

        if (found) {
            // Execute via the registry's registered handler
            const result = await found.action.execute(action.params, userId);

            // Log to database
            await logAction(userId, action, 'executed', result);

            return result;
        }

        // If not in registry, it's likely a backend-only tool (like search)
        // Those are already executed by the backend, so this shouldn't happen
        return {
            success: false,
            message: `Action "${action.toolName}" not found in registry.`,
        };
    } catch (error: any) {
        const result: ActionResult = {
            success: false,
            message: error.message || 'Action execution failed.',
        };

        await logAction(userId, action, 'failed', result);
        return result;
    }
}

/**
 * Deny a proposed action.
 */
export async function denyAgentAction(
    action: AgentAction,
    userId: string
): Promise<void> {
    await logAction(userId, action, 'denied');
}

// ─── Audit Logging ───────────────────────────────────────────────

async function logAction(
    userId: string,
    action: AgentAction,
    status: string,
    result?: ActionResult
): Promise<void> {
    try {
        await (supabase as any).from('ai_action_log').insert({
            user_id: userId,
            action_id: action.id,
            tool_name: action.toolName,
            params: action.params,
            status,
            result: result ? { success: result.success, message: result.message } : null,
        });
    } catch (e) {
        console.warn('Failed to log AI action:', e);
    }
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Map a tool name to its trust category.
 * Used when the backend returns a tool call.
 */
export function getToolCategory(toolName: string): TrustCategory {
    const categoryMap: Record<string, TrustCategory> = {
        // ── Read tools (no confirmation) ──────────────────────────
        // Feed / Stories
        feed_getStories: 'content_read',
        feed_getComments: 'content_read',
        get_stories: 'content_read',
        get_story_detail: 'content_read',
        search_stories: 'content_read',
        get_campus_news: 'content_read',

        // Explore
        explore_searchStories: 'content_read',
        explore_searchUsers: 'content_read',

        // Profile
        profile_getProfile: 'content_read',
        get_user_profile: 'content_read',

        // Events
        get_events: 'content_read',

        // Campus Eats
        food_getRestaurants: 'content_read',
        food_getMenu: 'content_read',
        food_getMyOrders: 'content_read',

        // Leaderboards
        leaderboards_getAll: 'content_read',
        leaderboards_getRankings: 'content_read',
        get_leaderboard: 'content_read',

        // Unicampus
        unicampus_searchPapers: 'content_read',
        unicampus_getPaperDetails: 'content_read',
        unicampus_getUniversities: 'content_read',

        // Marketplace
        marketplace_getListings: 'content_read',

        // Lost & Found
        lostfound_getItems: 'content_read',

        // Campus Hustle
        hustle_getGigs: 'content_read',

        // Meet
        meet_getBlindDateStatus: 'content_read',
        check_blind_date_status: 'content_read',

        // Editor
        editor_getMyStories: 'content_read',

        // Settings
        get_settings: 'content_read',

        // ── Write tools (require confirmation) ────────────────────
        // Stories
        feed_createStory: 'content_write',
        feed_updateStory: 'content_write',
        feed_deleteStory: 'content_write',
        editor_publish: 'content_write',
        create_story: 'content_write',
        update_story: 'content_write',
        delete_story: 'content_write',

        // Comments
        feed_deleteComment: 'content_write',

        // Leaderboards
        leaderboards_addEntity: 'content_write',

        // Campus Eats
        food_placeOrder: 'content_write',
        food_cancelOrder: 'content_write',

        // Marketplace
        marketplace_postListing: 'content_write',
        marketplace_deleteListing: 'content_write',

        // Events

        // Lost & Found
        lostfound_reportItem: 'content_write',

        // Campus Hustle
        hustle_postGig: 'content_write',
        hustle_apply: 'content_write',

        // ── Social ────────────────────────────────────────────────
        feed_like: 'social',
        feed_comment: 'social',
        like_story: 'social',
        add_comment: 'social',
        leaderboards_castVote: 'social',
        cast_vote: 'social',
        food_addReview: 'social',
        meet_joinBlindDate: 'social',
        meet_createRoom: 'social',

        // ── Profile ───────────────────────────────────────────────
        profile_updateBio: 'profile',
        profile_updateHandle: 'profile',
        profile_updateName: 'profile',
        update_bio: 'profile',
        update_handle: 'profile',

        // ── Settings ─────────────────────────────────────────────
        settings_toggleTheme: 'settings',
        update_theme: 'settings',
        update_settings: 'settings',

        // ── Navigation ───────────────────────────────────────────
        apps_open: 'navigation',
        explore_performSearch: 'navigation',
        navigate_to_page: 'navigation',
        freshman_readTopic: 'navigation',
        datasets_download: 'navigation',
        runner_start: 'navigation',
    };

    // Normalize: dots and dots-to-underscores are used interchangeably
    const normalized = toolName.replace(/\./g, '_');
    return categoryMap[normalized] || categoryMap[toolName] || 'content_read';
}

/**
 * Determine if a tool is read-only (never needs confirmation).
 */
export function isReadOnlyTool(toolName: string): boolean {
    const readTools = new Set([
        // Legacy backend tools
        'get_stories', 'get_story_detail', 'search_stories', 'get_user_profile',
        'get_leaderboard', 'get_events', 'get_settings', 'check_blind_date_status', 'get_campus_news',
        // Registry actions (dot or underscore form)
        'feed.getStories', 'feed_getStories',
        'feed.getComments', 'feed_getComments',
        'explore.searchStories', 'explore_searchStories',
        'explore.searchUsers', 'explore_searchUsers',
        'profile.getProfile', 'profile_getProfile',
        'food.getRestaurants', 'food_getRestaurants',
        'food.getMenu', 'food_getMenu',
        'food.getMyOrders', 'food_getMyOrders',
        'leaderboards.getAll', 'leaderboards_getAll',
        'leaderboards.getRankings', 'leaderboards_getRankings',
        'unicampus.searchPapers', 'unicampus_searchPapers',
        'unicampus.getPaperDetails', 'unicampus_getPaperDetails',
        'unicampus.getUniversities', 'unicampus_getUniversities',
        'marketplace.getListings', 'marketplace_getListings',
        'lostfound.getItems', 'lostfound_getItems',
        'hustle.getGigs', 'hustle_getGigs',
        'meet.getBlindDateStatus', 'meet_getBlindDateStatus',
        'editor.getMyStories', 'editor_getMyStories',
    ]);
    // Normalize dots to underscores for matching
    const normalized = toolName.replace(/\./g, '_');
    return readTools.has(toolName) || readTools.has(normalized);
}
