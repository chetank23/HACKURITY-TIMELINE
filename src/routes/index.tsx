import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { defaultEvent, startEvent, readEvent, STORAGE_KEY } from "@/features/hackurity/event";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HACKURITY 2026 — Enter The Grid" },
      {
        name: "description",
        content:
          "HACKURITY 2026 — A 24-hour cybersecurity hackathon. Breach the perimeter. Build the future.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glitching, setGlitching] = useState(false);
  const [entering, setEntering] = useState(false);

  /* ── Guard: if timeline already running, skip landing entirely ── */
  useEffect(() => {
    try {
      const saved = readEvent(localStorage.getItem(STORAGE_KEY));
      if (saved && (saved.status === "running" || saved.status === "paused")) {
        // Replace so the landing page is removed from history —
        // pressing back from the timeline won't come here.
        navigate({ to: "/timeline", replace: true });
      }
    } catch {
      /* localStorage blocked */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Animated hex-grid canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const PRIMARY = "oklch(85.4% 0.218 123)"; // neon lime

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Scanlines */
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillStyle = `rgba(0,0,0,${0.04 + 0.02 * Math.sin(y * 0.05 + t)})`;
        ctx.fillRect(0, y, canvas.width, 2);
      }

      /* Grid */
      const GRID = 55;
      ctx.strokeStyle = `oklch(85.4% 0.218 123 / 0.06)`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width + GRID; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height + GRID; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      /* Glowing grid intersections */
      for (let x = 0; x < canvas.width + GRID; x += GRID) {
        for (let y = 0; y < canvas.height + GRID; y += GRID) {
          const pulse = 0.3 + 0.3 * Math.sin(t * 2 + x * 0.01 + y * 0.01);
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `oklch(85.4% 0.218 123 / ${pulse * 0.4})`;
          ctx.fill();
        }
      }

      /* Data-stream lines — vertical */
      for (let i = 0; i < 6; i++) {
        const x = (canvas.width / 7) * (i + 1);
        const length = 120 + Math.sin(t * 1.3 + i) * 60;
        const yOff = ((t * 180 * (1 + i * 0.2)) % (canvas.height + length)) - length;
        const grad = ctx.createLinearGradient(0, yOff, 0, yOff + length);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, `oklch(85.4% 0.218 123 / ${0.08 + i * 0.015})`);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yOff);
        ctx.lineTo(x, yOff + length);
        ctx.stroke();
      }

      /* Particles */
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(85.4% 0.218 123 / ${p.opacity})`;
        ctx.fill();
      });

      /* Connect nearby particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i]!;
          const pj = particles[j]!;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.strokeStyle = `oklch(85.4% 0.218 123 / ${(1 - dist / 110) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Glitch loop on title ── */
  useEffect(() => {
    const loop = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 180);
    }, 3200);
    return () => clearInterval(loop);
  }, []);

  const handleEnter = () => {
    // Write the started event to localStorage NOW, before navigation.
    // This is the single source of truth — the timeline page reads it
    // on mount and will be in 'running' state from the first render,
    // even after a full page reload or deployment.
    try {
      const started = startEvent(defaultEvent(), Date.now());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(started));
    } catch {
      // localStorage unavailable — the timeline page will fallback gracefully
    }
    setEntering(true);
    setTimeout(() => navigate({ to: "/timeline", replace: true }), 900);
  };

  return (
    <div className={`landing-root ${entering ? "landing-exit" : ""}`}>
      <canvas ref={canvasRef} className="landing-canvas" aria-hidden />

      {/* Corner brackets */}
      <div className="corner corner-tl" aria-hidden />
      <div className="corner corner-tr" aria-hidden />
      <div className="corner corner-bl" aria-hidden />
      <div className="corner corner-br" aria-hidden />

      {/* Top bar */}
      <header className="landing-topbar">
        <div className="landing-brand">
          <ShieldCheck size={18} className="landing-brand-icon" />
          <span>HACKURITY</span>
          <span className="landing-brand-year">/ 2026</span>
        </div>
        <div className="landing-topbar-right">
          <span className="landing-dot" />
          <span>SYSTEM ONLINE</span>
          <span className="landing-sep" />
          <span>24-HOUR HACKATHON</span>
        </div>
      </header>

      {/* Centre content */}
      <main className="landing-center" aria-label="HACKURITY 2026 landing">
        {/* Eyebrow */}
        <div className="landing-eyebrow">
          <span className="landing-eyebrow-line" />
          <span>HACKURITY 2026</span>
          <span className="landing-eyebrow-line" />
        </div>

        {/* Main headline */}
        <h1 className={`landing-headline ${glitching ? "glitch" : ""}`} data-text="ENTER THE GRID">
          ENTER THE GRID
        </h1>

        {/* Sub headline */}
        <p className="landing-sub">BREACH THE PERIMETER. BUILD THE FUTURE. DOMINATE THE CLOCK.</p>

        {/* Stats row */}
        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-val">24</span>
            <span className="landing-stat-label">HOURS</span>
          </div>
          <div className="landing-stat-div" />
          <div className="landing-stat">
            <span className="landing-stat-val">∞</span>
            <span className="landing-stat-label">POSSIBILITIES</span>
          </div>
          <div className="landing-stat-div" />
          <div className="landing-stat">
            <span className="landing-stat-val">01</span>
            <span className="landing-stat-label">MISSION</span>
          </div>
        </div>

        {/* CTA */}
        <button
          id="enter-grid-btn"
          className="landing-cta"
          onClick={handleEnter}
          aria-label="Enter the grid — go to the hackathon timeline"
        >
          <span className="landing-cta-glow" aria-hidden />
          <span className="landing-cta-text">// ENTER THE GRID</span>
          <span className="landing-cta-arrow" aria-hidden>
            ▶
          </span>
        </button>

        {/* Warning strip */}
        <p className="landing-warning">
          <span className="landing-dot" />
          WARNING: ONCE YOU ENTER, THE CLOCK STARTS TICKING
          <span className="landing-dot" />
        </p>
      </main>

      {/* Bottom strip */}
      <footer className="landing-footer">
        <span>SECURE. BUILD. INNOVATE.</span>
        <span className="landing-sep" />
        <span className="landing-powered-by">
          POWERED BY <img src="/bob-logo.png" alt="Bob" className="landing-powered-logo" />
        </span>
        <span className="landing-sep" />
        <span>AES-256 ENCRYPTED ENVIRONMENT</span>
        <span className="landing-sep" />
        <span>ALL CHANNELS PROTECTED</span>
      </footer>

      {/* Side labels */}
      <div className="landing-side landing-side-l" aria-hidden>
        {"CYBERSECURITY · HACKATHON · 2026 · HACKURITY".split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
      <div className="landing-side landing-side-r" aria-hidden>
        {"SECURE · BUILD · INNOVATE · BREACH · DEFEND".split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </div>
  );
}
