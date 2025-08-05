"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HTMLMotionProps } from "framer-motion";

export const GlassCard = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <motion.div
        ref={ref}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className={cn(
          "rounded-xl border border-white/10 bg-card/50 backdrop-blur-lg shadow-lg p-6",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
