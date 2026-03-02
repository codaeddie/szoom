import { MorphPhase, PhaseConfig } from './morph-types'

// ─────────────────────────────────────────────────
// PHASE CONFIGS
//
// Each phase defines a fixed shape size. Transitions
// are discrete snaps — no interpolation.
//
// ProNet dimensions — contractor business cards:
//   Dot:      30x30   (trade-colored initial circle)
//   Label:    240x32  (name + company strip)
//   Card:     350x200 (business card ratio ~1.75:1)
//   Document: 420x320 (full profile with phone link)
// ─────────────────────────────────────────────────

export const PHASE_CONFIGS: Record<MorphPhase, PhaseConfig> = {
  [MorphPhase.Dot]: {
    phase: MorphPhase.Dot,
    w: 30,
    h: 30,
    borderRadius: 15, // circle
  },
  [MorphPhase.Label]: {
    phase: MorphPhase.Label,
    w: 240,
    h: 32,
    borderRadius: 4,
  },
  [MorphPhase.Card]: {
    phase: MorphPhase.Card,
    w: 350,
    h: 200,
    borderRadius: 8,
  },
  [MorphPhase.Document]: {
    phase: MorphPhase.Document,
    w: 420,
    h: 320,
    borderRadius: 8,
  },
}

// ─────────────────────────────────────────────────
// PHASE THRESHOLDS
//
// Maps the continuous slider value (0–1) to a
// discrete phase. Snaps at these boundaries:
//
//   0.00–0.19  →  Dot
//   0.20–0.79  →  Label
//   0.80–0.99  →  Card
//   1.00        →  Document
//
// Snap points at 0.20, 0.80, 1.00 matching Orion's
// demo values (0, 20, 80, 100).
// ─────────────────────────────────────────────────

export function getPhaseFromLevel(level: number): MorphPhase {
  if (level < 0.20) return MorphPhase.Dot
  if (level < 0.80) return MorphPhase.Label
  if (level < 1.00) return MorphPhase.Card
  return MorphPhase.Document
}

export function getPhaseConfig(level: number): PhaseConfig {
  return PHASE_CONFIGS[getPhaseFromLevel(level)]
}

/**
 * Preset detail levels matching Orion's demo stops.
 * Used by the slider to show clickable presets.
 */
export const DETAIL_PRESETS = [
  { label: '0', value: 0.0, phase: MorphPhase.Dot },
  { label: '20', value: 0.2, phase: MorphPhase.Label },
  { label: '80', value: 0.8, phase: MorphPhase.Card },
  { label: '100', value: 1.0, phase: MorphPhase.Document },
] as const
