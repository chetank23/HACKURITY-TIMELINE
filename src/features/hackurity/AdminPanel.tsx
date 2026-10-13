import { useState } from "react";
import { Play, Pause, RotateCcw, Monitor, Plus, Trash2, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DURATION,
  pauseEvent,
  resumeEvent,
  startEvent,
  type EventState,
  type Layers,
} from "./event";
export async function toggleFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}
export function AdminPanel({
  open,
  onClose,
  event,
  update,
  storageError,
  onPresent,
}: {
  open: boolean;
  onClose: () => void;
  event: EventState;
  update: (change: Partial<EventState> | ((e: EventState) => EventState)) => void;
  storageError: boolean;
  onPresent: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<EventState | null>(null);
  const current = draft ?? event;
  const edit = (change: Partial<EventState>) => setDraft((p) => ({ ...(p ?? event), ...change }));
  const save = () => {
    if (
      current.milestones.some(
        (m) =>
          !m.label.trim() ||
          m.label.length > 24 ||
          !Number.isFinite(m.hours) ||
          m.hours < 0 ||
          m.hours > 24,
      )
    ) {
      setError("Each milestone needs a label and an offset from 0 to 24 hours.");
      return;
    }
    const sorted = [...current.milestones].sort((a, b) => a.hours - b.hours);
    if (
      sorted[0]?.hours !== 0 ||
      sorted.at(-1)?.hours !== 24 ||
      sorted.some((m, i) => i > 0 && m.hours === sorted[i - 1]?.hours)
    ) {
      setError("Include unique offsets, with a kickoff at 0 and a final milestone at 24 hours.");
      return;
    }
    update({ ...current, milestones: sorted });
    setDraft(null);
    setError("");
  };
  const protect = () => {
    if (event.status !== "preview") {
      setConfirm(true);
      return false;
    }
    return true;
  };
  const schedule = () => {
    if (!protect()) return;
    const start = new Date(current.plannedStart).getTime();
    if (!Number.isFinite(start)) {
      setError("Choose a valid start date and time.");
      return;
    }
    update({ ...current, status: "scheduled", start });
    setDraft(null);
    setError("");
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setDraft(null);
          setConfirm(false);
          onClose();
        }
      }}
    >
      <DialogContent className="admin-panel">
        <DialogTitle className="admin-title">
          <ShieldCheck size={22} /> EVENT CONTROL
        </DialogTitle>
        <DialogDescription>HACKURITY · Single-device installation</DialogDescription>
        {storageError && (
          <p className="control-error">
            Settings could not be saved on this browser. Keep this page open.
          </p>
        )}
        {error && (
          <p className="control-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-section">
          <h3>EVENT</h3>
          <label>
            Event name
            <input
              value={current.name}
              maxLength={36}
              onChange={(e) => edit({ name: e.target.value })}
            />
          </label>
          <label>
            Planned start · local time
            <input
              type="datetime-local"
              value={current.plannedStart}
              onChange={(e) => edit({ plannedStart: e.target.value })}
            />
          </label>
          <div className="control-row">
            <Button variant="outline" onClick={schedule}>
              Schedule start
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!protect()) return;
                update({ status: "preview", start: null, pausedRemaining: DURATION });
                setDraft(null);
              }}
            >
              Preview
            </Button>
          </div>
          <div className="control-row">
            <Button
              onClick={() => {
                update((e) => startEvent(e, Date.now()));
                setDraft(null);
              }}
              disabled={event.status !== "preview"}
            >
              <Play />
              Start 24-hour event
            </Button>
            {event.status === "paused" ? (
              <Button
                variant="outline"
                onClick={() => {
                  update((e) => resumeEvent(e, Date.now()));
                  setDraft(null);
                }}
              >
                <Play />
                Resume
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={
                  event.status === "preview" ||
                  (event.status === "scheduled" && event.start !== null && Date.now() < event.start)
                }
                onClick={() => {
                  update((e) => pauseEvent(e, Date.now()));
                  setDraft(null);
                }}
              >
                <Pause />
                Pause
              </Button>
            )}
            <Button variant="ghost" onClick={() => setConfirm(true)}>
              <RotateCcw />
              Reset
            </Button>
          </div>
          {confirm && (
            <div className="reset-confirm" role="alert">
              <strong>Reset this event?</strong>
              <p>The active countdown and elapsed progress will be cleared.</p>
              <div className="control-row">
                <Button
                  onClick={() => {
                    update({ status: "preview", start: null, pausedRemaining: DURATION });
                    setDraft(null);
                    setConfirm(false);
                  }}
                >
                  Confirm reset
                </Button>
                <Button variant="outline" onClick={() => setConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="admin-section">
          <h3>
            TIMELINE <span>DEFAULT TIMINGS · EDITABLE</span>
          </h3>
          {current.milestones.map((m, i) => (
            <div className="milestone-editor" key={i}>
              <input
                aria-label={`Milestone ${i + 1} label`}
                value={m.label}
                maxLength={24}
                onChange={(e) =>
                  edit({
                    milestones: current.milestones.map((v, j) =>
                      j === i ? { ...v, label: e.target.value } : v,
                    ),
                  })
                }
              />
              <input
                aria-label={`Milestone ${i + 1} hours`}
                type="number"
                min={0}
                max={24}
                step={0.25}
                value={m.hours}
                onChange={(e) =>
                  edit({
                    milestones: current.milestones.map((v, j) =>
                      j === i ? { ...v, hours: Number(e.target.value) } : v,
                    ),
                  })
                }
              />
              <span>hr</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove milestone ${i + 1}`}
                disabled={current.milestones.length <= 2}
                onClick={() => edit({ milestones: current.milestones.filter((_, j) => j !== i) })}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={current.milestones.length >= 12}
            onClick={() =>
              edit({ milestones: [...current.milestones, { label: "NEW MILESTONE", hours: 9 }] })
            }
          >
            <Plus />
            Add milestone
          </Button>
        </div>
        <div className="admin-section">
          <h3>ENVIRONMENT</h3>
          <div className="layer-controls">
            {(Object.keys(current.layers) as (keyof Layers)[]).map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={current.layers[key]}
                  onChange={(e) => edit({ layers: { ...current.layers, [key]: e.target.checked } })}
                />
                {key}
              </label>
            ))}
          </div>
          <label>
            Animation intensity <span>{current.intensity}%</span>
            <input
              type="range"
              min={10}
              max={100}
              value={current.intensity}
              onChange={(e) => edit({ intensity: Number(e.target.value) })}
            />
          </label>
          <label>
            Ambient brightness <span>{current.brightness}%</span>
            <input
              type="range"
              min={10}
              max={100}
              value={current.brightness}
              onChange={(e) => edit({ brightness: Number(e.target.value) })}
            />
          </label>
          <div className="layer-controls">
            {(["reducedMotion", "performanceMode", "completionAnimation"] as const).map(
              (key, i) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={current[key]}
                    onChange={(e) => edit({ [key]: e.target.checked })}
                  />
                  {["Reduced motion", "Low-power mode", "Completion pulse"][i]}
                </label>
              ),
            )}
          </div>
        </div>
        <div className="admin-footer">
          <Button onClick={save}>
            <Check />
            Save settings
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await toggleFullscreen();
              } catch {
                setError("Fullscreen is unavailable in this browser.");
              }
            }}
          >
            <Monitor />
            Toggle fullscreen
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              onPresent();
            }}
          >
            Presentation mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
