"use client";

import {
  approvePost,
  approveRequest,
  rejectPost,
  rejectRequest,
} from "@marketplace/actions/admin";
import { Button } from "@marketplace/components/ui/button";
import { Textarea } from "@marketplace/components/ui/textarea";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export function ApproveBtn({
  type,
  id,
}: {
  type: "post" | "request";
  id: string;
}) {
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  async function handleApprovePostOrRequest(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    const response =
      type === "post" ? await approvePost(id) : await approveRequest(id);

    if ((response as any)?.error) {
      toast.error((response as any).error);
      setPending(false);
      return;
    }

    toast.success(response as string);
    navigate("/admin/dashboard", { replace: true });
    setPending(false);
    return;
  }

  return (
    <form className="w-full">
      <Button
        onClick={handleApprovePostOrRequest}
        disabled={pending}
        className="w-full"
      >
        {pending ? "Submitting..." : "Approve"}
      </Button>
    </form>
  );
}

export function RejectMessageForm({
  type,
  id,
}: {
  type: "post" | "request";
  id: string;
}) {
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const [reason, setReason] = useState("");

  async function handleAdminRejectWithReason(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    try {
      const response =
        type === "post"
          ? await rejectPost(id, reason)
          : await rejectRequest(id, reason);

      if ((response as any)?.error) {
        toast.error((response as any).error);
        setPending(false);
        return;
      }

      toast.success(response as string);
      setReason("");
      navigate("/admin/dashboard", { replace: true });
      setPending(false);
      return;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorData = await error.response?.data.msg;
        toast.error(errorData);
        setPending(false);
        return;
      }
    }
  }

  return (
    <form className="grid gap-2" onSubmit={handleAdminRejectWithReason}>
      <Textarea
        rows={7}
        onChange={(e) => setReason(e.target.value)}
        placeholder="enter the reason for rejection"
      />

      <Button disabled={pending} type="submit" className="mt-5">
        {pending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
