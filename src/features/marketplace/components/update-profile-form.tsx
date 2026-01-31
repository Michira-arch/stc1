"use client";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Plus, Upload } from "lucide-react";
import { Label } from "@marketplace/components/ui/label";
import { Input } from "@marketplace/components/ui/input";
import { Button } from "@marketplace/components/ui/button";

import { cn } from "@marketplace/components/lib/utils";
import type { UserProfile } from "@marketplace/types/index";
import { UpdateProfileSchema } from "@marketplace/types/zodSchema";
import { updateProfile } from "@marketplace/actions/user";
import { SupabaseImageUpload } from "./supabase-image-upload";

export function UpdateProfileForm({ user }: { user: UserProfile | undefined }) {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
    mode: "onChange",
    defaultValues: {
      ...user,
    },
  });

  async function handleUpdateProfile(
    values: z.infer<typeof UpdateProfileSchema>
  ) {
    const modifiedData: Partial<z.infer<typeof UpdateProfileSchema>> = {};

    if (values.image) modifiedData.image = values.image;
    if (values.name) modifiedData.name = values.name;
    if (values.phoneNo) modifiedData.phoneNo = values.phoneNo;
    if (values.password) modifiedData.password = values.password;

    const response = await updateProfile(modifiedData);

    if (response?.error) return toast.error(response.error);

    if (response?.success) {
      toast.success(response.success);
      navigate("/profile", { replace: true });
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleUpdateProfile)}
      className="space-y-5 max-w-xl"
    >
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label>Update profile picture</Label>
          <SupabaseImageUpload
            onSuccess={(url) => {
              form.setValue("image", url);
            }}
          />
          {form.watch("image") && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border mt-2">
              <img src={form.watch("image")} alt="Avatar Preview" className="object-cover w-full h-full" />
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label className={cn(form.formState.errors.name && "text-red-500")}>
            Full Name
          </Label>
          <Input
            type="text"
            placeholder="your full name"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-base">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            className={cn(form.formState.errors.phoneNo && "text-red-500")}
          >
            Phone No.{" "}
            <span className="text-sm">
              (Please don{`'`}t include +91- or +91)
            </span>
          </Label>
          <Input
            type="text"
            placeholder="your phone no."
            {...form.register("phoneNo")}
          />
          {form.formState.errors.phoneNo && (
            <p className="text-red-500 text-base">
              {form.formState.errors.phoneNo.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            className={cn(form.formState.errors.password && "text-red-500")}
          >
            Password
          </Label>
          <Input
            type="password"
            placeholder="your password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-base">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {form.formState.isDirty && (
          <Button
            disabled={form.formState.isSubmitting}
            className="w-full bg-primary hover:bg-market-accent text-white"
            type="submit"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Save Changes"}
          </Button>
        )}
      </div>
    </form>
  );
}
