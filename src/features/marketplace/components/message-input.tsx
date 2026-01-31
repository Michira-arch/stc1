"use client";

import { type FormEvent, useRef, useState } from "react";

import { Button } from "@marketplace/components/ui/button";
import { Textarea } from "@marketplace/components/ui/textarea";
import { Send } from "lucide-react";
import Spinner from "@marketplace/components/spinner";
import { sendMessage } from "@marketplace/actions/message";
import { toast } from "sonner";

export function MessageInput({
  chatId,
  receiverId,
}: {
  chatId: string;
  receiverId: string;
}) {
  const message = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendMessage(e?: FormEvent) {
    e?.preventDefault();

    const text = message.current?.value;
    if (!text || text.trim().length < 1) return;

    setLoading(true);
    try {
        const { error } = await sendMessage(chatId, text);
        
        if (error) {
            toast.error(error);
        } else {
            if (message.current) message.current.value = "";
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to send message");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="sticky bottom-0 mb-20 lg:mb-0 px-2 pb-2 border-r border-gray-100 flex gap-2 items-center">
      <div className="w-full relative">
        <form onSubmit={handleSendMessage}>
          <Textarea rows={5} placeholder="your message" ref={message} />
          {loading ? (
            <Button disabled className="absolute bottom-0 right-0 m-2">
              <Spinner />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="absolute bottom-0 right-0 m-2 bg-primary hover:bg-market-accent text-white"
            >
              <Send />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
