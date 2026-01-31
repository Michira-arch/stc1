"use client";

import { Link, useNavigate } from "react-router-dom";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@marketplace/components/ui/button";
import { Label } from "@marketplace/components/ui/label";
import { Input } from "@marketplace/components/ui/input";

import { LoginSchema } from "@marketplace/types/zodSchema";
import { toast } from "sonner";
import { supabase } from "@marketplace/lib/supabase";

export function LoginForm({ type }: { type: "user" | "admin" }) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleLogin(values: z.infer<typeof LoginSchema>) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        return toast.error(error.message);
      }

      if (data.user) {
        toast.success("Logged in successfully!");
        
        // Check if user has correct role for admin login
        if (type === 'admin') {
            // You might want to fetch the profile here to check the role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();
            
            if (profile?.role !== 'ADMIN') {
                await supabase.auth.signOut();
                return toast.error("Unauthorized access. Admin privileges required.");
            }
            return navigate("/admin/dashboard", { replace: true });
        }

        return navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during login.");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleLogin)}
      className="space-y-5"
    >
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-primary">
          {type === "admin" ? "Admin Login" : "User Login"}
        </h1>
        <p className="text-market-accent text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-2">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-md">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder={type === "admin" ? "your email" : "your email"}
            required
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-base">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-md">
              Password
            </Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="your password"
            {...form.register("password")}
            required
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-base">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full flex items-center gap-2 mt-5 bg-primary hover:bg-market-accent"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Login"}
        </Button>
      </div>

      {type === "user" && (
        <div className="text-center text-sm mt-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-primary hover:text-info transition-all duration-300 underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      )}
    </form>
  );
}
