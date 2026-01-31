
import { supabase } from "@marketplace/lib/supabase";

export async function sendMessage(chatId: string, text: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        text
      });

    if (error) {
      return { error: error.message };
    }
    
    // Update chat's updated_at timestamp to bubble it to top
    await supabase.from("chats").update({ updated_at: new Date() }).eq("id", chatId);

    return { success: "Message sent" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteMessage(chatId: string, messageId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", user.id); // Ensure user owns message

    if (error) {
      return { error: error.message };
    }

    return { success: "Message deleted" };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { error: "An unexpected error occurred." };
  }
}
