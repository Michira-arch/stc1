/**
 * useRegisterPages — Registers all app pages/apps with the AI AppRegistry.
 *
 * Every page exposes capabilities (what it can display) and actions (what the AI can DO).
 * execute() functions make real Supabase calls — this IS the AI's tool execution layer.
 */

import { useEffect, useRef } from 'react';
import { appRegistry, PageRegistration } from '../ai/appRegistry';
import { supabase } from '../../store/supabaseClient';
import { useApp } from '../../store/AppContext';

export function useRegisterPages(activeTab: string) {
    const { stories, currentUser, isGuest } = useApp();
    const registeredRef = useRef(false);

    useEffect(() => {
        if (!registeredRef.current) {
            ALL_PAGES.forEach(page => appRegistry.register(page));
            registeredRef.current = true;
        }
        appRegistry.setActive(activeTab);
        return () => {
            ALL_PAGES.forEach(page => appRegistry.unregister(page.pageId));
            registeredRef.current = false;
        };
    }, []);

    useEffect(() => {
        appRegistry.setActive(activeTab);
    }, [activeTab]);
}

// ─── Helper ───────────────────────────────────────────────────────
const fmt = (rows: any[], fields: string[]) =>
    rows.map(r => fields.map(f => `${f}: ${r[f] ?? 'N/A'}`).join(' | ')).join('\n');

