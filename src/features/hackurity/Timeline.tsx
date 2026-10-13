import {
  Flag,
  Users,
  Lightbulb,
  Code2,
  ScanLine,
  FileCheck2,
  Presentation,
  Trophy,
} from "lucide-react";
import type { Milestone } from "./event";
const icons = [Flag, Users, Lightbulb, Code2, ScanLine, FileCheck2, Presentation, Trophy];
export function Timeline({ milestones, elapsed }: { milestones: Milestone[]; elapsed: number }) {
  const sorted = [...milestones].sort((a, b) => a.hours - b.hours);
  const current = sorted.reduce((result, m, i) => (m.hours <= elapsed ? i : result), 0);
  const percent = Math.min(100, Math.max(0, (elapsed / 24) * 100));
  return (
    <section className="event-timeline" aria-label="Event timeline">
      <div className="timeline-heading">
        <span>THE NEXT 24 HOURS</span>
        <span>
          {Math.round(percent)}% COMPLETE <span className="timeline-divider">/</span> EVENT TIMELINE
        </span>
      </div>
      <div className="timeline-track">
        <div className="timeline-progress" style={{ width: `${percent}%` }} />
        <div className="timeline-cursor" style={{ left: `${percent}%` }} />
        {sorted.map((m, i) => {
          const Icon = icons[i % icons.length] ?? Flag;
          return (
            <div
              key={`${i}-${m.label}`}
              className={`milestone ${i < current ? "done" : ""} ${i === current ? "current" : ""} ${i === sorted.length - 2 ? "upper-label" : ""}`}
              style={{ left: `${(m.hours / 24) * 100}%` }}
            >
              <span className="milestone-node" />
              <div className="milestone-info">
                <span className="milestone-time">
                  {String(Math.floor(m.hours)).padStart(2, "0")}:
                  {String(Math.round((m.hours % 1) * 60)).padStart(2, "0")}
                </span>
                <span className="milestone-label">
                  <Icon size={13} />
                  {m.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
