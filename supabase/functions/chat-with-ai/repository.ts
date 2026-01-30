/*
import { createClient } from 'jsr:@supabase/supabase-js@2'

export const createSupabaseClient = (req: Request) => {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
}

export const createAdminClient = () => {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
}

export interface UserUsage {
    user_id: string;
    requests_today: number;
    last_reset_date: string;
    is_premium: boolean;
}

// Check and Update Quota
export const checkAndIncrementQuota = async (supabase: any, userId: string): Promise<{ allowed: boolean; isPremium: boolean; error?: string }> => {
    const today = new Date().toISOString().split('T')[0];
    const FREE_QUOTA = 20;

    // 1. Get or Create Usage Record
    let { data: usage, error } = await supabase
        .from('user_ai_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code === 'PGRST116') {
        // Create if not exists
        const { data: newUsage, error: createError } = await supabase
            .from('user_ai_usage')
            .insert({ user_id: userId, requests_today: 0, last_reset_date: today })
            .select()
            .single();

        if (createError) return { allowed: false, isPremium: false, error: 'Failed to initialize usage tracking' };
        usage = newUsage;
    }

    // 2. Reset Quota if new day
    if (usage.last_reset_date !== today) {
        const { data: updated, error: resetError } = await supabase
            .from('user_ai_usage')
            .update({ requests_today: 0, last_reset_date: today })
            .eq('user_id', userId)
            .select()
            .single();

        if (!resetError) usage = updated;
    }

    // 3. Check Quota
    if (!usage.is_premium && usage.requests_today >= FREE_QUOTA) {
        return { allowed: false, isPremium: false, error: 'Daily quota exceeded' };
    }

    // 4. Increment (Optimistic - we do this before the expensive AI call for simplicity, or after if strictly needed)
    // We'll increment here to prevent spam.
    await supabase.rpc('increment_ai_usage', { user_id_param: userId }); // We might need a simple RPC for atomic increment or just update

    // Fallback update if RPC not made
    await supabase
        .from('user_ai_usage')
        .update({ requests_today: usage.requests_today + 1 })
        .eq('user_id', userId);

    return { allowed: true, isPremium: usage.is_premium };
}

// RAG Search
export const searchContext = async (supabase: any, query: string, embedding: number[]) => {
    // 1. Search Stories
    const { data: stories } = await supabase.rpc('match_stories', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 3
    });

    return stories || [];
}
*/
