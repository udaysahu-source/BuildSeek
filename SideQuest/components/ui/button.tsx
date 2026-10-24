import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold cursor-pointer transition-transform duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink active:translate-x-[1px] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "sq-btn-primary bg-ink text-white hover:bg-ink-900 border-2 border-ink shadow-solid hover:shadow-solid-md [&_svg]:text-white [&_svg]:stroke-white",
        destructive:
          "bg-urgent text-white shadow-solid border-2 border-ink hover:bg-urgent/90 font-bold [&_svg]:text-white",
        outline:
          "bg-white text-ink border-2 border-ink shadow-solid hover:bg-parchment-subtle [&_svg]:text-ink",
        secondary:
          "bg-parchment-subtle text-ink border-2 border-ink shadow-solid-sm hover:bg-parchment [&_svg]:text-ink",
        ghost:
          "text-ink hover:bg-parchment-subtle font-semibold [&_svg]:text-ink",
        link:
          "text-ink underline-offset-4 hover:underline font-bold [&_svg]:text-ink",
        // Legacy aliases
        lime:
          "bg-lime text-ink border-2 border-ink shadow-solid hover:bg-lime/90 font-bold [&_svg]:text-ink",
        primary:
          "sq-btn-primary bg-ink text-white hover:bg-ink-900 border-2 border-ink shadow-solid hover:shadow-solid-md [&_svg]:text-white [&_svg]:stroke-white",
        danger:
          "bg-urgent text-white shadow-solid border-2 border-ink hover:bg-urgent/90 font-bold [&_svg]:text-white",
      },
      size: {
        default: "h-12 px-6 py-2 text-sm",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-7 text-base font-bold",
        icon: "h-10 w-10 p-0",
        // Legacy alias
        md: "h-12 px-6 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {icon}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export default Button;
export { Button, buttonVariants };
