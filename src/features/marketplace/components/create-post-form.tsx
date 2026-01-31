"use client";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@marketplace/components/ui/input";
import { Textarea } from "@marketplace/components/ui/textarea";
import { Button } from "@marketplace/components/ui/button";

import { cn } from "@marketplace/components/lib/utils";
import { CreatePostSchema } from "@marketplace/types/zodSchema";
import { createPost } from "@marketplace/actions/post";
import { Label } from "./ui/label";
import { SupabaseImageUpload } from "./supabase-image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRef } from "react";
import { toast } from "sonner";

export function CreatePostForm() {
  const navigate = useNavigate();

  const imgUrls = useRef<string[]>([]);
  const form = useForm<z.infer<typeof CreatePostSchema>>({
    resolver: zodResolver(CreatePostSchema),
    mode: "onChange",
    defaultValues: {
      images: [],
    }
  });

  async function handleCreatePost(values: z.infer<typeof CreatePostSchema>) {
    const response = await createPost(values);

    if (response?.success) {
      toast.success(response.success);
      form.reset();
      form.setValue("category", "NOTES");
      form.setValue("images", []);
      navigate(0);
    }
  }

  return (
    <form className="text-left" onSubmit={form.handleSubmit(handleCreatePost)}>
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label className={cn(form.formState.errors.images && "text-red-500")}>
            Product Images (Select upto 4 images)
          </Label>
          <SupabaseImageUpload
            disabled={imgUrls.current.length >= 4}
            onSuccess={(url) => {
              imgUrls.current.push(url);
              form.setValue("images", imgUrls.current, {
                shouldValidate: true,
              });
            }}
          />

          {imgUrls.current.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {imgUrls.current.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-neu-flat bg-background p-1">
                  <img src={url} alt="Uploaded" className="object-cover w-full h-full rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {form.formState.errors.images && (
            <p className="text-red-500">
              {form.formState.errors.images.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label className={cn(form.formState.errors.title && "text-red-500")}>
            Title
          </Label>
          <Input
            placeholder="resource title"
            type="text"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            className={cn(form.formState.errors.description && "text-red-500")}
          >
            Description
          </Label>
          <Textarea
            rows={10}
            placeholder="resource description"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label className={cn(form.formState.errors.price && "text-red-500")}>
            Price
          </Label>
          <Input
            placeholder="resource price"
            type="text"
            {...form.register("price")}
          />
          {form.formState.errors.price && (
            <p className="text-red-500">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            className={cn(form.formState.errors.category && "text-red-500")}
          >
            Category
          </Label>

          <Select onValueChange={(value) => form.setValue("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="resource category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOTES">Notes</SelectItem>
              <SelectItem value="BOOKS">Books</SelectItem>
              <SelectItem value="ELECTRONICS">Electronics</SelectItem>
              <SelectItem value="FURNITURE">Furniture</SelectItem>
              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
            </SelectContent>
          </Select>

          {form.formState.errors.category && (
            <p className="text-red-500 text-base">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>
        <Button
          disabled={form.formState.isSubmitting}
          className="w-full flex gap-2 bg-primary hover:bg-market-accent text-white"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Create post"}
        </Button>
      </div>
    </form>
  );
}
