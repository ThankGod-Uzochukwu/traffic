"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type InsightCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
};

export function InsightCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon size={20} strokeWidth={2} />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </motion.div>
  );
}
