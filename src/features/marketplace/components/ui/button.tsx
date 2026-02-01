import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@marketplace/components/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "bg-background text-slate-800 font-bold shadow-neu-outset hover:text-primary active:shadow-neu-pressed transition-all duration-200 active:scale-[0.98] border border-white/50",
        destructive:
          "bg-background text-red-600 font-bold shadow-neu-outset hover:bg-red-50/10 active:shadow-neu-pressed transition-all duration-200 dark:hover:bg-red-900/10 border border-red-200/50",
        outline:
          "bg-background text-slate-800 font-semibold shadow-neu-outset border border-slate-300 active:shadow-neu-pressed hover:bg-slate-100/50 dark:hover:bg-slate-800/50",
        secondary:
          "bg-background text-secondary font-bold shadow-neu-outset hover:opacity-80 active:shadow-neu-pressed border border-white/50",
        ghost:
          "hover:bg-slate-100/50 hover:text-slate-900 dark:hover:text-slate-50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
