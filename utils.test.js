import { describe, it, expect } from "vitest";
import { groupBy } from "./utils.js";

describe("groupBy", () => {
  it.each([
    {
      items: [
        { id: 1, category: "A" },
        { id: 2, category: "B" },
        { id: 3, category: "A" },
      ],
      key: "category",
      expected: {
        A: [
          { id: 1, category: "A" },
          { id: 3, category: "A" },
        ],
        B: [{ id: 2, category: "B" }],
      },
      description: "groups items by a string property",
    },
    {
      items: [
        { id: 1, year: 2021 },
        { id: 2, year: 2022 },
        { id: 3, year: 2021 },
      ],
      key: "year",
      expected: {
        2021: [
          { id: 1, year: 2021 },
          { id: 3, year: 2021 },
        ],
        2022: [{ id: 2, year: 2022 }],
      },
      description: "groups items by a numeric property",
    },
    {
      items: [],
      key: "any",
      expected: {},
      description: "returns empty object for empty array",
    },
  ])("$description", ({ items, key, expected }) => {
    expect(groupBy(items, key)).toEqual(expected);
  });
});
