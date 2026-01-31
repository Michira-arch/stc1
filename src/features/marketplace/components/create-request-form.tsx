"use client";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { SupabaseImageUpload } from "./supabase-image-upload";

import { Label } from "@marketplace/components/ui/label";
import { Input } from "@marketplace/components/ui/input";
import { Textarea } from "@marketplace/components/ui/textarea";
import { Button } from "@marketplace/components/ui/button";

import { cn } from "@marketplace/components/lib/utils";
import { createRequest } from "@marketplace/actions/request";
import { CreateRequestSchema } from "@marketplace/types/zodSchema";
import { toast } from "sonner";

export function CreateRequestForm() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof CreateRequestSchema>>({
    resolver: zodResolver(CreateRequestSchema),
    mode: "onChange",
  });

  async function handleCreateRequest(
    values: z.infer<typeof CreateRequestSchema>
  ) {
    const response = await createRequest(values);

    if (response?.success) {
      toast.success(response.success);
      form.reset();
      navigate(0); // Refresh
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleCreateRequest)}
      className="text-left space-y-4"
    >
      <div className="grid gap-2">
        <Label
          htmlFor="image"
          className={cn(form.formState.errors.image && "text-red-500")}
        >
          Upload reference image
        </Label>
        <SupabaseImageUpload
          onSuccess={(url) => {
            form.setValue("image", url, {
              shouldValidate: true,
            });
          }}
        />
        {form.watch("image") && (
          <div className="relative aspect-video rounded-md overflow-hidden border mt-2">
            <img src={form.watch("image")} alt="Preview" className="object-cover w-full h-full" />
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="title"
          className={cn(form.formState.errors.description && "text-red-500")}
        >
          Title
        </Label>
        <Input
          className="w-full"
          type="text"
          placeholder="your request resource title"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label
          htmlFor="description"
          className={cn(form.formState.errors.description && "text-red-500")}
        >
          Description
        </Label>
        <Textarea
          className="w-full"
          rows={10}
          placeholder="your request resource description"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <Button
        disabled={form.formState.isSubmitting}
        className="w-full flex gap-2 bg-primary hover:bg-market-accent rounded-md py-2 text-white"
      >
        {form.formState.isSubmitting ? "Submitting..." : "Create request"}
      </Button>
    </form>
  );
}