// ─── Page Definitions ────────────────────────────────────────────
const ALL_PAGES: PageRegistration[] = [

    // ── Feed ─────────────────────────────────────────────────────
    {
        pageId: 'feed',
        name: 'Home Feed',
        capabilities: [
            { id: 'feed.list', label: 'View Stories', description: 'Browse recent stories in the public feed', category: 'read' },
            { id: 'feed.manage', label: 'Manage Stories', description: 'Like, comment, update, or delete stories', category: 'write' },
        ],
        actions: [
            {
                id: 'feed.getStories',
                label: 'Get Stories',
                description: 'Fetch recent stories from the feed, optionally filtered by keyword or author',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [
                    { name: 'limit', type: 'number', required: false, description: 'How many stories to fetch (default 5)' },
                    { name: 'keyword', type: 'string', required: false, description: 'Filter by keyword in title/content' },
                    { name: 'author', type: 'string', required: false, description: 'Filter by author handle' },
                ],
                execute: async (params) => {
                    let q = (supabase as any)
                        .from('formatted_stories')
                        .select('id, title, author_handle, created_at, formatted_text')
                        .order('created_at', { ascending: false })
                        .limit(Math.min(params.limit || 5, 10));
                    if (params.keyword) q = q.or(`title.ilike.%${params.keyword}%,formatted_text.ilike.%${params.keyword}%`);
                    if (params.author) q = q.ilike('author_handle', `%${params.author}%`);
                    const { data, error } = await q;
                    if (error) return { success: false, message: error.message };
                    if (!data?.length) return { success: true, message: 'No stories found.', data: [] };
                    return { success: true, message: `Found ${data.length} stories.`, data: data.map((s: any) => ({ id: s.id, title: s.title, author: s.author_handle, preview: s.formatted_text?.substring(0, 120) })) };
                },
            },
            {
                id: 'feed.like',
                label: 'Like / Unlike a Story',
                description: 'Toggle like on a story — likes if not liked, unlikes if already liked',
                category: 'social',
                requiresConfirmation: true,
                parameters: [{ name: 'storyId', type: 'string', required: true, description: 'UUID of the story' }],
                execute: async (params, userId) => {
                    const { data: existing } = await supabase.from('likes').select('*').eq('user_id', userId).eq('story_id', params.storyId).maybeSingle();
                    if (existing) {
                        await supabase.from('likes').delete().eq('user_id', userId).eq('story_id', params.storyId);
                        return { success: true, message: 'Story unliked.' };
                    }
                    const { error } = await supabase.from('likes').insert({ user_id: userId, story_id: params.storyId });
                    return { success: !error, message: error ? error.message : 'Story liked! ❤️' };
                },
            },
            {
                id: 'feed.comment',
                label: 'Add Comment',
                description: 'Post a comment on a story',
                category: 'social',
                requiresConfirmation: true,
                parameters: [
                    { name: 'storyId', type: 'string', required: true, description: 'UUID of the story' },
                    { name: 'content', type: 'string', required: true, description: 'Comment text' },
                    { name: 'parentId', type: 'string', required: false, description: 'Parent comment UUID for replies' },
                ],
                execute: async (params, userId) => {
                    const { data, error } = await supabase.from('comments').insert({ story_id: params.storyId, user_id: userId, content: params.content, parent_id: params.parentId || null }).select('id').single();
                    return { success: !error, message: error ? error.message : 'Comment posted! 💬', data: data };
                },
            },
            {
                id: 'feed.deleteComment',
                label: 'Delete Comment',
                description: 'Delete one of the user\'s own comments',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [{ name: 'commentId', type: 'string', required: true, description: 'UUID of the comment to delete' }],
                execute: async (params, userId) => {
                    const { error } = await supabase.from('comments').delete().eq('id', params.commentId).eq('user_id', userId);
                    return { success: !error, message: error ? error.message : 'Comment deleted.' };
                },
            },
            {
                id: 'feed.createStory',
                label: 'Publish Story',
                description: 'Create and publish a new story to the feed',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'title', type: 'string', required: true, description: 'Story title' },
                    { name: 'content', type: 'string', required: true, description: 'Rich text HTML content' },
                    { name: 'description', type: 'string', required: false, description: 'Short preview description' },
                    { name: 'is_anonymous', type: 'boolean', required: false, description: 'Post anonymously?' },
                ],
                execute: async (params, userId) => {
                    const { data, error } = await supabase.from('stories').insert({ author_id: userId, title: params.title, content: params.content, description: params.description || '', is_anonymous: params.is_anonymous || false }).select('id, title').single();
                    return { success: !error, message: error ? error.message : `Story "${data?.title}" published! 🎉`, data };
                },
            },
            {
                id: 'feed.updateStory',
                label: 'Update Story',
                description: 'Edit the title, description, or content of one of the user\'s own stories',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'storyId', type: 'string', required: true, description: 'UUID of the story to edit' },
                    { name: 'title', type: 'string', required: false, description: 'New title' },
                    { name: 'description', type: 'string', required: false, description: 'New description' },
                    { name: 'content', type: 'string', required: false, description: 'New HTML content' },
                ],
                execute: async (params, userId) => {
                    const updates: any = { updated_at: new Date().toISOString() };
                    if (params.title) updates.title = params.title;
                    if (params.description) updates.description = params.description;
                    if (params.content) updates.content = params.content;
                    const { error } = await supabase.from('stories').update(updates).eq('id', params.storyId).eq('author_id', userId);
                    return { success: !error, message: error ? error.message : 'Story updated! ✏️' };
                },
            },
            {
                id: 'feed.deleteStory',
                label: 'Delete Story',
                description: 'Permanently delete one of the user\'s own stories',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [{ name: 'storyId', type: 'string', required: true, description: 'UUID of the story to delete' }],
                execute: async (params, userId) => {
                    const { error } = await supabase.from('stories').delete().eq('id', params.storyId).eq('author_id', userId);
                    return { success: !error, message: error ? error.message : 'Story deleted.' };
                },
            },
            {
                id: 'feed.getComments',
                label: 'Get Comments',
                description: 'Fetch comments for a story',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'storyId', type: 'string', required: true, description: 'UUID of the story' }],
                execute: async (params) => {
                    const { data, error } = await supabase.from('comments').select('id, content, user_id, parent_id, created_at').eq('story_id', params.storyId).order('created_at', { ascending: true }).limit(20);
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} comments found.`, data };
                },
            },
        ],
        getContext: async () => {
            const { data } = await (supabase as any).from('formatted_stories').select('title, author_handle, created_at').order('created_at', { ascending: false }).limit(5);
            if (!data?.length) return 'Feed is empty.';
            return `Latest stories:\n${data.map((s: any) => `- "${s.title}" by @${s.author_handle}`).join('\n')}`;
        },
    },

    // ── Explore ──────────────────────────────────────────────────
    {
        pageId: 'explore',
        name: 'Explore',
        capabilities: [
            { id: 'explore.search', label: 'Search', description: 'Search for stories and users', category: 'read' },
        ],
        actions: [
            {
                id: 'explore.searchStories',
                label: 'Search Stories',
                description: 'Full-text search across all stories by title and content',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [
                    { name: 'query', type: 'string', required: true, description: 'Search keywords' },
                    { name: 'limit', type: 'number', required: false, description: 'Max results (default 5)' },
                ],
                execute: async (params) => {
                    const { data, error } = await (supabase as any).from('formatted_stories').select('id, title, author_handle, formatted_text, created_at').or(`title.ilike.%${params.query}%,formatted_text.ilike.%${params.query}%`).order('created_at', { ascending: false }).limit(params.limit || 5);
                    if (error) return { success: false, message: error.message };
                    if (!data?.length) return { success: true, message: `No results for "${params.query}".`, data: [] };
                    return { success: true, message: `${data.length} results for "${params.query}".`, data: data.map((s: any) => ({ id: s.id, title: s.title, author: s.author_handle })) };
                },
            },
            {
                id: 'explore.searchUsers',
                label: 'Search Users',
                description: 'Find users by name or handle',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'query', type: 'string', required: true, description: 'Name or @handle to search' }],
                execute: async (params) => {
                    const { data, error } = await supabase.from('profiles').select('id, full_name, handle, bio, is_certified').or(`full_name.ilike.%${params.query}%,handle.ilike.%${params.query}%`).limit(8);
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} users found.`, data };
                },
            },
        ],
        getContext: async () => 'Explore page — search stories, discover users, and find trending content.',
    },

    // ── Editor ───────────────────────────────────────────────────
    {
        pageId: 'editor',
        name: 'Story Editor',
        capabilities: [
            { id: 'editor.write', label: 'Write Stories', description: 'Create and edit stories with rich text', category: 'read' },
        ],
        actions: [
            {
                id: 'editor.publish',
                label: 'Publish Story',
                description: 'Publish a new story directly to the feed',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'title', type: 'string', required: true, description: 'Story title' },
                    { name: 'content', type: 'string', required: true, description: 'Rich text HTML content' },
                    { name: 'description', type: 'string', required: false, description: 'Preview description' },
                    { name: 'is_anonymous', type: 'boolean', required: false, description: 'Post anonymously?' },
                ],
                execute: async (params, userId) => {
                    const { data, error } = await supabase.from('stories').insert({ author_id: userId, title: params.title, content: params.content, description: params.description || '', is_anonymous: params.is_anonymous || false }).select('id, title').single();
                    return { success: !error, message: error ? error.message : `Story "${data?.title}" published! 🎉` };
                },
            },
            {
                id: 'editor.getMyStories',
                label: 'Get My Stories',
                description: 'Fetch all stories written by the current user',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [],
                execute: async (params, userId) => {
                    const { data, error } = await supabase.from('stories').select('id, title, description, created_at, views_count').eq('author_id', userId).eq('is_hidden', false).order('created_at', { ascending: false }).limit(10);
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `You have ${data?.length || 0} stories.`, data };
                },
            },
        ],
        getContext: async () => 'Story Editor — user is writing or editing content.',
    },

    // ── Profile ──────────────────────────────────────────────────
    {
        pageId: 'profile',
        name: 'Profile',
        capabilities: [
            { id: 'profile.view', label: 'View Profile', description: 'See profile info, bio, stats', category: 'read' },
        ],
        actions: [
            {
                id: 'profile.getProfile',
                label: 'Get Profile',
                description: 'Read a user\'s profile data. Omit userId to get the current user\'s profile.',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'userId', type: 'string', required: false, description: 'UUID of user to look up (optional, defaults to self)' }],
                execute: async (params, userId) => {
                    const targetId = params.userId || userId;
                    const { data, error } = await supabase.from('profiles').select('id, full_name, handle, bio, avatar_url, is_certified, created_at').eq('id', targetId).single();
                    if (error) return { success: false, message: error.message };
                    const { count } = await supabase.from('stories').select('id', { count: 'exact', head: true }).eq('author_id', targetId).eq('is_hidden', false);
                    return { success: true, message: 'Profile loaded.', data: { ...data, stories_count: count } };
                },
            },
            {
                id: 'profile.updateBio',
                label: 'Update Bio',
                description: 'Change the current user\'s profile bio',
                category: 'profile',
                requiresConfirmation: true,
                parameters: [{ name: 'bio', type: 'string', required: true, description: 'New bio text' }],
                execute: async (params, userId) => {
                    const { error } = await supabase.from('profiles').update({ bio: params.bio }).eq('id', userId);
                    return { success: !error, message: error ? error.message : 'Bio updated! ✅' };
                },
            },
            {
                id: 'profile.updateHandle',
                label: 'Change Handle',
                description: 'Change the current user\'s @username',
                category: 'profile',
                requiresConfirmation: true,
                parameters: [{ name: 'handle', type: 'string', required: true, description: 'New handle (alphanumeric + underscores only)' }],
                execute: async (params, userId) => {
                    if (!/^[a-zA-Z0-9_]+$/.test(params.handle)) return { success: false, message: 'Handle can only contain letters, numbers, and underscores.' };
                    const { error } = await supabase.from('profiles').update({ handle: params.handle }).eq('id', userId);
                    if (error?.code === '23505') return { success: false, message: 'Handle already taken.' };
                    return { success: !error, message: error ? error.message : `Handle changed to @${params.handle}! ✅` };
                },
            },
            {
                id: 'profile.updateName',
                label: 'Update Display Name',
                description: 'Change the current user\'s display name',
                category: 'profile',
                requiresConfirmation: true,
                parameters: [{ name: 'fullName', type: 'string', required: true, description: 'New display name' }],
                execute: async (params, userId) => {
                    const { error } = await supabase.from('profiles').update({ full_name: params.fullName }).eq('id', userId);
                    return { success: !error, message: error ? error.message : `Name updated to "${params.fullName}"! ✅` };
                },
            },
        ],
        getContext: async () => 'Profile page — viewing a user\'s profile including bio, handle, and stories.',
    },

    // ── Settings ─────────────────────────────────────────────────
    {
        pageId: 'settings',
        name: 'Settings',
        capabilities: [
            { id: 'settings.view', label: 'View Settings', description: 'See current app configuration', category: 'read' },
        ],
        actions: [
            {
                id: 'settings.toggleTheme',
                label: 'Toggle Theme',
                description: 'Switch between light and dark mode',
                category: 'settings',
                requiresConfirmation: false,
                parameters: [{ name: 'theme', type: 'string', required: true, description: '"light" or "dark"', enum: ['light', 'dark'] }],
                execute: async (params) => {
                    return { success: true, message: `Theme set to "${params.theme}".`, data: { frontend_action: 'update_theme', params } };
                },
            },
        ],
        getContext: async () => 'Settings page — configure theme, text size, privacy, and AI trust levels.',
    },

    // ── STC Apps ─────────────────────────────────────────────────
    {
        pageId: 'apps',
        name: 'STC Apps Launcher',
        capabilities: [
            { id: 'apps.browse', label: 'Browse Apps', description: 'View all available STC apps', category: 'read' },
        ],
        actions: [
            {
                id: 'apps.open',
                label: 'Open App',
                description: 'Navigate to a specific STC app by ID',
                category: 'navigation',
                requiresConfirmation: false,
                parameters: [{ name: 'appId', type: 'string', required: true, description: 'App ID: food | marketplace | campus-hustle | lost-found | leaderboards | unicampus | open-datasets | freshman' }],
                execute: async (params) => {
                    return { success: true, message: `Navigating to ${params.appId}...`, data: { frontend_action: 'navigate', params: { page: params.appId } } };
                },
            },
        ],
        getContext: async () => 'STC Apps launcher — available apps: Campus Eats (food), Marketplace, Campus Hustle, Lost & Found (lost-found), Leaderboards, Unicampus, Open Datasets (open-datasets), Freshman Pack (freshman).',
    },

    // ── Campus Eats ──────────────────────────────────────────────
    {
        pageId: 'food',
        name: 'Campus Eats',
        capabilities: [
            { id: 'food.read', label: 'Browse Restaurants & Menu', description: 'View restaurants, menus, and prices', category: 'read' },
            { id: 'food.order', label: 'Place Orders', description: 'Order food for pickup', category: 'write' },
        ],
        actions: [
            {
                id: 'food.getRestaurants',
                label: 'Get Restaurants',
                description: 'List all active campus restaurants in Campus Eats',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [],
                execute: async () => {
                    const { data, error } = await (supabase as any).from('campuseats_restaurants').select('id, name, description, rating, delivery_time').eq('is_active', true).order('rating', { ascending: false });
                    if (error) return { success: false, message: error.message };
                    if (!data?.length) return { success: true, message: 'No restaurants available yet.', data: [] };
                    return { success: true, message: `${data.length} restaurants found.`, data };
                },
            },
            {
                id: 'food.getMenu',
                label: 'Get Menu',
                description: 'Fetch menu items for a specific restaurant',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'restaurantId', type: 'string', required: true, description: 'UUID of the restaurant' }],
                execute: async (params) => {
                    const { data, error } = await (supabase as any).from('campuseats_menu_items').select('id, name, description, price, category, tags, is_available').eq('restaurant_id', params.restaurantId).eq('is_available', true).order('category');
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} items on menu.`, data };
                },
            },
            {
                id: 'food.placeOrder',
                label: 'Place Order',
                description: 'Place a food order at a restaurant',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'restaurantId', type: 'string', required: true, description: 'UUID of the restaurant' },
                    { name: 'items', type: 'string', required: true, description: 'JSON array of {menuItemId, quantity} objects' },
                    { name: 'specialInstructions', type: 'string', required: false, description: 'Any special instructions' },
                ],
                execute: async (params, userId) => {
                    let items: any[];
                    try { items = JSON.parse(params.items); } catch { return { success: false, message: 'Invalid items format. Must be JSON array.' }; }
                    // Fetch prices
                    const ids = items.map((i: any) => i.menuItemId);
                    const { data: menuItems, error: menuErr } = await (supabase as any).from('campuseats_menu_items').select('id, price, name').in('id', ids);
                    if (menuErr) return { success: false, message: menuErr.message };
                    const totalAmount = items.reduce((sum: number, item: any) => {
                        const found = menuItems?.find((m: any) => m.id === item.menuItemId);
                        return sum + (found ? found.price * (item.quantity || 1) : 0);
                    }, 0);
                    const { data: order, error } = await (supabase as any).from('campuseats_orders').insert({ user_id: userId, restaurant_id: params.restaurantId, total_amount: totalAmount, special_instructions: params.specialInstructions || null }).select('id').single();
                    if (error) return { success: false, message: error.message };
                    // Insert order items
                    const orderItems = items.map((item: any) => {
                        const found = menuItems?.find((m: any) => m.id === item.menuItemId);
                        return { order_id: order.id, menu_item_id: item.menuItemId, menu_item_name: found?.name, quantity: item.quantity || 1, price_at_time: found?.price || 0 };
                    });
                    await (supabase as any).from('campuseats_order_items').insert(orderItems);
                    return { success: true, message: `Order placed! Total: Ksh ${totalAmount}. Pick up when ready. 🍽️`, data: { orderId: order.id } };
                },
            },
            {
                id: 'food.getMyOrders',
                label: 'Get My Orders',
                description: 'View the current user\'s recent food orders',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [],
                execute: async (params, userId) => {
                    const { data, error } = await (supabase as any).from('campuseats_orders').select('id, total_amount, status, created_at, campuseats_restaurants(name)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} recent orders.`, data };
                },
            },
            {
                id: 'food.cancelOrder',
                label: 'Cancel Order',
                description: 'Cancel a pending food order',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [{ name: 'orderId', type: 'string', required: true, description: 'UUID of the order to cancel' }],
                execute: async (params, userId) => {
                    const { error } = await (supabase as any).from('campuseats_orders').update({ status: 'cancelled' }).eq('id', params.orderId).eq('user_id', userId).in('status', ['pending', 'confirmed']);
                    return { success: !error, message: error ? error.message : 'Order cancelled.' };
                },
            },
            {
                id: 'food.addReview',
                label: 'Review Restaurant',
                description: 'Leave a rating and comment for a restaurant',
                category: 'social',
                requiresConfirmation: true,
                parameters: [
                    { name: 'restaurantId', type: 'string', required: true, description: 'UUID of the restaurant' },
                    { name: 'rating', type: 'number', required: true, description: 'Rating from 1 to 5' },
                    { name: 'comment', type: 'string', required: false, description: 'Optional review text' },
                ],
                execute: async (params, userId) => {
                    if (params.rating < 1 || params.rating > 5) return { success: false, message: 'Rating must be between 1 and 5.' };
                    const { error } = await (supabase as any).from('campuseats_reviews').insert({ restaurant_id: params.restaurantId, user_id: userId, rating: params.rating, comment: params.comment || null });
                    return { success: !error, message: error ? error.message : `Review posted! ${params.rating}⭐` };
                },
            },
        ],
        getContext: async () => {
            const { data } = await (supabase as any).from('campuseats_restaurants').select('name, rating').eq('is_active', true).order('rating', { ascending: false }).limit(5);
            if (!data?.length) return 'Campus Eats — no restaurants available yet.';
            return `Campus Eats — top restaurants:\n${data.map((r: any) => `- ${r.name} (${r.rating}⭐)`).join('\n')}`;
        },
    },

    // ── Marketplace ──────────────────────────────────────────────
    {
        pageId: 'marketplace',
        name: 'Marketplace',
        capabilities: [
            { id: 'marketplace.browse', label: 'Browse Listings', description: 'View items for sale by students', category: 'read' },
        ],
        actions: [
            {
                id: 'marketplace.getListings',
                label: 'Browse Listings',
                description: 'Get current marketplace listings, optionally filtered by category or keyword',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [
                    { name: 'keyword', type: 'string', required: false, description: 'Search in title or description' },
                    { name: 'category', type: 'string', required: false, description: 'Filter by category' },
                    { name: 'limit', type: 'number', required: false, description: 'Max results (default 10)' },
                ],
                execute: async (params) => {
                    // Marketplace posts are stories with a special category or stored in feed
                    let q = (supabase as any).from('formatted_stories').select('id, title, author_handle, formatted_text, created_at').order('created_at', { ascending: false }).limit(params.limit || 10);
                    if (params.keyword) q = q.or(`title.ilike.%${params.keyword}%,formatted_text.ilike.%${params.keyword}%`);
                    const { data, error } = await q;
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} listings found.`, data: data?.map((s: any) => ({ id: s.id, title: s.title, by: s.author_handle, preview: s.formatted_text?.substring(0, 100) })) };
                },
            },
            {
                id: 'marketplace.postListing',
                label: 'Post Listing',
                description: 'Create a new marketplace listing to sell an item',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'itemName', type: 'string', required: true, description: 'Item being sold' },
                    { name: 'price', type: 'number', required: true, description: 'Price in Ksh' },
                    { name: 'description', type: 'string', required: false, description: 'Condition, details, contact info' },
                ],
                execute: async (params, userId) => {
                    const content = `<p><strong>Price:</strong> Ksh ${params.price}</p>${params.description ? `<p>${params.description}</p>` : ''}`;
                    const { data, error } = await supabase.from('stories').insert({ author_id: userId, title: `🛒 ${params.itemName}`, content, description: `For sale: Ksh ${params.price}` }).select('id').single();
                    return { success: !error, message: error ? error.message : `Listing "${params.itemName}" posted! 🛒`, data };
                },
            },
            {
                id: 'marketplace.deleteListing',
                label: 'Delete Listing',
                description: 'Remove one of your own marketplace listings',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [{ name: 'listingId', type: 'string', required: true, description: 'UUID of the story/listing to delete' }],
                execute: async (params, userId) => {
                    const { error } = await supabase.from('stories').delete().eq('id', params.listingId).eq('author_id', userId);
                    return { success: !error, message: error ? error.message : 'Listing removed.' };
                },
            },
        ],
        getContext: async () => 'Marketplace — students buy and sell items. Listings are posted as stories.',
    },

    // ── Leaderboards ─────────────────────────────────────────────
    {
        pageId: 'leaderboards',
        name: 'Leaderboards',
        capabilities: [
            { id: 'leaderboards.view', label: 'View Rankings', description: 'See ELO-based rankings', category: 'read' },
            { id: 'leaderboards.vote', label: 'Vote', description: 'Cast votes in head-to-head matchups', category: 'write' },
        ],
        actions: [
            {
                id: 'leaderboards.getAll',
                label: 'List Leaderboards',
                description: 'Get all available leaderboard categories',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [],
                execute: async () => {
                    const { data, error } = await supabase.from('leaderboards').select('id, title, slug, description, entity_type').order('title');
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} leaderboards available.`, data };
                },
            },
            {
                id: 'leaderboards.getRankings',
                label: 'Get Rankings',
                description: 'Get top-ranked entities from a leaderboard',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [
                    { name: 'leaderboardSlug', type: 'string', required: false, description: 'Leaderboard slug (e.g. best-cafeteria-food). Omit to get all top entities.' },
                    { name: 'limit', type: 'number', required: false, description: 'Max results (default 10)' },
                ],
                execute: async (params) => {
                    let q = supabase.from('ranked_entities' as any).select('id, name, elo_score, match_count, leaderboard_id, leaderboards(title, slug)').order('elo_score', { ascending: false }).limit(params.limit || 10);
                    if (params.leaderboardSlug) {
                        const { data: lb } = await supabase.from('leaderboards').select('id').eq('slug', params.leaderboardSlug).single();
                        if (lb) q = q.eq('leaderboard_id', lb.id);
                    }
                    const { data, error } = await q;
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `Top ${data?.length || 0} entities.`, data: data?.map((r: any, i: number) => ({ rank: i + 1, name: r.name, elo: r.elo_score, matches: r.match_count, leaderboard: (r.leaderboards as any)?.title })) };
                },
            },
            {
                id: 'leaderboards.castVote',
                label: 'Cast Vote',
                description: 'Vote for a winner in a head-to-head leaderboard matchup',
                category: 'social',
                requiresConfirmation: true,
                parameters: [
                    { name: 'leaderboard_id', type: 'string', required: true, description: 'Leaderboard UUID' },
                    { name: 'winner_id', type: 'string', required: true, description: 'Winner entity UUID' },
                    { name: 'loser_id', type: 'string', required: true, description: 'Loser entity UUID' },
                ],
                execute: async (params) => {
                    const { error } = await supabase.rpc('submit_vote', { match_leaderboard_id: params.leaderboard_id, match_winner_id: params.winner_id, match_loser_id: params.loser_id, match_is_draw: false });
                    return { success: !error, message: error ? error.message : 'Vote cast! 🏆' };
                },
            },
            {
                id: 'leaderboards.addEntity',
                label: 'Add Entity to Leaderboard',
                description: 'Add a new candidate entity to a leaderboard',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'leaderboardId', type: 'string', required: true, description: 'UUID of the leaderboard' },
                    { name: 'name', type: 'string', required: true, description: 'Name of the entity to add' },
                ],
                execute: async (params) => {
                    const { data, error } = await (supabase as any).from('ranked_entities').insert({ leaderboard_id: params.leaderboardId, name: params.name }).select('id').single();
                    return { success: !error, message: error ? error.message : `"${params.name}" added to the leaderboard! 🏅` };
                },
            },
        ],
        getContext: async () => {
            const { data } = await supabase.from('leaderboards').select('title, slug').limit(5);
            if (!data?.length) return 'Leaderboards — no leaderboards yet.';
            return `Leaderboards:\n${data.map((lb: any) => `- ${lb.title} (${lb.slug})`).join('\n')}`;
        },
    },

    // ── Unicampus ────────────────────────────────────────────────
    {
        pageId: 'unicampus',
        name: 'Unicampus',
        capabilities: [
            { id: 'unicampus.papers', label: 'Past Papers', description: 'Search and access past exam papers', category: 'read' },
        ],
        actions: [
            {
                id: 'unicampus.searchPapers',
                label: 'Search Papers',
                description: 'Search the Unicampus database for past exam papers or CATs',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [
                    { name: 'query', type: 'string', required: false, description: 'Course code or title keyword (e.g., CSC 101)' },
                    { name: 'university', type: 'string', required: false, description: 'University ID (e.g., uon, ku, jkuat)' },
                    { name: 'category', type: 'string', required: false, description: 'Exam or CAT', enum: ['Exam', 'CAT'] },
                    { name: 'year', type: 'number', required: false, description: 'Year of the paper' },
                ],
                execute: async (params) => {
                    let q = (supabase as any).from('unicampus_papers').select('id, title, course_code, year, category, file_url, uploader_name, downloads').order('year', { ascending: false }).limit(10);
                    if (params.query) q = q.or(`title.ilike.%${params.query}%,course_code.ilike.%${params.query}%`);
                    if (params.university) q = q.eq('university_id', params.university);
                    if (params.category) q = q.eq('category', params.category);
                    if (params.year) q = q.eq('year', params.year);
                    const { data, error } = await q;
                    if (error) return { success: false, message: error.message };
                    if (!data?.length) return { success: true, message: 'No papers found for that query.', data: [] };
                    return { success: true, message: `${data.length} papers found.`, data: data.map((p: any) => ({ id: p.id, title: p.title, course: p.course_code, year: p.year, type: p.category, downloads: p.downloads, url: p.file_url })) };
                },
            },
            {
                id: 'unicampus.getPaperDetails',
                label: 'Get Paper Details',
                description: 'Get the download link and full details of a specific paper',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'paperId', type: 'string', required: true, description: 'UUID of the paper' }],
                execute: async (params) => {
                    const { data, error } = await (supabase as any).from('unicampus_papers').select('*').eq('id', params.paperId).single();
                    if (error) return { success: false, message: error.message };
                    await (supabase as any).rpc('increment_paper_preview', { p_paper_id: params.paperId });
                    return { success: true, message: 'Paper details loaded.', data };
                },
            },
            {
                id: 'unicampus.getUniversities',
                label: 'List Universities',
                description: 'Get all universities in the Unicampus system',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [],
                execute: async () => {
                    const { data, error } = await (supabase as any).from('unicampus_universities').select('id, name, short_name').order('name');
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} universities.`, data };
                },
            },
        ],
        getContext: async () => {
            const { count } = await (supabase as any).from('unicampus_papers').select('id', { count: 'exact', head: true });
            return `Unicampus — ${count || 0} past papers available across multiple Kenyan universities.`;
        },
    },

    // ── Open Datasets ────────────────────────────────────────────
    {
        pageId: 'open-datasets',
        name: 'Open Datasets',
        capabilities: [
            { id: 'datasets.browse', label: 'Browse Datasets', description: 'Access open research datasets', category: 'read' },
        ],
        actions: [
            {
                id: 'datasets.download',
                label: 'Open Dataset',
                description: 'Navigate to or open a research dataset by name',
                category: 'navigation',
                requiresConfirmation: false,
                parameters: [{ name: 'datasetName', type: 'string', required: true, description: 'Name of the dataset to open' }],
                execute: async (params) => {
                    return { success: true, message: `Opening dataset: ${params.datasetName}` };
                },
            },
        ],
        getContext: async () => 'Open Datasets — centralized access to open research data for students and researchers.',
    },

    // ── Meet / Realtime ──────────────────────────────────────────
    {
        pageId: 'meet',
        name: 'Meet',
        capabilities: [
            { id: 'meet.rooms', label: 'Video Rooms', description: 'Join or create video call rooms', category: 'read' },
            { id: 'meet.blindDate', label: 'Blind Date', description: 'Anonymous matching system', category: 'read' },
        ],
        actions: [
            {
                id: 'meet.getBlindDateStatus',
                label: 'Check Blind Date Status',
                description: 'Check if the user is active in the blind date matching pool',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [],
                execute: async (params, userId) => {
                    const { data, error } = await (supabase as any).from('blind_date_preferences').select('*').eq('user_id', userId).maybeSingle();
                    if (error) return { success: false, message: error.message };
                    if (!data) return { success: true, message: 'No blind date profile set up.', data: { active: false } };
                    return { success: true, message: `Blind date status: ${data.is_active ? 'Active' : 'Inactive'}`, data };
                },
            },
            {
                id: 'meet.joinBlindDate',
                label: 'Join Blind Date Pool',
                description: 'Opt into the anonymous blind date matching pool',
                category: 'social',
                requiresConfirmation: true,
                parameters: [
                    { name: 'startTime', type: 'string', required: false, description: 'Preferred start time (HH:MM)' },
                    { name: 'endTime', type: 'string', required: false, description: 'Preferred end time (HH:MM)' },
                ],
                execute: async (params, userId) => {
                    const { error } = await (supabase as any).from('blind_date_preferences').upsert({ user_id: userId, is_active: true, preferred_start_time: params.startTime, preferred_end_time: params.endTime }, { onConflict: 'user_id' });
                    return { success: !error, message: error ? error.message : 'You joined the blind date pool! 💕' };
                },
            },
        ],
        getContext: async () => 'Meet — real-time video rooms and anonymous blind date matching.',
    },

    // ── Freshman Pack ────────────────────────────────────────────
    {
        pageId: 'freshman',
        name: 'Freshman Starter Pack',
        capabilities: [
            { id: 'freshman.guide', label: 'Campus Guide', description: 'Tips and guides for new students', category: 'read' },
        ],
        actions: [
            {
                id: 'freshman.readTopic',
                label: 'Read Guide Topic',
                description: 'Open a specific topic in the freshman survival guide',
                category: 'navigation',
                requiresConfirmation: false,
                parameters: [{ name: 'topic', type: 'string', required: true, description: 'Topic to read (e.g. Housing, Registration, Classes, Food, Safety)' }],
                execute: async (params) => {
                    const topics: Record<string, string> = {
                        housing: 'Hostels are allocated early in semester. Apply via the student portal. Bring your own bedding and a padlock.',
                        registration: 'Register units online via the university portal. Deadline is usually Week 2. Clear fees first.',
                        classes: 'Timetables are released online. Download your app and join your unit WhatsApp groups.',
                        food: 'Cafeteria B has the best chapati. Kitchen A opens earliest at 6:30am. Use Campus Eats app to order.',
                        safety: 'Keep your student ID visible. Emergency number: Security post ext 111. Report incidents promptly.',
                    };
                    const key = params.topic.toLowerCase();
                    const info = topics[key] || `No specific guide found for "${params.topic}". Try: housing, registration, classes, food, or safety.`;
                    return { success: true, message: info };
                },
            },
        ],
        getContext: async () => 'Freshman Starter Pack — the campus survival guide. Topics: Housing, Registration, Classes, Food, Safety.',
    },

    // ── Lost & Found ─────────────────────────────────────────────
    {
        pageId: 'lost-found',
        name: 'Lost & Found',
        capabilities: [
            { id: 'lostfound.browse', label: 'Browse Items', description: 'Search for lost or found items', category: 'read' },
        ],
        actions: [
            {
                id: 'lostfound.getItems',
                label: 'Browse Lost & Found',
                description: 'List recent lost and found item reports',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'keyword', type: 'string', required: false, description: 'Filter by item name or location' }],
                execute: async (params) => {
                    let q = (supabase as any).from('formatted_stories').select('id, title, formatted_text, author_handle, created_at').ilike('title', '%found%').order('created_at', { ascending: false }).limit(10);
                    if (params.keyword) q = q.or(`title.ilike.%${params.keyword}%,formatted_text.ilike.%${params.keyword}%`);
                    const { data, error } = await q;
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} items listed.`, data: data?.map((s: any) => ({ id: s.id, title: s.title, by: s.author_handle, details: s.formatted_text?.substring(0, 120) })) };
                },
            },
            {
                id: 'lostfound.reportItem',
                label: 'Report Lost / Found Item',
                description: 'Post a new lost or found item report',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'type', type: 'string', required: true, description: '"Lost" or "Found"', enum: ['Lost', 'Found'] },
                    { name: 'itemName', type: 'string', required: true, description: 'Description of the item' },
                    { name: 'location', type: 'string', required: true, description: 'Where it was lost/found' },
                    { name: 'contactInfo', type: 'string', required: false, description: 'How to reach you' },
                ],
                execute: async (params, userId) => {
                    const title = `${params.type === 'Found' ? '🟢 Found' : '🔴 Lost'}: ${params.itemName}`;
                    const content = `<p><strong>Status:</strong> ${params.type}</p><p><strong>Item:</strong> ${params.itemName}</p><p><strong>Location:</strong> ${params.location}</p>${params.contactInfo ? `<p><strong>Contact:</strong> ${params.contactInfo}</p>` : ''}`;
                    const { error } = await supabase.from('stories').insert({ author_id: userId, title, content, description: `${params.type} at ${params.location}` });
                    return { success: !error, message: error ? error.message : `${params.type} item reported! Post is now live.` };
                },
            },
        ],
        getContext: async () => 'Lost & Found — students report lost or found items as public posts.',
    },

    // ── Campus Hustle ────────────────────────────────────────────
    {
        pageId: 'campus-hustle',
        name: 'Campus Hustle',
        capabilities: [
            { id: 'hustle.browse', label: 'Browse Gigs', description: 'Find freelance gigs and tasks', category: 'read' },
        ],
        actions: [
            {
                id: 'hustle.getGigs',
                label: 'Browse Gigs',
                description: 'List available freelance gigs and micro-tasks',
                category: 'content_read',
                requiresConfirmation: false,
                parameters: [{ name: 'keyword', type: 'string', required: false, description: 'Filter gigs by keyword' }],
                execute: async (params) => {
                    let q = (supabase as any).from('formatted_stories').select('id, title, formatted_text, author_handle, created_at').ilike('title', '%gig%').order('created_at', { ascending: false }).limit(10);
                    if (params.keyword) q = q.or(`title.ilike.%${params.keyword}%,formatted_text.ilike.%${params.keyword}%`);
                    const { data, error } = await q;
                    if (error) return { success: false, message: error.message };
                    return { success: true, message: `${data?.length || 0} gigs found.`, data: data?.map((s: any) => ({ id: s.id, title: s.title, by: s.author_handle, preview: s.formatted_text?.substring(0, 100) })) };
                },
            },
            {
                id: 'hustle.postGig',
                label: 'Post a Gig',
                description: 'Post a freelance task or micro-job offer',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'title', type: 'string', required: true, description: 'Gig title' },
                    { name: 'pay', type: 'number', required: true, description: 'Pay in Ksh' },
                    { name: 'description', type: 'string', required: false, description: 'Gig details, skills needed, deadline' },
                ],
                execute: async (params, userId) => {
                    const content = `<p><strong>Pay:</strong> Ksh ${params.pay}</p>${params.description ? `<p>${params.description}</p>` : ''}`;
                    const { error } = await supabase.from('stories').insert({ author_id: userId, title: `💼 Gig: ${params.title}`, content, description: `Pay: Ksh ${params.pay}` });
                    return { success: !error, message: error ? error.message : `Gig "${params.title}" posted for Ksh ${params.pay}! 💼` };
                },
            },
            {
                id: 'hustle.apply',
                label: 'Apply for a Gig',
                description: 'Post a comment applying to a specific gig',
                category: 'content_write',
                requiresConfirmation: true,
                parameters: [
                    { name: 'storyId', type: 'string', required: true, description: 'UUID of the gig post/story' },
                    { name: 'pitch', type: 'string', required: true, description: 'Your pitch — why you are the right fit' },
                ],
                execute: async (params, userId) => {
                    const { error } = await supabase.from('comments').insert({ story_id: params.storyId, user_id: userId, content: `📩 Application: ${params.pitch}` });
                    return { success: !error, message: error ? error.message : 'Application submitted as a comment! 📩' };
                },
            },
        ],
        getContext: async () => 'Campus Hustle — student freelance marketplace for micro-gigs and tasks.',
    },

    // ── Runner Game ──────────────────────────────────────────────
    {
        pageId: 'runner',
        name: 'Runner Game',
        capabilities: [
            { id: 'runner.play', label: 'Play Game', description: 'Endless runner game for campus fun', category: 'read' },
        ],
        actions: [
            {
                id: 'runner.start',
                label: 'Start Runner Game',
                description: 'Launch the endless runner game',
                category: 'navigation',
                requiresConfirmation: false,
                parameters: [],
                execute: async () => {
                    return { success: true, message: 'Runner Game starting! 🎮 Tap or press Space to jump.' };
                },
            },
        ],
        getContext: async () => 'Runner Game — an endless runner game for campus fun and spirit.',
    },
];
