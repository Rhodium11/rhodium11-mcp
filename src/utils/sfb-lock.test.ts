import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { computeSfbLockInfo, getSfbLockDays } from "./sfb-lock.js";
import type { ScheduleEntry } from "../client/types.js";

const NOW = new Date("2026-04-28T12:00:00Z");

function entry(date: string, sfb: number): ScheduleEntry {
  return { id: date.replace(/[-/]/g, ""), date, atc: 0, purchase: sfb, pageview: 0, wishlist: 0 };
}

function ongoing(sfb: number): ScheduleEntry {
  return { id: "ongoing", date: "ongoing", atc: 0, purchase: sfb, pageview: 0, wishlist: 0 };
}

describe("getSfbLockDays", () => {
  let original: string | undefined;
  beforeEach(() => {
    original = process.env.RH11_LOCK_SFB_DAYS;
    delete process.env.RH11_LOCK_SFB_DAYS;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.RH11_LOCK_SFB_DAYS;
    else process.env.RH11_LOCK_SFB_DAYS = original;
  });

  it("defaults to 2 (mpux-flask LOCK_SFB_DAYS default)", () => {
    expect(getSfbLockDays()).toBe(2);
  });

  it("respects RH11_LOCK_SFB_DAYS override", () => {
    process.env.RH11_LOCK_SFB_DAYS = "5";
    expect(getSfbLockDays()).toBe(5);
  });

  it("falls back to 2 on garbage input", () => {
    process.env.RH11_LOCK_SFB_DAYS = "not-a-number";
    expect(getSfbLockDays()).toBe(2);
  });
});

describe("computeSfbLockInfo", () => {
  it("returns null when no SFB is scheduled", () => {
    const info = computeSfbLockInfo([entry("2026-04-30", 0), ongoing(0)], NOW);
    expect(info).toBeNull();
  });

  it("counts dated SFB entries inside the lock window", () => {
    // Lock window: today 2026-04-28 through 2026-04-30 (exclusive) → covers 04-28, 04-29.
    const info = computeSfbLockInfo(
      [entry("2026-04-28", 3), entry("2026-04-29", 4), entry("2026-04-30", 99)],
      NOW,
    );
    expect(info).not.toBeNull();
    expect(info?.locked_sfb_units).toBe(7);
    expect(info?.lock_days).toBe(2);
    expect(info?.earliest_unlocked_date).toBe("2026-04-30");
  });

  it("uses ongoing SFB to fill days without a dated override in the lock window", () => {
    // 2026-04-28 has dated SFB=3; 2026-04-29 has no override → ongoing 5 fills.
    const info = computeSfbLockInfo([entry("2026-04-28", 3), ongoing(5)], NOW);
    expect(info?.locked_sfb_units).toBe(8);
  });

  it("ignores dated entries outside the lock window", () => {
    const info = computeSfbLockInfo([entry("2026-05-15", 100), ongoing(0)], NOW);
    expect(info).toBeNull();
  });

  it("accepts backend MM/DD/YYYY date format", () => {
    const info = computeSfbLockInfo([entry("04/28/2026", 7), ongoing(0)], NOW);
    expect(info?.locked_sfb_units).toBe(7);
  });

  it("ignores entries before today", () => {
    const info = computeSfbLockInfo([entry("2026-04-27", 99), ongoing(0)], NOW);
    expect(info).toBeNull();
  });
});
