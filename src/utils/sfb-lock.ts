/**
 * SFB lock-window awareness for Rhodium11 schedule responses.
 *
 * The mpux-flask backend (rh11's API) freezes the next N days of SFB once a
 * project has active SFB running, where N is `LOCK_SFB_DAYS` (default 2). See
 * `mpux-flask/api_customer/validators.py::check_sfb_lock`. The lock only applies
 * when the project's current_sfb > 0; until then SFB can be scheduled freely,
 * but as soon as it begins running, the next N days become committed.
 *
 * The MCP cannot tell from a schedule payload alone whether the project's
 * current SFB is non-zero, so this util surfaces an INFORMATIONAL summary of
 * how many SFB units fall inside the lock window. The backend remains the
 * authority — it will still reject changes that violate the lock.
 *
 * The MCP-side lock window is configurable via the `RH11_LOCK_SFB_DAYS` env
 * var (default 2) so it can track the backend setting without a redeploy.
 */

import type { ScheduleEntry } from "../client/types.js";

export interface SfbLockInfo {
  lock_days: number;
  locked_sfb_units: number;
  earliest_unlocked_date: string;
  note: string;
}

/** Resolve the lock-window length from env, defaulting to the backend default of 2. */
export function getSfbLockDays(): number {
  const raw = process.env.RH11_LOCK_SFB_DAYS;
  if (raw == null || raw === "") return 2;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 2;
  return parsed;
}

/**
 * Compute SFB lock info from a backend schedule response.
 *
 * Returns null when no SFB units fall inside the lock window — the response
 * stays clean for the common case (no SFB scheduled).
 */
export function computeSfbLockInfo(
  scheduling: ScheduleEntry[],
  now: Date = new Date(),
): SfbLockInfo | null {
  const lockDays = getSfbLockDays();
  if (lockDays <= 0) return null;

  const today = startOfUtcDay(now);
  const boundary = addUtcDays(today, lockDays);
  const todayStr = toIsoDate(today);
  const boundaryStr = toIsoDate(boundary);

  // Bucket dated entries by ISO date so ongoing doesn't double-count days that have an override.
  const datedSfbInWindow = new Map<string, number>();
  let ongoingSfb = 0;

  for (const entry of scheduling) {
    if (entry.id === "ongoing" || entry.date === "ongoing") {
      ongoingSfb = entry.purchase ?? 0;
      continue;
    }
    const iso = normalizeDateToIso(entry.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue;
    if (iso >= todayStr && iso < boundaryStr) {
      datedSfbInWindow.set(iso, (datedSfbInWindow.get(iso) ?? 0) + (entry.purchase ?? 0));
    }
  }

  let lockedSfb = 0;
  for (const [, sfb] of datedSfbInWindow) {
    lockedSfb += sfb;
  }
  if (ongoingSfb > 0) {
    for (let i = 0; i < lockDays; i++) {
      const day = toIsoDate(addUtcDays(today, i));
      if (!datedSfbInWindow.has(day)) {
        lockedSfb += ongoingSfb;
      }
    }
  }

  if (lockedSfb === 0) return null;

  return {
    lock_days: lockDays,
    locked_sfb_units: lockedSfb,
    earliest_unlocked_date: boundaryStr,
    note:
      `${lockedSfb} SFB unit(s) fall within the next ${lockDays}-day lock window. ` +
      `Once SFB is running on this project, the backend freezes the next ${lockDays} ` +
      `days of SFB at the current value (vendor coordination) — those units cannot ` +
      `be cancelled or changed until ${boundaryStr}.`,
  };
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function normalizeDateToIso(date: string): string {
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;
  return date;
}
