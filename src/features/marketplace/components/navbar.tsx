import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@marketplace/lib/supabase";
import type { User } from "@supabase/supabase-js";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Logout } from "./logout-btn";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={"/marketplace/logo.svg"}
        alt="CollegeBay Logo"
        width={20}
        height={20}
        className="object-cover w-full h-6"
      />
      <Link
        to={"/"}
        className="text-xl text-primary font-semibold  tracking-wide"
      >
        CollegeBay
      </Link>
    </div>
  );
}

const landingRoutes: { title: string; link: string }[] = [
  {
    title: "Features",
    link: "#features",
  },
  {
    title: "Working",
    link: "#working",
  },
  {
    title: "FAQ's",
    link: "#faqs",
  },
];

function ActionButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Or a spinner

  return (
    <>
      {user ? (
        <div className="flex items-center gap-4">
          <Link to="/home" className="hidden md:block font-medium text-primary hover:underline">
            Dashboard
          </Link>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <MenuIcon />
              </SheetTrigger>
              <SheetContent className="bg-light text-primary">
                <SheetHeader>
                   <VisuallyHidden>
                    <SheetTitle>Nav Content</SheetTitle>
                   </VisuallyHidden>
                  <SheetDescription>
                    <div className="flex flex-col space-y-4 items-start mt-10 w-full text-primary text-lg">
                        <SheetClose asChild>
                            <Link to="/home" className="font-bold">Dashboard</Link>
                        </SheetClose>
                        <div className="w-full">
                            <Logout type="USER" />
                        </div>
                    </div>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:block">
            <Logout type="USER" />
          </div>
        </div>
      ) : (
        <>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <MenuIcon />
              </SheetTrigger>
              <SheetContent className="bg-light text-primary">
                <SheetHeader>
                  <VisuallyHidden>
                    <SheetTitle>Nav Content</SheetTitle>
                  </VisuallyHidden>
                  <SheetDescription>
                    <div className="flex flex-col space-y-4 items-start mt-10 w-full text-primary text-lg">
                      <div className="flex flex-col w-full text-left space-y-5">
                        {landingRoutes.map((item, idx) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          <SheetClose asChild key={idx}>
                            <a href={item.link}>{item.title}</a>
                          </SheetClose>
                        ))}
                      </div>
                      <div className="flex flex-col w-full text-left space-y-5 mt-10">
                        <SheetClose asChild>
                          <Link
                            className="w-full rounded-md text-left font-bold text-xl"
                            to={"/login"}
                          >
                            Login
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            className="w-full text-left underline font-bold text-xl"
                            to={"/signup"}
                          >
                            Signup
                          </Link>
                        </SheetClose>
                      </div>
                    </div>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex md:items-center gap-5">
            {landingRoutes.map((item, idx) => (
              <a
                className="text-primary tracking-wide font-medium"
                href={item.link}
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={idx}
              >
                {item.title}
              </a>
            ))}
          </div>

          <div className="hidden md:flex md:items-center gap-5">
            <Link to={"/login"}>
              <Button
                variant="outline"
                className="bg-light text-primary text-lg border-none hover:text-primary py-4 px-6"
              >
                Login
              </Button>
            </Link>
            <Link to={"/signup"}>
              <Button className="bg-primary hover:bg-secondary text-lg text-white font-normal py-4 px-6">
                Signup
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  );
}


export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur px-5 py-5 w-full bg-light">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Logo />
        <ActionButtons />
      </div>
    </nav>
  );
}
