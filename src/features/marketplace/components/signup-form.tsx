"use client";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@marketplace/components/ui/label";
import { Input } from "@marketplace/components/ui/input";
import { Button } from "@marketplace/components/ui/button";

import { cn } from "@marketplace/components/lib/utils";
import { SignupSchema } from "@marketplace/types/zodSchema";
import { toast } from "sonner";
import { supabase } from "@marketplace/lib/supabase";

export function SignupForm() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      name: "",
      password: "",
      college: "",
      phoneNo: "",
    },
  });

  async function handleSignup(values: z.infer<typeof SignupSchema>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            college: values.college,
            phoneNo: values.phoneNo,
            image: values.image || "",
            role: "USER",
          },
        },
      });

      if (error) {
        return toast.error(error.message);
      }

      if (data.user) {
        toast.success("Account created! Please check your email for verification.");
        // Redirect to login or home, depending on whether email confirmation is required
        return navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during signup.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSignup)}>
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl text-primary font-bold">Create your account</h1>
        <p className="text-market-accent  text-balance text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid gap-3 mt-5">
        <div className="grid gap-2">
          <Label>Profile picture</Label>
          {/* TODO: Replace with standard file upload or Cloudinary script */}
          <Input type="file" disabled placeholder="Image upload disabled for migration" />
          <p className="text-xs text-muted-foreground">Image upload temporarily disabled</p>
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
        <div className="flex items-end gap-2 w-full">
          <div className="grid gap-2 w-full">
            <Label
              className={cn(form.formState.errors.email && "text-red-500")}
            >
              Email
            </Label>
            <Input
              type="email"
              placeholder="your email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-base">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
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
        <div className="grid gap-2">
          <Label
            className={cn(form.formState.errors.phoneNo && "text-red-500")}
          >
            Phone No.{" "}
            <span className="text-market-accent text-sm">
              (Include country code, e.g., +254)
            </span>
          </Label>
          <Input
            type="text"
            placeholder="+254..."
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
            className={cn(form.formState.errors.college && "text-red-500")}
          >
            College
          </Label>
          <Input
            type="text"
            placeholder="your college/university"
            {...form.register("college")}
          />
          {form.formState.errors.college && (
            <p className="text-red-500 text-base">
              {form.formState.errors.college.message}
            </p>
          )}
        </div>
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full flex items-center gap-2 mt-2 bg-primary hover:bg-market-accent"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Signup"}
        </Button>
      </div>

      <div className="text-center text-sm mt-5">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-primary hover:text-info transition-all duration-300 underline underline-offset-4"
        >
          Login
        </Link>
      </div>
    </form>
  );
}
