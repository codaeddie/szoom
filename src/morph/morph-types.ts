// ─────────────────────────────────────────────────
// MORPH SHAPE TYPE DEFINITION
//
// Person card shape for family/social graphs.
// Props: name, role, info, bio, avatarUrl, color.
// Renders progressively across 4 semantic zoom phases.
// ─────────────────────────────────────────────────

import { TLShape, TLShapeId } from 'tldraw'

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
  name: string          // always present — rendered at every phase
  role: string          // "Son" / "Mother" / "Uncle"
  info: string          // short line — "Makdesi & Coda Family"
  bio: string           // full paragraph for Document phase
  avatarUrl: string     // image URL or empty string (reserved for future use)
  color: string         // hex color for initials circle bg — e.g. '#9C27B0'
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
//
// GraphNode: data model for each person in the graph.
// GraphEdge: directed connection between two nodes.
// ─────────────────────────────────────────────────

export interface GraphNode {
  id: string
  name: string
  role: string
  info: string
  bio: string
  color: string
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
