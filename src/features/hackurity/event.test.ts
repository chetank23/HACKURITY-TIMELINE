import { describe, it, expect } from "vitest";
import {
  DURATION,
  defaultEvent,
  startEvent,
  pauseEvent,
  resumeEvent,
  remainingTime,
  formatTime,
  readEvent,
} from "./event";
describe("absolute event clock", () => {
  it("starts at 24 hours and never drifts with delayed updates", () => {
    const e = startEvent(defaultEvent(), 1000);
    expect(remainingTime(e, 1000)).toBe(DURATION);
    expect(remainingTime(e, 1000 + 54321)).toBe(DURATION - 54321);
  });
  it("preserves remaining time across pause and resume", () => {
    let e = startEvent(defaultEvent(), 1000);
    e = pauseEvent(e, 11000);
    expect(remainingTime(e, 999999)).toBe(DURATION - 10000);
    e = resumeEvent(e, 900000);
    expect(remainingTime(e, 901000)).toBe(DURATION - 11000);
  });
  it("recovers timestamps after refresh and completes without resetting", () => {
    const e = startEvent(defaultEvent(), 1000);
    const restored = readEvent(JSON.stringify(e));
    expect(restored).not.toBeNull();
    if (!restored) return;
    expect(remainingTime(restored, DURATION + 99999)).toBe(0);
    expect(formatTime(0)).toBe("00:00:00");
  });
  it("holds scheduled start at 24 hours and advances past its start", () => {
    const e = { ...startEvent(defaultEvent(), 100000), status: "scheduled" as const };
    expect(remainingTime(e, 50000)).toBe(DURATION);
    expect(remainingTime(e, 160000)).toBe(DURATION - 60000);
  });
  it("rejects damaged storage and formats boundaries", () => {
    expect(readEvent("{")).toBeNull();
    expect(readEvent("{}")).toBeNull();
    expect(formatTime(DURATION)).toBe("24:00:00");
    expect(formatTime(1)).toBe("00:00:01");
  });
});
