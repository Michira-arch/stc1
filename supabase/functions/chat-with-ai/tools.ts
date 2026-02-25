/*
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Tool Schema (OpenAI function-calling format) ─────────────────

export const toolsSchema = [
  // ─── Content: Read ─────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "get_stories",
      description: "Fetches recent public stories from the STC feed. Use this when the user asks about stories, posts, news, or content on the platform. Supports filtering by keyword, author, or recency.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", description: "Number of stories to fetch (default 5, max 10)" },
          keyword: { type: "string", description: "Optional keyword to search in title or content." },
          author: { type: "string", description: "Optional author handle to filter by (e.g., 'john_doe')." },
          days_ago: { type: "integer", description: "Optional filter for stories created in the last N days." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_story_detail",
      description: "Gets full details of a specific story by its ID, including content, comments, likes count, and author info.",
      parameters: {
        type: "object",
        properties: {
          story_id: { type: "string", description: "The UUID of the story to fetch." },
        },
        required: ["story_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_stories",
      description: "Full-text search across all stories. More powerful than get_stories keyword filter — searches titles, descriptions, and content body.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query text." },
          limit: { type: "integer", description: "Max results (default 5, max 10)." },
        },
        required: ["query"],
      },
    },
  },

  // ─── Content: Write ────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "create_story",
      description: "Creates and publishes a new story on behalf of the user. Use when the user asks you to write or post something. Always confirm the title and content with the user before calling this.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the story." },
          description: { type: "string", description: "Short description/hook for the feed preview." },
          content: { type: "string", description: "Full HTML content of the story." },
          is_anonymous: { type: "boolean", description: "Whether to post anonymously (default false)." },
        },
        required: ["title", "content"],
      },
    },
  },

  // ─── Social ────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "like_story",
      description: "Likes a story on behalf of the user. If already liked, it will unlike.",
      parameters: {
        type: "object",
        properties: {
          story_id: { type: "string", description: "The UUID of the story to like." },
        },
        required: ["story_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_comment",
      description: "Adds a comment to a story on behalf of the user.",
      parameters: {
        type: "object",
        properties: {
          story_id: { type: "string", description: "The UUID of the story to comment on." },
          content: { type: "string", description: "The comment text." },
          parent_id: { type: "string", description: "Optional parent comment ID for replies." },
        },
        required: ["story_id", "content"],
      },
    },
  },

  // ─── Profile ───────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "get_user_profile",
      description: "Gets the current user's profile information or a specific user's public profile.",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string", description: "Optional user ID. If omitted, returns the current user's profile." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_bio",
      description: "Updates the user's bio/about text on their profile.",
      parameters: {
        type: "object",
        properties: {
          bio: { type: "string", description: "The new bio text." },
        },
        required: ["bio"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_handle",
      description: "Changes the user's unique handle/username. Must be alphanumeric with underscores only.",
      parameters: {
        type: "object",
        properties: {
          handle: { type: "string", description: "The new handle (e.g., 'cool_student_23')." },
        },
        required: ["handle"],
      },
    },
  },

  // ─── Leaderboard ───────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "get_leaderboard",
      description: "Gets the top-ranked entities from a campus leaderboard. Leaderboards rank things using ELO scores from user votes.",
      parameters: {
        type: "object",
        properties: {
          leaderboard_slug: { type: "string", description: "The slug of the leaderboard (e.g., 'best-cafeteria-food')." },
          limit: { type: "integer", description: "Number of ranked items to fetch (default 5)." },
        },
        required: [],
      },
    },
  },

  // ─── Settings ──────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "update_theme",
      description: "Toggles the app theme between light and dark mode on behalf of the user.",
      parameters: {
        type: "object",
        properties: {
          theme: { type: "string", enum: ["light", "dark"], description: "The desired theme." },
        },
        required: ["theme"],
      },
    },
  },

  // ─── Navigation ────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: "Navigates the user to a specific page or app within STC. Use when the user wants to go somewhere or you want to show them a specific feature.",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: ["feed", "explore", "editor", "profile", "settings", "apps", "food", "marketplace", "leaderboards", "unicampus", "open-datasets", "meet"],
            description: "The page/app to navigate to.",
          },
        },
        required: ["page"],
      },
    },
  },

  // ─── Realtime ──────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "check_blind_date_status",
      description: "Checks if the current user is active in the blind date pool and their preferred times.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// ─── Write tool detection ────────────────────────────────────────

const WRITE_TOOLS = new Set([
  'create_story', 'like_story', 'add_comment',
  'update_bio', 'update_handle', 'update_theme',
  'navigate_to_page',
]);

export function isWriteTool(name: string): boolean {
  return WRITE_TOOLS.has(name);
}

// ─── Tool Execution ──────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  args: any,
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  console.log(`Executing tool: ${toolName} for user ${userId}`);

  try {
    switch (toolName) {

      // ── Content: Read ────────────────────────────────────────
      case "get_stories":
      case "get_campus_news": {
        const limit = Math.min(args.limit || 5, 10);
        let query = supabase
          .from("formatted_stories")
          .select("id, title, formatted_text, author_id, author_handle, created_at");

        if (args.keyword) {
          query = query.or(`title.ilike.%${args.keyword}%,formatted_text.ilike.%${args.keyword}%`);
        }
        if (args.author) {
          query = query.ilike("author_handle", `%${args.author}%`);
        }
        if (args.days_ago) {
          const date = new Date();
          date.setDate(date.getDate() - args.days_ago);
          query = query.gte("created_at", date.toISOString());
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) return JSON.stringify({ error: error.message });
        if (!data || data.length === 0) return JSON.stringify({ message: "No stories found matching the criteria." });

        return JSON.stringify({
          count: data.length,
          stories: data.map((s: any) => ({
            id: s.id,
            title: s.title,
            author: s.author_handle,
            preview: s.formatted_text?.substring(0, 200),
            created_at: s.created_at,
          })),
        });
      }

      case "get_story_detail": {
        const { data, error } = await supabase
          .from("stories")
          .select(`
            *,
            author:profiles!stories_author_id_fkey(id, full_name, handle, avatar_url, is_certified),
            likes(user_id),
            comments(id, content, user_id, parent_id, created_at)
          `)
          .eq("id", args.story_id)
          .single();

        if (error) return JSON.stringify({ error: error.message });
        if (!data) return JSON.stringify({ error: "Story not found." });

        return JSON.stringify({
          id: data.id,
          title: data.title,
          description: data.description,
          content: data.content?.substring(0, 2000), // limit for token budget
          author: data.author?.full_name || 'Unknown',
          author_handle: data.author?.handle,
          likes_count: data.likes?.length || 0,
          comments_count: data.comments?.length || 0,
          views: data.views_count,
          created_at: data.created_at,
          is_anonymous: data.is_anonymous,
          comments: (data.comments || []).slice(0, 5).map((c: any) => ({
            id: c.id,
            content: c.content,
            created_at: c.created_at,
          })),
        });
      }

      case "search_stories": {
        const limit = Math.min(args.limit || 5, 10);
        const query = args.query;

        const { data, error } = await supabase
          .from("formatted_stories")
          .select("id, title, formatted_text, author_handle, created_at")
          .or(`title.ilike.%${query}%,formatted_text.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) return JSON.stringify({ error: error.message });
        if (!data || data.length === 0) return JSON.stringify({ message: `No stories found matching "${query}".` });

        return JSON.stringify({
          query,
          count: data.length,
          results: data.map((s: any) => ({
            id: s.id,
            title: s.title,
            author: s.author_handle,
            preview: s.formatted_text?.substring(0, 150),
          })),
        });
      }

      // ── Content: Write ───────────────────────────────────────
      case "create_story": {
        const { data, error } = await supabase
          .from("stories")
          .insert({
            author_id: userId,
            title: args.title,
            description: args.description || '',
            content: args.content,
            is_anonymous: args.is_anonymous || false,
          })
          .select("id, title")
          .single();

        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({
          success: true,
          message: `Story "${data.title}" published successfully!`,
          story_id: data.id,
        });
      }

      // ── Social ───────────────────────────────────────────────
      case "like_story": {
        // Check if already liked
        const { data: existing } = await supabase
          .from("likes")
          .select("*")
          .eq("user_id", userId)
          .eq("story_id", args.story_id)
          .maybeSingle();

        if (existing) {
          // Unlike
          await supabase.from("likes").delete().eq("user_id", userId).eq("story_id", args.story_id);
          return JSON.stringify({ success: true, message: "Story unliked.", action: "unliked" });
        } else {
          // Like
          const { error } = await supabase.from("likes").insert({ user_id: userId, story_id: args.story_id });
          if (error) return JSON.stringify({ error: error.message });
          return JSON.stringify({ success: true, message: "Story liked!", action: "liked" });
        }
      }

      case "add_comment": {
        const { data, error } = await supabase
          .from("comments")
          .insert({
            story_id: args.story_id,
            user_id: userId,
            content: args.content,
            parent_id: args.parent_id || null,
          })
          .select("id")
          .single();

        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: "Comment added!", comment_id: data.id });
      }

      // ── Profile ──────────────────────────────────────────────
      case "get_user_profile": {
        const targetId = args.user_id || userId;
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, handle, bio, avatar_url, cover_url, is_certified, created_at")
          .eq("id", targetId)
          .single();

        if (error) return JSON.stringify({ error: error.message });
        if (!data) return JSON.stringify({ error: "User not found." });

        // Get stats
        const { count: storyCount } = await supabase
          .from("stories")
          .select("id", { count: 'exact', head: true })
          .eq("author_id", targetId)
          .eq("is_hidden", false);

        return JSON.stringify({
          id: data.id,
          name: data.full_name,
          handle: data.handle,
          bio: data.bio,
          avatar_url: data.avatar_url,
          is_certified: data.is_certified,
          stories_count: storyCount || 0,
          member_since: data.created_at,
        });
      }

      case "update_bio": {
        const { error } = await supabase
          .from("profiles")
          .update({ bio: args.bio })
          .eq("id", userId);

        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify({ success: true, message: "Bio updated!" });
      }

      case "update_handle": {
        if (!/^[a-zA-Z0-9_]+$/.test(args.handle)) {
          return JSON.stringify({ error: "Handle can only contain letters, numbers, and underscores." });
        }

        const { error } = await supabase
          .from("profiles")
          .update({ handle: args.handle })
          .eq("id", userId);

        if (error) {
          if (error.code === '23505') return JSON.stringify({ error: "Handle already taken." });
          return JSON.stringify({ error: error.message });
        }
        return JSON.stringify({ success: true, message: `Handle changed to @${args.handle}` });
      }

      // ── Leaderboard ──────────────────────────────────────────
      case "get_leaderboard": {
        const limit = Math.min(args.limit || 5, 20);

        let query = supabase
          .from("ranked_entities")
          .select("id, name, image_url, elo_score, match_count, leaderboard_id, leaderboards(title, slug)")
          .order("elo_score", { ascending: false })
          .limit(limit);

        if (args.leaderboard_slug) {
          // Need to find leaderboard by slug first
          const { data: lb } = await supabase
            .from("leaderboards")
            .select("id")
            .eq("slug", args.leaderboard_slug)
            .single();

          if (lb) {
            query = query.eq("leaderboard_id", lb.id);
          }
        }

        const { data, error } = await query;
        if (error) return JSON.stringify({ error: error.message });

        return JSON.stringify({
          count: data?.length || 0,
          rankings: (data || []).map((r: any, i: number) => ({
            rank: i + 1,
            name: r.name,
            elo_score: r.elo_score,
            matches: r.match_count,
          })),
        });
      }

      // ── Settings ─────────────────────────────────────────────
      case "update_theme": {
        // Theme is client-side only; return instruction for frontend to execute
        return JSON.stringify({
          success: true,
          message: `Theme change to "${args.theme}" requested.`,
          frontend_action: "update_theme",
          params: { theme: args.theme },
        });
      }

      // ── Navigation ───────────────────────────────────────────
      case "navigate_to_page": {
        return JSON.stringify({
          success: true,
          message: `Navigating to ${args.page}...`,
          frontend_action: "navigate",
          params: { page: args.page },
        });
      }

      // ── Realtime ─────────────────────────────────────────────
      case "check_blind_date_status": {
        const { data, error } = await supabase
          .from("blind_date_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) return JSON.stringify({ error: error.message });
        if (!data) return JSON.stringify({ message: "User has no blind date profile set up." });

        return JSON.stringify({
          is_active: data.is_active,
          start_time: data.preferred_start_time,
          end_time: data.preferred_end_time,
        });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error: any) {
    console.error(`Tool execution error (${toolName}):`, error);
    return JSON.stringify({ error: error.message || "Tool execution failed." });
  }
}
*/