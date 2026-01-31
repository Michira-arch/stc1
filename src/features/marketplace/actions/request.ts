
import { supabase } from "@marketplace/lib/supabase";
import type { z } from "zod";
import type { CreateRequestSchema } from "@marketplace/types/zodSchema";

export async function fetchRequests() {
  try {
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        user:user_id (
          id,
          name:full_name,
          email,
          image:avatar_url,
          college
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { requests: data };
  } catch (error) {
    console.error("Error fetching requests:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function createRequest(
  values: z.infer<typeof CreateRequestSchema>
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const { error } = await supabase.from("requests").insert({
      ...values,
      user_id: user.id,
      upvotes: 0 // Initialize upvotes
    });

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    return { success: "Request created successfully" };
  } catch (error) {
    console.error("Error creating request:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function upVoteRequest(requestId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    // Check if already upvoted
    const { data: existingVote } = await supabase
      .from("upvotes")
      .select("*")
      .eq("request_id", requestId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
       // Remove upvote (toggle behavior)
       await supabase
        .from("upvotes")
        .delete()
        .eq("request_id", requestId)
        .eq("user_id", user.id);
        
       // Decrement count
       await supabase.rpc('decrement_upvotes', { row_id: requestId });
       return { success: "Upvote removed" };
    } else {
       // Add upvote
       await supabase
        .from("upvotes")
        .insert({ request_id: requestId, user_id: user.id });
        
       // Increment count
       await supabase.rpc('increment_upvotes', { row_id: requestId });
       return { success: "Upvoted" };
    }
  } catch (error) {
    console.error("Error upvoting:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from("requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      return { error: error.message };
    }

    return { success: "Request deleted successfully" };
  } catch (error) {
    console.error("Error deleting request:", error);
    return { error: "An unexpected error occurred." };
  }
}
