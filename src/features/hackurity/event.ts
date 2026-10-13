export const DURATION = 24 * 60 * 60 * 1000;
export const STORAGE_KEY = "hackurity-event-v1";
export type Milestone = { label: string; hours: number };
export type Layers = {
  packets: boolean;
  globe: boolean;
  infrastructure: boolean;
  terminal: boolean;
  ambient: boolean;
  scanning: boolean;
};
export type EventState = {
  name: string;
  status: "preview" | "scheduled" | "running" | "paused";
  start: number | null;
  pausedRemaining: number;
  plannedStart: string;
  milestones: Milestone[];
  layers: Layers;
  intensity: number;
  brightness: number;
  reducedMotion: boolean;
  performanceMode: boolean;
  completionAnimation: boolean;
};
export function defaultEvent(): EventState {
  return {
    name: "HACKURITY 2026",
    status: "preview",
    start: null,
    pausedRemaining: DURATION,
    plannedStart: "",
    milestones: [
      { hours: 0, label: "KICKOFF" },
      { hours: 6, label: "IDEATION" },
      { hours: 12, label: "DEVELOPMENT" },
      { hours: 18, label: "REFINEMENT" },
      { hours: 21, label: "PREPARATION" },
      { hours: 23, label: "PRESENTATIONS" },
      { hours: 24, label: "JUDGING & AWARDS" },
    ],
    layers: {
      packets: true,
      globe: true,
      infrastructure: true,
      terminal: true,
      ambient: true,
      scanning: true,
    },
    intensity: 65,
    brightness: 70,
    reducedMotion: false,
    performanceMode: false,
    completionAnimation: true,
  };
}
export function remainingTime(event: EventState, now: number): number {
  if (event.status === "preview") return DURATION;
  if (event.status === "paused") return event.pausedRemaining;
  if (event.start === null) return DURATION;
  return Math.min(DURATION, Math.max(0, event.start + DURATION - now));
}
export function startEvent(event: EventState, now: number): EventState {
  return { ...event, status: "running", start: now, pausedRemaining: DURATION };
}
export function pauseEvent(event: EventState, now: number): EventState {
  return { ...event, status: "paused", pausedRemaining: remainingTime(event, now) };
}
export function resumeEvent(event: EventState, now: number): EventState {
  return { ...event, status: "running", start: now - (DURATION - event.pausedRemaining) };
}
export function formatTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
export function readEvent(raw: string | null): EventState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    const base = defaultEvent();
    if (
      !["preview", "scheduled", "running", "paused"].includes(value.status) ||
      typeof value.name !== "string" ||
      (value.start !== null && !Number.isFinite(value.start)) ||
      !Number.isFinite(value.pausedRemaining)
    )
      return null;
    if (
      !Array.isArray(value.milestones) ||
      value.milestones.length < 2 ||
      value.milestones.length > 12 ||
      value.milestones.some(
        (m: Milestone) =>
          typeof m.label !== "string" || !Number.isFinite(m.hours) || m.hours < 0 || m.hours > 24,
      )
    )
      return null;
    return { ...base, ...value, layers: { ...base.layers, ...value.layers } };
  } catch {
    return null;
  }
}
