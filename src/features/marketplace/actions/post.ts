import type { z } from "zod";
import type { CreatePostSchema } from "@marketplace/types/zodSchema";
import { supabase } from "@marketplace/lib/supabase";

export async function fetchPosts() {
  try {
    const { data, error } = await supabase
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
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: data };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function fetchPost(postId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        seller:seller_id (
          id,
          name:full_name,
          email,
          image:avatar_url,
          college,
          phone_no
        )
      `)
      .eq("id", postId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: data };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function fetchFilteredPosts(category: string, query?: string) {
  try {
    let supabaseQuery = supabase
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
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (category && category !== "ALL") {
      supabaseQuery = supabaseQuery.eq("category", category);
    }

    if (query) {
      supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      return { error: error.message };
    }

    return { success: data };
  } catch (error) {
    console.error("Error fetching filtered posts:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function createPost(values: z.infer<typeof CreatePostSchema>) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        ...values,
        seller_id: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return { error: error.message };
    }

    return { success: "Post created successfully!" };
  } catch (error) {
    console.error("Error in createPost:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updatePost(
  postId: string,
  modifiedData: Partial<{
    title?: string | undefined;
    category?: string | undefined;
    price?: string | undefined;
    description?: string | undefined;
    images?: string[] | undefined;
  }>
) {
  try {
    const { error } = await supabase
      .from("posts")
      .update(modifiedData)
      .eq("id", postId);

    if (error) {
      return { error: error.message };
    }

    return { success: "Post updated successfully" };
  } catch (error) {
    console.error("Error updating post:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function postSold(postId: string, customerId: string) {
  try {
    const { error } = await supabase
      .from("posts")
      .update({
        is_available: false,
        sold_to_user_id: customerId,
      })
      .eq("id", postId);

    if (error) {
      return { error: error.message };
    }

    return { success: "Post marked as sold" };
  } catch (error) {
    console.error("Error marking post as sold:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function sendFeedback({
  postId,
  rating,
  remark,
}: {
  postId: string;
  rating: number;
  remark?: string;
}) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: "User not authenticated" };
    }

    const { error } = await supabase.from("marketplace_feedback").insert({
      post_id: postId,
      customer_id: userData.user.id,
      rating,
      text: remark,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Feedback submitted successfully" };
  } catch (error) {
    console.error("Error sending feedback:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deletePost(postId: string) {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      return { error: error.message };
    }

    return { success: "Post deleted successfully" };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { error: "An unexpected error occurred." };
  }
}
