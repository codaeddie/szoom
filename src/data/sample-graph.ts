// ─────────────────────────────────────────────────
// PRONET SAMPLE DATA — Contractor Referral Network
//
// 12 nodes: 3 hub nodes (Eddie, Mom, GC) + 9
// contractor nodes across 7 trade categories.
// 15 directed referral edges forming a small-world
// topology with shared referrals and cross-referrals.
//
// San Diego area service zones. CSLB license numbers
// are plausible format (not real).
// ─────────────────────────────────────────────────

import { GraphNode, GraphEdge } from '../morph/morph-types'

export const SAMPLE_NODES: GraphNode[] = [
  // ── Hub nodes (referrers) ────────────────────────
  {
    id: 'eddie',
    name: 'Eddie',
    company: '',
    license: '',
    trades: [],
    areas: ['San Diego'],
    phone: '(619) 555-0100',
    color: '#9C27B0',
    x: 100,
    y: 250,
  },
  {
    id: 'mom',
    name: 'Besma',
    company: '',
    license: '',
    trades: [],
    areas: ['El Cajon'],
    phone: '(619) 555-0101',
    color: '#9C27B0',
    x: 100,
    y: 450,
  },
  {
    id: 'carlos-vega',
    name: 'Carlos Vega',
    company: 'Vega General Construction',
    license: 'CSLB #987654',
    trades: ['General Contractor'],
    areas: ['San Diego', 'Chula Vista', 'National City'],
    phone: '(619) 555-0200',
    color: '#8b5cf6',
    x: 350,
    y: 250,
  },

  // ── Electrical cluster ──────────────────────────
  {
    id: 'mike-torres',
    name: 'Mike Torres',
    company: 'Torres Electric',
    license: 'CSLB #1045782',
    trades: ['Electrical', 'Low Voltage'],
    areas: ['San Diego', 'El Cajon', 'La Mesa'],
    phone: '(619) 555-0301',
    color: '#f59e0b',
    x: 550,
    y: 150,
  },
  {
    id: 'jake-nguyen',
    name: 'Jake Nguyen',
    company: 'JN Low Voltage',
    license: 'CSLB #1123456',
    trades: ['Low Voltage'],
    areas: ['San Diego', 'Poway', 'Scripps Ranch'],
    phone: '(619) 555-0302',
    color: '#06b6d4',
    x: 700,
    y: 100,
  },

  // ── HVAC ────────────────────────────────────────
  {
    id: 'tony-park',
    name: 'Tony Park',
    company: 'Pacific Air HVAC',
    license: 'CSLB #998877',
    trades: ['HVAC'],
    areas: ['San Diego', 'Santee', 'El Cajon'],
    phone: '(619) 555-0401',
    color: '#10b981',
    x: 550,
    y: 350,
  },

  // ── Plumbing ────────────────────────────────────
  {
    id: 'dave-klein',
    name: 'Dave Klein',
    company: 'Klein Plumbing',
    license: 'CSLB #876543',
    trades: ['Plumbing'],
    areas: ['El Cajon', 'La Mesa', 'Spring Valley'],
    phone: '(619) 555-0501',
    color: '#3b82f6',
    x: 300,
    y: 450,
  },

  // ── Painting ────────────────────────────────────
  {
    id: 'ana-ruiz',
    name: 'Ana Ruiz',
    company: 'Color Pro Painting',
    license: 'CSLB #1056789',
    trades: ['Painting'],
    areas: ['San Diego', 'Coronado', 'Point Loma'],
    phone: '(619) 555-0601',
    color: '#ec4899',
    x: 600,
    y: 450,
  },
  {
    id: 'lisa-tran',
    name: 'Lisa Tran',
    company: 'Fresh Coat SD',
    license: 'CSLB #1067890',
    trades: ['Painting'],
    areas: ['El Cajon', 'Santee', 'Lakeside'],
    phone: '(619) 555-0602',
    color: '#ec4899',
    x: 250,
    y: 550,
  },

  // ── Roofing ─────────────────────────────────────
  {
    id: 'sam-oconnor',
    name: "Sam O'Connor",
    company: 'Summit Roofing',
    license: 'CSLB #1078901',
    trades: ['Roofing'],
    areas: ['San Diego', 'Poway', 'Rancho Bernardo'],
    phone: '(858) 555-0701',
    color: '#ef4444',
    x: 700,
    y: 300,
  },

  // ── Landscaping ─────────────────────────────────
  {
    id: 'ray-mendez',
    name: 'Ray Mendez',
    company: 'Green Valley Landscaping',
    license: 'CLB #2023-4567',
    trades: ['Landscaping'],
    areas: ['San Diego', 'Mission Valley', 'Kearny Mesa'],
    phone: '(619) 555-0801',
    color: '#22c55e',
    x: 300,
    y: 100,
  },
  {
    id: 'rosa-garcia',
    name: 'Rosa Garcia',
    company: 'Bella Terra Gardens',
    license: 'CLB #2023-8901',
    trades: ['Landscaping'],
    areas: ['El Cajon', 'La Mesa', 'Lemon Grove'],
    phone: '(619) 555-0802',
    color: '#22c55e',
    x: 150,
    y: 600,
  },
]

// ─────────────────────────────────────────────────
// REFERRAL EDGES — directed: from → to means
// "from recommends to". 3 hubs fan out,
// contractors cross-refer each other.
// ─────────────────────────────────────────────────

export const SAMPLE_EDGES: GraphEdge[] = [
  // Eddie's direct referrals
  { from: 'eddie', to: 'carlos-vega' },
  { from: 'eddie', to: 'dave-klein' },
  { from: 'eddie', to: 'ray-mendez' },

  // Mom's referrals (some overlap with Eddie)
  { from: 'mom', to: 'dave-klein' },          // shared referral
  { from: 'mom', to: 'lisa-tran' },
  { from: 'mom', to: 'tony-park' },
  { from: 'mom', to: 'rosa-garcia' },

  // Carlos (GC) subcontractor network
  { from: 'carlos-vega', to: 'mike-torres' },
  { from: 'carlos-vega', to: 'tony-park' },   // shared with Mom
  { from: 'carlos-vega', to: 'ana-ruiz' },
  { from: 'carlos-vega', to: 'sam-oconnor' },

  // Contractor cross-referrals
  { from: 'mike-torres', to: 'jake-nguyen' }, // electrician → low voltage
  { from: 'dave-klein', to: 'tony-park' },    // plumber knows HVAC
  { from: 'ana-ruiz', to: 'rosa-garcia' },    // painter → landscaper
  { from: 'sam-oconnor', to: 'mike-torres' }, // roofer → electrician (solar)
]
