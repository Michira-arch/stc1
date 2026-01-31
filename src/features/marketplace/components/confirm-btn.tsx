"use client";

import { useState } from "react";

import { Button } from "@marketplace/components/ui/button";

import { deletePost, postSold } from "@marketplace/actions/post";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function ConfirmButton({ postId }: { postId: string }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function handlePostDelete(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    const response = await deletePost(postId);

    if (response?.error) {
      const errorMsg = response.error;
      setPending(false);
      return toast.error(errorMsg);
    }

    toast.success(response?.success);
    setPending(false);
    return navigate("/profile");
  }

  return (
    <form onSubmit={handlePostDelete}>
      <Button
        disabled={pending}
        className="w-20 flex gap-4"
        type="submit"
        variant={"destructive"}
      >
        {pending ? "Deleting..." : "Confirm"}
      </Button>
    </form>
  );
}
