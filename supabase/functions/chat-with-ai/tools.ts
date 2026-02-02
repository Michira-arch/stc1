import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const toolsSchema = [
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
  {
    type: "function",
    function: {
      name: "get_campus_news",
      description: "Fetches the latest announcements or posts from the campus feed.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "integer",
            description: "Number of posts to fetch (default 3)",
          },
        },
        required: [],
      },
    },
  },
];

export async function executeTool(
  toolName: string,
  args: any,
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  console.log(`Executing tool: ${toolName} for user ${userId}`);

  if (toolName === "check_blind_date_status") {
    const { data, error } = await supabase
      .from("blind_date_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return `Error checking status: ${error.message}`;
    if (!data) return "User has no blind date profile set up.";
    
    return JSON.stringify({
      is_active: data.is_active,
      start_time: data.preferred_start_time,
      end_time: data.preferred_end_time
    });
  }

  if (toolName === "get_campus_news") {
    const limit = args.limit || 3;
    const { data, error } = await supabase
      .from("posts")
      .select("content, created_at, author:profiles(username)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return `Error fetching news: ${error.message}`;
    if (!data || data.length === 0) return "No recent news found.";

    return data.map((p: any) => 
      `- [${new Date(p.created_at).toLocaleDateString()}] ${p.author?.username}: ${p.content.substring(0, 100)}...`
    ).join("\n");
  }

  return "Tool not found.";
}
