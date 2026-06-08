import { describe, expect, it } from "vitest";
import { exportLimit, idFilter, tableSort } from "../src/utils/table.js";

describe("table query helpers", () => {
  it("falls back when sortBy is not allowlisted", () => {
    const result = tableSort({ sortBy: "passwordHash", sortDir: "desc" }, ["name", "createdAt"], "createdAt", "desc");
    expect(result.sortBy).toBe("createdAt");
    expect(result.orderBy).toEqual({ createdAt: "desc" });
  });

  it("normalizes sort direction to asc or desc", () => {
    expect(tableSort({ sortBy: "name", sortDir: "sideways" }, ["name"], "name").sortDir).toBe("asc");
    expect(tableSort({ sortBy: "name", sortDir: "desc" }, ["name"], "name").sortDir).toBe("desc");
  });

  it("clamps export limits and parses selected ids", () => {
    expect(exportLimit({ limit: "9000" })).toBe(5000);
    expect(exportLimit({ limit: "-10" })).toBe(1);
    expect(idFilter({ ids: "a, b,,c" })).toEqual(["a", "b", "c"]);
  });
});
