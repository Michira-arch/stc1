"use client";

import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@marketplace/components/ui/button";
import { cn } from "@marketplace/components/lib/utils";
import { Trash2 } from "lucide-react";
import { deleteRequest } from "@marketplace/actions/request";

export function UserRequestActionsBtn({
  type,
  id,
}: {
  type: "profile" | "home";
  id: string;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function handleDeleteRequest(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    const response = await deleteRequest(id);

    if (response?.error) {
      const errorMsg = response.error;
      setPending(false);
      return toast.error(errorMsg);
    }

    toast.success(response?.success);
    // Refresh page or navigate
    navigate(0); // Refresh current page
    setPending(false);
  }

  return (
    <form onSubmit={type === "profile" ? handleDeleteRequest : undefined}>
      <Button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full",
          type !== "profile" && "bg-primary text-white hover:bg-market-accent"
        )}
        variant={type === "profile" ? "destructive" : "default"}
      >
        <div className="flex items-center gap-2">
          {pending ? (
            "Deleting..."
          ) : (
            <>
              <Trash2 /> Delete
            </>
          )}
        </div>
      </Button>
    </form>
  );
}
