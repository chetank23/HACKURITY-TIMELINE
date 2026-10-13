import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Settings2,
  Maximize2,
  ShieldCheck,
  LockKeyhole,
  Fingerprint,
  Radio,
  KeyRound,
  FileCode2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkScene } from "@/features/hackurity/NetworkScene";
import { Timeline } from "@/features/hackurity/Timeline";
import { Terminal } from "@/features/hackurity/Terminal";
import { AdminPanel, toggleFullscreen } from "@/features/hackurity/AdminPanel";
import { SponsorsMarquee } from "@/features/hackurity/SponsorsMarquee";
import { useEvent } from "@/features/hackurity/use-event";
import { DURATION, formatTime, remainingTime } from "@/features/hackurity/event";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "HACKURITY 2026 — Live Cybersecurity Hackathon" },
      {
        name: "description",
        content:
          "The live 24-hour HACKURITY 2026 countdown, event timeline and continuously animated simulated security network.",
      },
      { property: "og:title", content: "HACKURITY 2026 — Live Cybersecurity Hackathon" },
      {
        property: "og:description",
        content: "24 hours. One mission. A live cybersecurity hackathon experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { event, now, update, storageError } = useEvent();
  const remaining = remainingTime(event, now);
  const elapsed = (DURATION - remaining) / 3600000;
  const complete = remaining === 0;
  const [admin, setAdmin] = useState(false),
    [presentation, setPresentation] = useState(false),
    [fullscreenError, setFullscreenError] = useState("");
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const resize = () => {
      if (stage.current) {
        const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        stage.current.style.setProperty("--stage-scale", String(scale));
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  /* ── Block back-navigation: push a duplicate entry so the back button
       can never escape to the landing page while the timeline is running. ── */
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const trap = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", trap);
    return () => window.removeEventListener("popstate", trap);
  }, []);
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "," && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setAdmin((v) => !v);
      }
      if (e.key === "Escape") setPresentation(false);
    };
    window.addEventListener("keydown", keyboard);
    const full = () => {
      if (!document.fullscreenElement) setPresentation(false);
    };
    document.addEventListener("fullscreenchange", full);
    return () => {
      window.removeEventListener("keydown", keyboard);
      document.removeEventListener("fullscreenchange", full);
    };
  }, []);
  const stateLabel = complete
    ? "EVENT COMPLETE"
    : event.status === "paused"
      ? "EVENT PAUSED"
      : event.status === "preview"
        ? "PREVIEW MODE"
        : event.status === "scheduled" && event.start !== null && now < event.start
          ? "AWAITING KICKOFF"
          : "HACKATHON LIVE";
  return (
    <main
      className={`installation ${presentation ? "presentation-mode" : ""} ${event.reducedMotion ? "reduced-motion" : ""}`}
    >
      <div ref={stage} className="cyber-stage">
        <NetworkScene event={event} complete={complete} />
        <div className="scene-vignette" />
        <header className="scene-header">
          <div className="header-status">
            <span className="status-dot" />
            {stateLabel}
            <span className="status-separator" />
            24-HOUR HACKATHON
          </div>
          <SponsorsMarquee />
        </header>
        <div className="left-coordinate">
          NETWORK OPERATIONS <span>SECTOR 01 / SECURE PERIMETER</span>
        </div>
        <div className="right-coordinate">
          <Radio size={13} /> LIVE SIMULATION <span>ENCRYPTED ENVIRONMENT</span>
        </div>
        <div className="event-title-zone">
          <div className="event-eyebrow">
            <span />
            24 HOURS. ONE MISSION.
            <span />
          </div>
          <h1 className="cyber-title">{event.name}</h1>
          <p className="event-subtitle">24-HOUR CYBERSECURITY HACKATHON</p>
          <div className="event-powered-by">
            <span className="powered-by-text">POWERED BY</span>
            <img src="/bob-logo.png" alt="IBM Bob" className="powered-by-logo" />
          </div>
        </div>
        <section
          className={`countdown-center ${complete ? "event-complete" : ""}`}
          aria-label="Hackathon countdown"
        >
          <div className="countdown" role="timer" aria-label={`${formatTime(remaining)} remaining`}>
            {formatTime(remaining)
              .split(":")
              .map((digits, i) => (
                <span className="timer-group" key={i}>
                  <span key={digits} className="timer-digits">
                    {digits}
                  </span>
                  <span className="timer-label">{["HOURS", "MINUTES", "SECONDS"][i]}</span>
                  {i < 2 && <span className="timer-colon">:</span>}
                </span>
              ))}
          </div>
          <div className="countdown-status">
            <span className="status-dot" />
            {complete
              ? "EVENT COMPLETE"
              : event.status === "paused"
                ? "CLOCK PAUSED"
                : event.status === "preview"
                  ? "PREVIEW · READY TO BEGIN"
                  : stateLabel === "AWAITING KICKOFF"
                    ? "SCHEDULED · READY TO BEGIN"
                    : "THE CLOCK IS TICKING. MAKE IT COUNT."}
          </div>
        </section>
        {event.layers.packets && (
          <>
            <div className="gateway gateway-left">
              <FileCode2 />
              <span>PAYLOAD IN</span>
              <code>0100 1011</code>
            </div>
            <div className="gateway gateway-right">
              <Fingerprint />
              <span>HASH VERIFIED</span>
              <code>0xA8 · 0xE6</code>
            </div>
            <div className="encryption-hub">
              <div className="hub-ring" />
              <div className="hub-shield">
                <ShieldCheck size={45} />
                <LockKeyhole className="hub-lock" size={18} />
              </div>
              <span>AES-256 ENCRYPTION</span>
              <div className="hub-channel">
                <KeyRound size={12} />
                <code>PLAIN</code>
                <ArrowRight size={12} />
                <code>0xE619</code>
              </div>
            </div>
          </>
        )}
        <Terminal enabled={event.layers.terminal} reduced={event.reducedMotion} />
        <div className="network-summary">
          <span className="summary-label">NETWORK INTEGRITY</span>
          <div>
            <ShieldCheck size={15} /> SECURE{" "}
            <span className="signal-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <span className="summary-foot">ALL CHANNELS PROTECTED</span>
        </div>
        <Timeline milestones={event.milestones} elapsed={elapsed} />
        <footer className="scene-footer">
          <span>
            <span className="status-dot" /> SYSTEM ONLINE{" "}
            <span className="footer-separator">/</span> SIMULATED NETWORK ACTIVITY
          </span>
          <span>BUILD BEYOND THE BREACH.</span>
          <span>
            HACKURITY 2026 <span className="footer-separator">/</span> 24H
          </span>
        </footer>
        {!presentation && (
          <div className="display-controls">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Event settings"
              title="Event settings (Ctrl + ,)"
              onClick={() => setAdmin(true)}
            >
              <Settings2 />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Enter fullscreen"
              title="Fullscreen display"
              onClick={async () => {
                try {
                  await toggleFullscreen();
                  setPresentation(true);
                  setFullscreenError("");
                } catch {
                  setFullscreenError(
                    "Fullscreen is unavailable. Use presentation mode in event settings.",
                  );
                }
              }}
            >
              <Maximize2 />
            </Button>
          </div>
        )}
        {fullscreenError && !presentation && (
          <div className="fullscreen-error" role="alert">
            {fullscreenError}
          </div>
        )}
      </div>
      <AdminPanel
        open={admin}
        onClose={() => setAdmin(false)}
        event={event}
        update={update}
        storageError={storageError}
        onPresent={() => setPresentation(true)}
      />
    </main>
  );
}
