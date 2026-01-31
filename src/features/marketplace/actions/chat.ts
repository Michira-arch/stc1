
import { supabase } from "@marketplace/lib/supabase";

export async function getAllChats() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    // Fetch chats where the user is a participant
    // Note: This often requires a many-to-many query or checking an array column.
    // Assuming 'chats' has a 'participant_ids' array or a separate 'chat_participants' table.
    // Based on common Supabase patterns (and your likely schema), let's assume 'chats' has 'participant_ids' (array of uuids).
    
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        messages (
          id,
          text,
          created_at,
          is_read,
          sender_id
        ),
        participants:chat_participants (
          user:user_id (
            id,
            name:full_name,
            image:avatar_url
          )
        )
      `)
      // .contains("participant_ids", [user.id]) // Alternative if using array column
      // If using a junction table 'chat_participants', we filter differently:
      // However, Supabase complex filtering on nested resources can be tricky.
      // A common pattern: get chat_ids from chat_participants first.
      
      // Let's try the simpler approach first if your schema supports it:
      // We'll rely on RLS to filter chats the user is part of.
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      return { error: error.message };
    }
    
    // Transform data to match frontend expectations if necessary
    // The frontend expects 'participants' to be an array of users.
    // The join returns participants as [{ user: {...} }, { user: {...} }]
    
    const formattedChats = data.map((chat: any) => ({
      ...chat,
      participants: chat.participants.map((p: any) => p.user),
      lastMessage: chat.messages?.[0] || null // Assuming we order messages or fetch last
    }));

    return { success: formattedChats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function getChat(id: string) {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select(`
        id,
        created_at,
        updated_at,
        messages (
          id,
          text,
          created_at,
          sender_id,
          is_read
        ),
        participants:chat_participants (
          user:user_id (
            id,
            name:full_name,
            image:avatar_url,
            email
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return { error: error.message };
    }

    const formattedChat = {
        ...data,
        participants: data.participants.map((p: any) => p.user),
        messages: data.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    };

    return { success: formattedChat };
  } catch (error) {
    console.error("Error fetching chat:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function startChat(withUserId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Not authenticated" };

    // Check if a chat already exists between these two users
    // This is complex in SQL. Easier to do an RPC or client-side check if allowed.
    // For now, let's try to create a new chat and rely on a "get_or_create" logic
    
    // 1. Call RPC function if you created one (recommended for atomic "get or create")
    // If not, we can try to find it:
    
    const { data: existingChatId, error: rpcError } = await supabase
        .rpc('get_chat_id_between_users', { user1_id: user.id, user2_id: withUserId });

    if (existingChatId) {
        return { success: existingChatId };
    }
    
    // 2. Create Chat if not exists
    const { data: newChat, error: createError } = await supabase
        .from("chats")
        .insert({})
        .select()
        .single();
        
    if (createError) throw createError;
    
    // 3. Add Participants
    const { error: partError } = await supabase
        .from("chat_participants")
        .insert([
            { chat_id: newChat.id, user_id: user.id },
            { chat_id: newChat.id, user_id: withUserId }
        ]);

    if (partError) throw partError;

    return { success: newChat.id };
  } catch (error) {
    console.error("Error starting chat:", error);
    return { error: "An unexpected error occurred." };
  }
}

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
    
    // Update chat's updated_at timestamp
    await supabase.from("chats").update({ updated_at: new Date() }).eq("id", chatId);

    return { success: "Message sent" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "An unexpected error occurred." };
  }
}
