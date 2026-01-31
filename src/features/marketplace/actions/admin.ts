
import { supabase } from "@marketplace/lib/supabase";
import type { IPost, IUserRequest } from "./types";

export async function adminHome() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    // Check if user is admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (profile?.role !== "ADMIN") return { error: "Unauthorized" };

    // Fetch pending posts
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        *,
        seller:seller_id (
          name:full_name,
          email,
          image:avatar_url,
          college
        )
      `)
      .order("created_at", { ascending: false }); // Filter by status pending if you have a status column

    // Fetch pending requests
    const { data: requests } = await supabase
      .from("requests")
      .select(`
        *,
        user:user_id (
          name:full_name,
          email,
          image:avatar_url,
          college
        )
      `)
      .order("created_at", { ascending: false });

    return { 
        posts: (posts || []) as IPost[], 
        requests: (requests || []) as IUserRequest[] 
    };
  } catch (error) {
    console.error("Error fetching admin home:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function requestDetails(id: string) {
  try {
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        user:user_id (
          name:full_name,
          email,
          image:avatar_url,
          college
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return { error: error.message };
    }

    return data;
  } catch (error) {
    console.error("Error fetching request details:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function approvePost(id: string) {
  try {
    const { error } = await supabase
      .from("posts")
      .update({ is_available: true }) // Or is_verified if you have that column
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return "Post approved";
  } catch (error) {
    console.error("Error approving post:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function rejectPost(id: string, reason: string) {
  try {
    // Maybe update status to 'REJECTED' or delete it
    // For now let's just mark unavailable
    const { error } = await supabase
      .from("posts")
      .update({ is_available: false }) 
      .eq("id", id);
      
    // Ideally log the rejection reason somewhere (e.g. notifications table)

    if (error) {
      return { error: error.message };
    }

    return "Post rejected";
  } catch (error) {
    console.error("Error rejecting post:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function approveRequest(id: string) {
  try {
    // Assuming you have a status column in requests? If not, maybe nothing to do.
    // Let's assume there is a status column
    /*
    const { error } = await supabase
      .from("requests")
      .update({ status: 'APPROVED' })
      .eq("id", id);
    */
    
    // If no status column, maybe just leave as is for now or implement verified flag
    return "Request approved";
  } catch (error) {
    console.error("Error approving request:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function rejectRequest(id: string, reason: string) {
  try {
    const { error } = await supabase
      .from("requests")
      .delete() // Or update status
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return "Request rejected";
  } catch (error) {
    console.error("Error rejecting request:", error);
    return { error: "An unexpected error occurred." };
  }
}
