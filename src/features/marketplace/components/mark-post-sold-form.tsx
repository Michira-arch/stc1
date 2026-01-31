"use client";

import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";

import { Button } from "@marketplace/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marketplace/components/ui/select";
import { toast } from "sonner";
import { postSold } from "@marketplace/actions/post";
import type { IChat } from "@marketplace/actions/types";

export function MarkPostSoldForm({
  postId,
  chats,
}: {
  postId: string;
  chats: IChat[];
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const [customerId, setCustomerId] = useState("");

  async function handlePostSold(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    if (customerId.length < 1) {
      setPending(false);
      return toast.error("Please select a valid user");
    }

    const response = await postSold(postId, customerId);

    if (response?.error) {
      const errorMsg = response.error;
      setPending(false);
      return toast.error(errorMsg);
    }

    toast.success(response?.success);
    // navigate to profile
    navigate("/profile");
    setPending(false);
  }

  return (
    <form onSubmit={handlePostSold} className="space-y-5">
      <Select
        value={customerId}
        onValueChange={(value) => setCustomerId(value)}
        defaultValue=""
      >
        <SelectTrigger className="py-4">
          <SelectValue placeholder="Select user you sold it to" />
        </SelectTrigger>
        <SelectContent>
          {chats.map((chat) => (
            <SelectItem value={chat.participants[0].id} key={chat.id}>
              <div className="flex items-center gap-2">
                <img
                  src={chat.participants[0].image}
                  alt={`${chat.participants[0].name} profile pic`}
                  className="object-cover w-10 h-10 rounded-full"
                />{" "}
                <p>{chat.participants[0].name}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button disabled={pending} className="w-20 flex gap-4" type="submit">
        {pending ? "Submitting..." : "Confirm"}
      </Button>
    </form>
  );
}
