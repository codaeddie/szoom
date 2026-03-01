import { TLShape, TLShapeId } from 'tldraw'

// ─────────────────────────────────────────────────
// MORPH SHAPE TYPE DEFINITION
// ─────────────────────────────────────────────────

export const MORPH_TYPE = 'morph' as const

declare module 'tldraw' {
  interface TLGlobalShapePropsMap {
    [MORPH_TYPE]: MorphShapeProps
  }
}

export type MorphShape = TLShape<typeof MORPH_TYPE>

export interface MorphShapeProps {
  w: number
  h: number
  title: string
  body: string
}

// ─────────────────────────────────────────────────
// MORPH PHASES — Discrete, not continuous
//
// "Avoids smooth morphing between phases
//  (rapid morphs once passing the scroll value)"
//
// The slider value (0.00–1.00) maps to one of 4
// discrete phases. No interpolation between them.
// ─────────────────────────────────────────────────

export enum MorphPhase {
  Dot = 0,
  Label = 1,
  Card = 2,
  Document = 3,
}

export interface PhaseConfig {
  phase: MorphPhase
  w: number
  h: number
  borderRadius: number
}

// ─────────────────────────────────────────────────
// GRAPH TYPES — for webcola integration
// ─────────────────────────────────────────────────

export interface GraphNode {
  id: string
  title: string
  body: string
  x: number
  y: number
}

export interface GraphEdge {
  from: string
  to: string
}

// ─────────────────────────────────────────────────
// GLOBAL STATE KEY
// ─────────────────────────────────────────────────

export const DETAIL_LEVEL_KEY = 'detailLevel'
