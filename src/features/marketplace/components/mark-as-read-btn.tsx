"use client";

import { useState, type FormEvent } from "react";
import { markAsRead } from "@marketplace/actions/user";
import { Button } from "@marketplace/components/ui/button";
import { useNavigate } from "react-router-dom";

export function MarkAsReadBtn({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  async function handleMarkAsRead(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    await markAsRead(id);

    navigate(0);
    setPending(false);
  }

  return (
    <form onSubmit={handleMarkAsRead}>
      <Button
        disabled={pending}
        type="submit"
        className="bg-primary hover:bg-market-accent text-white"
      >
        {pending ? "Working..." : "Mark as read"}
      </Button>
    </form>
  );
}
