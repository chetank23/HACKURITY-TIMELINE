import { useEffect, useRef } from "react";
import type { EventState } from "./event";
export function NetworkScene({ event, complete }: { event: EventState; complete: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext("2d");
    if (!ctx) return;
    const styles = getComputedStyle(document.documentElement);
    const green = styles.getPropertyValue("--primary").trim();
    const white = styles.getPropertyValue("--foreground").trim();
    let frame = 0,
      last = 0,
      elapsed = 0;
    const reduced = event.reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = event.performanceMode ? 30 : 85;
    const paths = [
      [
        [90, 390],
        [380, 260],
        [470, 810],
        [960, 710],
      ],
      [
        [1840, 390],
        [1540, 240],
        [1450, 810],
        [960, 710],
      ],
      [
        [120, 735],
        [420, 610],
        [560, 925],
        [960, 710],
      ],
      [
        [1800, 745],
        [1490, 580],
        [1350, 940],
        [960, 710],
      ],
      [
        [330, 265],
        [600, 130],
        [790, 270],
        [955, 320],
      ],
      [
        [1570, 265],
        [1350, 120],
        [1170, 270],
        [965, 320],
      ],
      [
        [130, 490],
        [520, 500],
        [560, 700],
        [960, 710],
      ],
      [
        [1790, 490],
        [1460, 470],
        [1380, 650],
        [960, 710],
      ],
    ];
    function point(path: number[][], t: number) {
      const s = 1 - t;
      const a = path[0] ?? [0, 0],
        b = path[1] ?? a,
        c = path[2] ?? b,
        d = path[3] ?? c;
      const coordinate = (i: number) =>
        s * s * s * (a[i] ?? 0) +
        3 * s * s * t * (b[i] ?? 0) +
        3 * s * t * t * (c[i] ?? 0) +
        t * t * t * (d[i] ?? 0);
      return { x: coordinate(0), y: coordinate(1) };
    }
    function line(x1: number, y1: number, x2: number, y2: number) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    function draw(time: number) {
      if (!ctx) return;
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
      last = time;
      elapsed += dt * (reduced ? 0.15 : 1);
      if (
        event.performanceMode &&
        dt < 0.03 &&
        Math.floor(time / 33) === Math.floor((time - dt * 1000) / 33)
      ) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const t = elapsed;
      ctx.clearRect(0, 0, 1920, 1080);
      ctx.strokeStyle = green;
      ctx.fillStyle = green;
      ctx.lineWidth = 1;
      const intensity = event.intensity / 100;
      ctx.globalAlpha = (event.brightness / 100) * 0.7;
      if (event.layers.ambient) {
        for (let i = 0; i < count; i++) {
          const x = (i * 397.3 + t * (3 + (i % 4))) % 1920,
            y = (i * 173.8 + Math.sin(t * 0.12 + i) * 18) % 940;
          ctx.globalAlpha = 0.1 + (i % 4) * 0.04;
          ctx.fillRect(x, y, i % 9 === 0 ? 3 : 1.5, i % 9 === 0 ? 3 : 1.5);
        }
        ctx.globalAlpha = 0.055;
        ctx.font = "10px monospace";
        for (let i = 0; i < 22; i++)
          ctx.fillText(
            i % 2 ? "01001 11010 00101" : "0xA8F2 0xE619",
            50 + ((i * 223) % 1800),
            (i * 137 + t * 6) % 870,
          );
        ctx.globalAlpha = 0.075;
        for (let i = 0; i < 18; i++) {
          const x = (i * 133) % 1920;
          ctx.beginPath();
          ctx.moveTo(x, 100);
          ctx.lineTo(x, 170 + i * 29);
          ctx.lineTo(x + 45, 215 + i * 29);
          ctx.lineTo(x + 45, 870);
          ctx.stroke();
        }
      }
      if (event.layers.globe) {
        const radius = 322,
          cx = 960,
          cy = 505,
          rot = t * 0.055;
        const project = (lat: number, lon: number) => {
          const x = radius * Math.cos(lat) * Math.sin(lon + rot),
            z = Math.cos(lat) * Math.cos(lon + rot);
          return { x: cx + x, y: cy + radius * Math.sin(lat) * 0.92 + z * 32, z };
        };
        ctx.lineWidth = 0.8;
        for (let lat = -1.35; lat <= 1.4; lat += 0.23) {
          ctx.beginPath();
          for (let j = 0; j <= 100; j++) {
            const p = project(lat, (j * Math.PI * 2) / 100);
            ctx.globalAlpha = (0.12 * event.brightness) / 100;
            if (j) {
              ctx.lineTo(p.x, p.y);
            } else {
              ctx.moveTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }
        for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 12) {
          ctx.beginPath();
          for (let j = 0; j <= 80; j++) {
            const p = project(-Math.PI / 2 + (j * Math.PI) / 80, lon);
            if (j) {
              ctx.lineTo(p.x, p.y);
            } else {
              ctx.moveTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }
        for (let i = 0; i < 38; i++) {
          const p = project(Math.sin(i * 7.1) * 1.25, i * 2.4);
          ctx.globalAlpha = p.z > 0 ? 0.35 + 0.3 * Math.sin(t * 1.5 + i) ** 2 : 0.09;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          if (i % 4 === 0) {
            const p2 = project(Math.sin((i + 1) * 7.1) * 1.25, (i + 1) * 2.4);
            ctx.globalAlpha = 0.17;
            line(p.x, p.y, p2.x, p2.y);
          }
        }
        ctx.globalAlpha = 0.15;
        ctx.setLineDash([3, 12]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, 355, 350, rot, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (event.layers.packets) {
        paths.forEach((path, index) => {
          ctx.globalAlpha = (0.17 * event.brightness) / 100;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(...(path[0] as [number, number]));
          ctx.bezierCurveTo(
            ...(path.slice(1).flat() as [number, number, number, number, number, number]),
          );
          ctx.stroke();
          const number = event.performanceMode ? 3 : Math.max(3, Math.round(8 * intensity));
          for (let i = 0; i < number; i++) {
            let phase = (t * (0.035 + (i % 3) * 0.012) + i / number + index * 0.173) % 1;
            if (i % 2) phase = 1 - phase;
            const p = point(path, phase),
              tail = point(path, Math.max(0, phase - 0.025));
            ctx.globalAlpha = 0.35 + (i % 3) * 0.2;
            ctx.strokeStyle = phase > 0.65 ? green : white;
            ctx.lineWidth = i % 3 === 0 ? 2 : 1;
            line(tail.x, tail.y, p.x, p.y);
            ctx.fillStyle = phase > 0.65 ? green : white;
            ctx.fillRect(p.x - 2, p.y - 2, i % 3 === 0 ? 5 : 3, 3);
            if (i === 0) {
              ctx.globalAlpha = 0.5;
              ctx.font = "9px monospace";
              ctx.fillText(phase > 0.65 ? "0xE619" : "{ data }", p.x + 9, p.y - 6);
            }
            ctx.strokeStyle = green;
            ctx.fillStyle = green;
          }
        });
      }
      if (event.layers.infrastructure) {
        [90, 1740].forEach((x, side) => {
          ctx.globalAlpha = 0.28;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, 340, 90, 215);
          for (let r = 0; r < 6; r++) {
            ctx.globalAlpha = 0.22;
            ctx.strokeRect(x + 8, 352 + r * 31, 74, 23);
            for (let l = 0; l < 5; l++) {
              ctx.globalAlpha = 0.2 + 0.6 * Math.sin(t * (1.2 + l * 0.21) + r + side * 2 + l) ** 8;
              ctx.fillRect(x + 15 + l * 8, 361 + r * 31, 3, 3);
            }
            ctx.globalAlpha = 0.2;
            line(x + 62, 360 + r * 31, x + 73, 360 + r * 31);
          }
          ctx.globalAlpha = 0.35;
          ctx.font = "10px monospace";
          ctx.fillText(side ? "EDGE NODE / 02" : "EDGE NODE / 01", x - 5, 579);
          const sy = 640;
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(x - 18, sy, 128, 72);
          line(x - 29, sy + 82, x + 121, sy + 82);
          line(x + 9, sy + 72, x - 9, sy + 82);
          line(x + 84, sy + 72, x + 104, sy + 82);
          ctx.font = "9px monospace";
          ctx.fillText(side ? "AUTH VERIFIED" : "CHANNEL SECURE", x - 6, sy + 38);
        });
      }
      if (event.layers.scanning) {
        const cycle = (t * 0.12) % 1;
        ctx.globalAlpha = (1 - cycle) * 0.15;
        ctx.beginPath();
        ctx.ellipse(960, 710, 90 + cycle * 125, 32 + cycle * 42, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.font = "10px monospace";
        const blocked = Math.floor(t / 9) % 3 === 2;
        ctx.fillText(
          blocked ? "UNTRUSTED PACKET · BLOCKED" : "INTEGRITY VERIFIED · PASSED",
          1270,
          780,
        );
        ctx.beginPath();
        ctx.arc(1250, 776, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (complete && event.completionAnimation && t < 8) {
        ctx.globalAlpha = 0.08 * (1 - t / 8);
        ctx.fillRect(0, 0, 1920, 1080);
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [
    event.layers,
    event.intensity,
    event.brightness,
    event.reducedMotion,
    event.performanceMode,
    event.completionAnimation,
    complete,
  ]);
  return (
    <canvas
      ref={canvas}
      width={1920}
      height={1080}
      className="network-canvas"
      style={{ opacity: event.brightness / 100 }}
      aria-label="Simulated animated cybersecurity network"
    />
  );
}
