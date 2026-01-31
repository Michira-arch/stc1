"use client";

import type { FormEvent } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@marketplace/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@marketplace/lib/supabase";

export function Logout({ type }: { type: "ADMIN" | "USER" }) {
  const navigate = useNavigate();

  async function handleLogout(e: FormEvent) {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during logout.");
    }
  }

  return (
    <Button
      onClick={handleLogout}
      className="w-full bg-primary text-white hover:bg-market-accent"
    >
      <LogOut className="mr-2" /> Logout
    </Button>
  );
}
