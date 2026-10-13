import { useEffect, useState } from "react";
const events = [
  "Establishing secure channel",
  "Encrypting payload",
  "Verifying integrity hash",
  "Packet transmission complete",
  "Authentication verified",
  "Firewall rule evaluated",
  "Secure tunnel established",
  "Decrypting received payload",
];
export function Terminal({ enabled, reduced }: { enabled: boolean; reduced: boolean }) {
  const [lines, setLines] = useState([
    { id: 0, text: events[0] },
    { id: 1, text: events[2] },
    { id: 2, text: events[4] },
  ]);
  useEffect(() => {
    if (!enabled || reduced) return;
    let id = 3,
      timer: ReturnType<typeof setTimeout>;
    const next = () => {
      setLines((p) => [...p.slice(-3), { id, text: events[id % events.length] }]);
      id++;
      timer = setTimeout(next, 1900 + ((id * 719) % 2200));
    };
    timer = setTimeout(next, 2400);
    return () => clearTimeout(timer);
  }, [enabled, reduced]);
  if (!enabled) return null;
  return (
    <aside className="security-terminal">
      <div className="terminal-heading">
        <span className="status-dot" />
        SECURE CHANNEL <span>SYS.01</span>
      </div>
      {lines.map((l) => (
        <div className="terminal-line" key={l.id}>
          <span>{String(l.id).padStart(3, "0")}</span>
          <span>[SIMULATED] {l.text}</span>
        </div>
      ))}
      <div className="terminal-prompt">
        &gt; <span className="terminal-caret" />
      </div>
    </aside>
  );
}
