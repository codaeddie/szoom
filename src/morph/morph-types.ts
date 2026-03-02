// ─────────────────────────────────────────────────
// MORPH SHAPE TYPE DEFINITION
//
// ProNet branch: contractor business card shapes.
// Each morph shape represents a contractor/person
// in a referral network graph. Props hold identity,
// trade info, contact details, and a trade color.
// ─────────────────────────────────────────────────

import { TLShape } from 'tldraw'

export const MORPH_TYPE = 'morph' as const

declare module 'tldraw' {
  interface TLGlobalShapePropsMap {
    [MORPH_TYPE]: MorphShapeProps
  }
}

export type MorphShape = TLShape<typeof MORPH_TYPE>

export interface MorphShapeProps {
  w: number        // driven by semantic zoom engine, not user
  h: number        // driven by semantic zoom engine, not user
  name: string     // contractor display name (e.g. "Mike Torres")
  company: string  // company name (e.g. "Torres Electric LLC")
  license: string  // license number (e.g. "CSLB #1045782") — empty string if unlicensed
  trades: string[] // trade categories (e.g. ["Electrical", "Low Voltage"])
  areas: string[]  // service areas (e.g. ["San Diego", "El Cajon"])
  phone: string    // phone number (e.g. "(619) 555-0301") — used for tel: link
  color: string    // trade color hex (e.g. "#f59e0b") — resolved from first trade
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
  name: string
  company: string
  license: string
  trades: string[]
  areas: string[]
  phone: string
  color: string   // resolved from first trade via TRADE_COLORS
  x: number
  y: number
}

export interface GraphEdge {
  from: string
  to: string
}

// ─────────────────────────────────────────────────
// TRADE COLORS — domain-specific category colors.
// Not using tldraw's built-in color palette since
// these are trade categories, not user styles.
// ─────────────────────────────────────────────────

export const TRADE_COLORS: Record<string, string> = {
  'Electrical':  '#f59e0b',
  'Plumbing':    '#3b82f6',
  'HVAC':        '#10b981',
  'General Contractor': '#8b5cf6',
  'Painting':    '#ec4899',
  'Roofing':     '#ef4444',
  'Landscaping': '#22c55e',
  'Low Voltage': '#06b6d4',
}

export const DEFAULT_TRADE_COLOR = '#6b7280'

export function getTradeColor(trade: string): string {
  return TRADE_COLORS[trade.trim()] ?? DEFAULT_TRADE_COLOR
}

export function getPrimaryTradeColor(trades: string[]): string {
  const first = trades[0]?.trim()
  return first ? getTradeColor(first) : DEFAULT_TRADE_COLOR
}

// ─────────────────────────────────────────────────
// GLOBAL STATE KEY
// ─────────────────────────────────────────────────

export const DETAIL_LEVEL_KEY = 'detailLevel'
