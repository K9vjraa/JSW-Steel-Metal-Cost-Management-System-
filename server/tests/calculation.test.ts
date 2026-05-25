import { describe, expect, it } from "vitest";
import { calculateBreakdown } from "../src/services/calculation.js";

describe("calculateBreakdown", () => {
  it("uses decimal-safe master charges for totals", () => {
    const result = calculateBreakdown(
      [
        { id: "steel", name: "SS304", quantity: "100", unitPrice: "20", gradeMultiplier: "1.1", extraPrice: "50" },
        { id: "nickel", name: "Nickel", quantity: "2.5", unitPrice: "850", gradeMultiplier: "1" }
      ],
      [
        { name: "Scrap", kind: "SCRAP", rate: "2" },
        { name: "Transport", kind: "TRANSPORT", rate: "1.5" },
        { name: "GST", kind: "GST", rate: "18" },
        { name: "Inspection", kind: "ADDITIONAL", amount: "120" }
      ]
    );

    expect(result.baseCost).toBe("4375");
    expect(result.scrapCost).toBe("87.5");
    expect(result.transportCost).toBe("153.75");
    expect(result.finalCost).toBe("5588.775");
  });

  it("rejects empty item sets", () => {
    expect(() => calculateBreakdown([], [])).toThrow("At least one costing item");
  });
});
