import type { TimelineStep, UnitSystem } from "../data/types";
import { fmtTime } from "./format";

export interface PlannedStep {
  name: string;
  dur: number;
  startMin: number;
  isServe: boolean;
}

/**
 * 1:1 port of the original renderTimeline scheduling:
 * walks backwards from serve time; steps run sequentially;
 * 0-duration steps (e.g. "Serve") pin to the current cursor.
 */
export function planBackwards(
  steps: TimelineStep[],
  serveMinutes: number
): PlannedStep[] {
  const schedule: PlannedStep[] = [];
  let cursor = serveMinutes;
  for (let i = steps.length - 1; i >= 0; i--) {
    const [name, dur] = steps[i];
    const startMin = cursor - dur;
    schedule.unshift({
      name,
      dur,
      startMin: dur > 0 ? startMin : cursor,
      isServe: i === steps.length - 1,
    });
    if (dur > 0) cursor = startMin;
  }
  return schedule;
}

export function stepTime(step: PlannedStep, system: UnitSystem): string {
  return fmtTime(step.startMin, system);
}

/** "270" → "4h 30min", matching the original's duration text. */
export function durText(dur: number): string {
  if (dur <= 0) return "";
  if (dur >= 60) return Math.floor(dur / 60) + "h" + (dur % 60 ? " " + (dur % 60) + "min" : "");
  return dur + " min";
}
