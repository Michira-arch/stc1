"use client";

import { type FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@marketplace/components/ui/button";
import { toast } from "sonner";

import { startChat } from "@marketplace/actions/chat";
import { useNavigate } from "react-router-dom";

export function MessageSellerBtn({ sellerId }: { sellerId: string }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function handleMessageSeller(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    const response = await startChat(sellerId);

    if (response?.error) {
      toast.error(response.error);
      setPending(false);
      return;
    }

    if ((response as any)?.success === "REDIRECT") {
      setPending(false);
      return navigate(`/messages/${(response as any).chatId}`);
    }

    setPending(false);
    return navigate(`/messages/${response?.success}`);
  }

  return (
    <form onSubmit={handleMessageSeller}>
      <Button
        disabled={pending}
        className="w-full max-w-md bg-primary text-white hover:bg-market-accent"
      >
        {pending ? (
          "Initiating chat"
        ) : (
          <>
            <Send className="mr-2" /> Message seller
          </>
        )}
      </Button>
    </form>
  );
}
