import { describe, expect, it } from "vitest";
import { classifyCoverage } from "./coverage";

const CURRENT_YEAR = 2026;

describe("classifyCoverage", () => {
  it("classifies a dense multi year automated site as continuous", () => {
    const result = classifyCoverage(
      { sources: ["automated"], countDays: 250, yearsActive: [2024, 2025] },
      CURRENT_YEAR,
    );
    expect(result).toBe("continuous");
  });

  it("classifies a site counted in several separate years as annual", () => {
    const result = classifyCoverage(
      {
        sources: ["historical"],
        countDays: 42,
        yearsActive: [2019, 2022, 2025],
      },
      CURRENT_YEAR,
    );
    expect(result).toBe("annual");
  });

  it("classifies a site counted once as sparse", () => {
    const result = classifyCoverage(
      { sources: ["historical"], countDays: 14, yearsActive: [2024] },
      CURRENT_YEAR,
    );
    expect(result).toBe("sparse");
  });

  it("classifies a site with no recent data as stale even if it had many count days", () => {
    const result = classifyCoverage(
      { sources: ["automated"], countDays: 300, yearsActive: [2010, 2011] },
      CURRENT_YEAR,
    );
    expect(result).toBe("stale");
  });
});
