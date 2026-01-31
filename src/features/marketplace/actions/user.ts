
import { supabase } from "@marketplace/lib/supabase";
import type { IUserNotification } from "./types";

export async function fetchUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        name:full_name,
        email,
        image:avatar_url,
        college,
        phoneNo:phone_no,
        role
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: data };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateProfile(
  modifiedData: Partial<{
    name?: string | undefined;
    password?: string | undefined;
    phoneNo?: string | undefined;
    image?: string | undefined;
  }>
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    // Map frontend fields to DB fields
    const updates: any = {};
    if (modifiedData.name) updates.full_name = modifiedData.name;
    if (modifiedData.image) updates.avatar_url = modifiedData.image;
    if (modifiedData.phoneNo) updates.phone_no = modifiedData.phoneNo;

    // Password update is handled differently in Supabase
    if (modifiedData.password) {
      const { error: pwdError } = await supabase.auth.updateUser({
        password: modifiedData.password
      });
      if (pwdError) return { error: pwdError.message };
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) return { error: error.message };
    }

    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteUser() {
  try {
    // Note: Deleting a user in Supabase usually requires calling the admin API or using a specific RPC function if allowed.
    // For now, we'll try to delete from public.profiles, but auth.users deletion might be restricted.
    // If you need to delete the account completely, it's best to use a Supabase Edge Function or RPC.

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    // Placeholder: In a real app, you might want to mark as deleted or use an RPC
    // await supabase.rpc('delete_user_account') 

    return { error: "Account deletion is not yet supported via client-side." };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function fetchUserNotifications() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("target_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { success: data as IUserNotification[] };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function markAsRead(id: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return { success: "Marked as read" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error: "An unexpected error occurred." };
  }
}
