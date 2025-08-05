"use client";
import {
  LayoutDashboard,
  KeyRound,
  Users,
  Settings,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "#" },
    { icon: KeyRound, label: "API Keys", href: "#" },
    { icon: Users, label: "Teams", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <motion.aside
      className="hidden md:flex flex-col border-r bg-sidebar/50 backdrop-blur-lg p-4 fixed h-full z-20"
      initial={{ width: "5rem" }}
      animate={{ width: isExpanded ? "15rem" : "5rem" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="mb-8 flex items-center gap-2 justify-center">
        <Wallet className="h-8 w-8 text-primary flex-shrink-0" />
        <AnimatePresence>
          {isExpanded && (
            <motion.h2
              className="text-xl font-bold whitespace-nowrap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              API Wallet
            </motion.h2>
          )}
        </AnimatePresence>
      </div>
      <nav className="flex flex-col gap-3">
        {navItems.map((item, index) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 rounded-lg px-3 py-3 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <item.icon className="h-6 w-6 flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="font-medium whitespace-nowrap"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        ))}
      </nav>
    </motion.aside>
  );
}
