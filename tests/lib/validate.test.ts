import { describe, expect, it } from "vitest";
import { isValidEmail } from "../../src/lib/validate";

describe("isValidEmail", () => {
  it.each([
    "client@example.com",
    "first.last@sub.domain.co",
    "user+tag@example.io",
    "  padded@example.com  ",
  ])("accepts %s", (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "plainaddress",
    "missing-domain@",
    "@no-user.com",
    "no-dot@domain",
    "two words@example.com",
  ])("rejects %s", (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});
