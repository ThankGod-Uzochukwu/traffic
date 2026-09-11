import type { Metadata } from "next";
import { getLocations, getSummary } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { SampleDataBanner } from "@/components/dashboard/SampleDataBanner";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard - NYC Traffic Watch",
  description:
    "Which NYC streets are monitored closely, which are barely checked, and whose rush hour does not match the citywide norm.",
};

export default async function DashboardPage() {
  const [locations, summary] = await Promise.all([
    getLocations(),
    getSummary(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Coverage and rush hour dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every point is a place NYC DOT has counted traffic. Color shows how
            often it gets checked. Size shows how far its real rush hour is from
            the citywide norm.
          </p>

          {summary.meta.sample && (
            <div className="mt-5">
              <SampleDataBanner
                historicalSource={summary.meta.historicalSource}
                automatedSource={summary.meta.automatedSource}
              />
            </div>
          )}

          <div className="mt-6">
            <SummaryStats summary={summary} />
          </div>

          <div className="mt-6">
            <DashboardClient
              locations={locations}
              expectedPeakHours={summary.citywideExpectedPeakHours}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
