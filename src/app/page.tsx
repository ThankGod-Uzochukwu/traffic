"use client";

import { motion } from "framer-motion";
import { Clock, MapPinned, Radio } from "lucide-react";
import { Header } from "@/components/Header";
import { InsightCard } from "@/components/InsightCard";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted"
          >
            Early build, real data coming next
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Who gets watched, and who gets skipped
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted"
          >
            New York City has been counting traffic since 2000. Some streets get
            checked every day of the year. Others get checked once, for two
            weeks, and then not again for a long while. This project maps that
            gap and looks at what it means for rush hour in the places that get
            missed.
          </motion.p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-5 sm:grid-cols-3">
            <InsightCard
              icon={Radio}
              title="Coverage is uneven"
              description="A small set of streets have automated counters running year round. Most of the city gets one count, for a couple of weeks, and that's the only record for the year."
              delay={0}
            />
            <InsightCard
              icon={Clock}
              title="Rush hour isn't the same everywhere"
              description="The usual 7 to 9 and 4 to 7 rush hour window is a citywide average. Plenty of streets peak at different times, and a single yearly count won't catch that."
              delay={0.1}
            />
            <InsightCard
              icon={MapPinned}
              title="Built for the streets that get missed"
              description="Less monitoring can mean slower fixes to signal timing, signage, or emergency routing. The goal here is to make that gap visible on a map, not just in a spreadsheet."
              delay={0.2}
            />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center"
          >
            <p className="text-sm text-muted">
              This is the first build of the project. The map, the real traffic
              counts, and the coverage numbers are being built next. Check
              TODO.md in the repo to see where things stand.
            </p>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
