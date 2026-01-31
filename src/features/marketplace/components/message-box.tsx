"use client";

import { useEffect, useState } from "react";
import { supabase } from "@marketplace/lib/supabase";

import type { IChat, IMessage } from "@marketplace/actions/types";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";

interface IMessageBoxProps {
  chat: IChat;
  userId: string;
}

export function MessageBox({ chat, userId }: IMessageBoxProps) {
  const [messages, setMessages] = useState<IMessage[]>(chat.messages);

  useEffect(() => {
    // Initial messages set from props
    setMessages(chat.messages);

    // Subscribe to new messages for this chat
    const channel = supabase
      .channel(`chat:${chat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chat.id}`
        },
        (payload) => {
          const newMessage = payload.new as IMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.id, chat.messages]);

  return (
    <>
      {/* Chat Messages */}
      <div className="flex-1 max-h-[60dvh] lg:max-h-full overflow-y-auto p-2 border-r border-gray-100 scrollbar-thin">
        <ChatMessages messages={messages} userId={userId} />
      </div>

      {/* Input Bar */}
      <MessageInput
        chatId={chat.id}
        receiverId={
          chat.participants.filter((user) => user.id !== userId)[0].id
        }
      />
    </>
  );
}
