import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@marketplace/components/ui/card";
import { IndianRupee } from "lucide-react";

import { cn } from "@marketplace/components/lib/utils";
import type { IPost } from "@marketplace/actions/types";

export function PostCard({
  type,
  post,
}: {
  type: "profile" | "home";
  post: IPost;
}) {
  return (
    <Link
      to={type === "home" ? `/home/${post.id}` : `/profile/posts/${post.id}`}
    >
      <Card
        className={cn(
          "space-y-2 w-full h-full flex flex-col sm:mx-0 transition-all duration-300 hover:scale-[1.02]",
          !post.isAvailable && "opacity-75",
          type === "profile" && "mt-5"
        )}
      >
        <img
          src={post.images[0]}
          alt="Product image"
          width={500}
          height={500}
          className="w-full object-contain rounded-t h-52 bg-white"
        />
        <div className="absolute">
          {!post.isAvailable && (
            <div className="bg-primary relative -top-5 right-0 text-white px-4 py-2 rounded-md">
              Sold
            </div>
          )}
        </div>
        <div className="flex-1">
          <CardTitle className="flex justify-between px-6">
            <div>
              <h1 className="text-xl text-secondary">{post.title}</h1>
            </div>
            <div>
              <h1 className="flex items-center text-base text-secondary font-bold">
                KSh {post.price}
              </h1>
            </div>
          </CardTitle>
          <CardDescription className="px-6 text-sm space-y-5 text-primary">
            {`${post.description.slice(0, 90)}...`}
          </CardDescription>
        </div>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-wrap text-market-accent">
            Created{" "}
            Created{" "}
            {post.createdAt && !isNaN(new Date(post.createdAt).getTime())
              ? formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })
              : "Just now"}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
