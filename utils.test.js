import { describe, it, expect } from "vitest";
import { groupBy } from "./utils.js";
import { extractNewsItems } from "./api/news-ticker-webhook.js";

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

describe("extractNewsItems", () => {
  it.each([
    {
      body: "#news\n- معتصم خرما هو افضل مهندس بالكوكب",
      tag: "#news",
      expected: ["معتصم خرما هو افضل مهندس بالكوكب"],
      description: "hyphen bullet",
    },
    {
      body: "#news\n– معتصم خرما هو افضل مهندس بالكوكب",
      tag: "#news",
      expected: ["معتصم خرما هو افضل مهندس بالكوكب"],
      description: "en-dash bullet",
    },
    {
      body: "#news\n— معتصم خرما هو افضل مهندس بالكوكب",
      tag: "#news",
      expected: ["معتصم خرما هو افضل مهندس بالكوكب"],
      description: "em-dash bullet",
    },
    {
      body: "#news\n• معتصم خرما هو افضل مهندس بالكوكب",
      tag: "#news",
      expected: ["معتصم خرما هو افضل مهندس بالكوكب"],
      description: "bullet point",
    },
    {
      body: "#news\n1. معتصم خرما هو افضل مهندس بالكوكب",
      tag: "#news",
      expected: ["معتصم خرما هو افضل مهندس بالكوكب"],
      description: "numbered list item",
    },
    {
      body: "#news\nمعتصم خرما هو افضل مهندس بالكوكب",
      tag: "#news",
      expected: ["معتصم خرما هو افضل مهندس بالكوكب"],
      description: "plain text line (no bullet)",
    },
    {
      body: "#NEWS\n* خبر أول\n* خبر ثاني",
      tag: "#news",
      expected: ["خبر أول", "خبر ثاني"],
      description: "multiple items case insensitive tag",
    },
    {
      body: "#news",
      tag: "#news",
      expected: null,
      description: "empty body returns null",
    },
  ])("$description", ({ body, tag, expected }) => {
    expect(extractNewsItems(body, tag)).toEqual(expected);
  });
});
