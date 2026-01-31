"use client";

import type { IMessage } from "@marketplace/actions/types";
import { useEffect, useRef } from "react";
import { cn } from "./lib/utils";
import { formatDistanceToNow } from "date-fns";

export function ChatMessages({
  messages,
  userId,
}: {
  messages: IMessage[];
  userId: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length !== previousMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      previousMessageCount.current = messages.length;
    }
  }, [messages.length]);

  return (
    <div className="grid grid-cols-1 gap-3">
      {messages && messages.length > 0 ? (
        messages.map((item) => (
          <div
            key={item.id}
            className={`flex gap-1 ${item.senderId !== userId
              ? "justify-start"
              : "ml-auto flex-row-reverse"
              }`}
          >
            <div
              className={`${item.senderId !== userId
                ? "bg-background text-foreground shadow-neu-flat rounded-tl-none"
                : "bg-background text-primary shadow-neu-flat border border-primary/20 rounded-tr-none"
                } p-4 rounded-2xl w-[300px] md:w-[500px] gap-2 flex flex-col transition-all duration-200`}
            >
              <div
                className={cn(
                  "flex items-center gap-1",
                  item.senderId === userId && "flex-row-reverse ml-auto"
                )}
              >
                <h1
                  className={`font-bold text-sm ${item.senderId !== userId ? "text-primary" : "text-primary"
                    }`}
                >
                  {item.senderId === userId ? "You" : item.sender.name}
                </h1>
              </div>
              <p className={cn(item.senderId === userId && "text-right")}>
                {item.text}
              </p>
              <p
                className={cn(
                  "text-xs text-wrap",
                  item.senderId === userId
                    ? "text-primary/70 ml-auto"
                    : "text-market-accent"
                )}
              >
                Created{" "}
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div ref={messagesEndRef} />
          </div>
        ))
      ) : (
        <div className="text-center h-[60dvh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">
            Start the conversation by sending {`"`}Hi{`"`}
          </h1>
          <p className="text-xl font-semibold">
            Do not pay upfront with any links.
          </p>
          <p className="text-lg">Always do pay when the product is received.</p>
          <p className="my-5 text-lg">
            Reach out us if any seller is trying to pay upfront with proper
            messages screenshot to report them
          </p>
        </div>
      )
      }
    </div >
  );
}
