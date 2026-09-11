"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, GitFork } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 border-b border-border/80 bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            NYC Traffic Watch
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <GitFork size={15} />
            Source
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
