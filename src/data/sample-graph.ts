// ─────────────────────────────────────────────────
// FAMILY TREE SAMPLE DATA
//
// 12 nodes from coda-family-tree.mermaid + directed
// edges showing grandparent→parent→child connections.
//
// Colors: Makdesi red (#ff1919), Coda blue (#2196F3),
// Main family purple (#9C27B0), Sarmad red (#D50000),
// Rami green (#00C853).
//
// Initial positions spread across canvas before
// force-directed layout takes over.
// ─────────────────────────────────────────────────

import { GraphNode, GraphEdge } from '../morph/morph-types'

export const SAMPLE_NODES: GraphNode[] = [
  {
    id: 'gp-makdesi',
    name: 'Gido Poulus',
    role: 'Grandfather',
    info: 'Makdesi Family',
    bio: 'Patriarch of the Makdesi family. Father of Besma, Sarmad, Mazen, Nithal, Moiad, Khalid, Nisreen, and Nawal. A life built on family, faith, and perseverance through generations.',
    color: '#ff1919',
    x: 100,
    y: 50,
  },
  {
    id: 'gn-makdesi',
    name: 'Nana Mary',
    role: 'Grandmother',
    info: 'Makdesi Family',
    bio: 'Matriarch of the Makdesi family. Mother of eight children. The heart and soul of every family gathering, keeper of traditions and recipes passed down through generations.',
    color: '#ff1919',
    x: 300,
    y: 50,
  },
  {
    id: 'gp-coda',
    name: 'Gido Edmond',
    role: 'Grandfather',
    info: 'Coda Family',
    bio: 'Patriarch of the Coda family. Father of Rawayda, Rita, Ronda, Rafa, Rami, Raymond, Rafael, and Riath. Built a legacy that spans continents and generations.',
    color: '#2196F3',
    x: 600,
    y: 50,
  },
  {
    id: 'gn-coda',
    name: 'Nana Salha',
    role: 'Grandmother',
    info: 'Coda Family',
    bio: 'Matriarch of the Coda family. Mother of eight children. Known for her warmth, generosity, and the way she held the entire family together across distances.',
    color: '#2196F3',
    x: 800,
    y: 50,
  },
  {
    id: 'besma',
    name: 'Besma',
    role: 'Mother',
    info: 'Makdesi & Coda Family',
    bio: 'Daughter of Gido Poulus and Nana Mary Makdesi. Wife of Riath Coda. Mother of Eddie, Ares, and Nora. The bridge between the Makdesi and Coda families.',
    color: '#9C27B0',
    x: 350,
    y: 200,
  },
  {
    id: 'riath',
    name: 'Riath',
    role: 'Father',
    info: 'Makdesi & Coda Family',
    bio: 'Son of Gido Edmond and Nana Salha Coda. Husband of Besma Makdesi. Father of Eddie, Ares, and Nora. Carries forward the Coda family name and traditions.',
    color: '#9C27B0',
    x: 550,
    y: 200,
  },
  {
    id: 'eddie',
    name: 'Eddie',
    role: 'Son',
    info: 'Makdesi & Coda Family',
    bio: 'Son of Besma and Riath. The eldest of three siblings. Builder of family trees and semantic zoom engines. Carries both the Makdesi and Coda bloodlines.',
    color: '#9C27B0',
    x: 350,
    y: 380,
  },
  {
    id: 'ares',
    name: 'Ares',
    role: 'Son',
    info: 'Makdesi & Coda Family',
    bio: 'Son of Besma and Riath. Middle child of three. Named with strength and purpose, bridging two family traditions into something new.',
    color: '#9C27B0',
    x: 500,
    y: 380,
  },
  {
    id: 'nora',
    name: 'Nora',
    role: 'Daughter',
    info: 'Makdesi & Coda Family',
    bio: 'Daughter of Besma and Riath. The youngest of three siblings. Carries the light of both families forward with grace.',
    color: '#9C27B0',
    x: 650,
    y: 380,
  },
  {
    id: 'sarmad',
    name: 'Sarmad',
    role: 'Uncle',
    info: 'Makdesi Family',
    bio: 'Son of Gido Poulus and Nana Mary. Husband of Saba Makdesi. Father of Brandon, Ryan, and Emma. Brother of Besma.',
    color: '#D50000',
    x: 100,
    y: 200,
  },
  {
    id: 'mazen',
    name: 'Mazen',
    role: 'Uncle',
    info: 'Makdesi Family',
    bio: 'Son of Gido Poulus and Nana Mary. Husband of Linda Makdesi. Father of Gina, Marianne, Angela, and Luke. Brother of Besma.',
    color: '#ff1919',
    x: 100,
    y: 350,
  },
  {
    id: 'rami',
    name: 'Rami',
    role: 'Uncle',
    info: 'Coda Family',
    bio: 'Son of Gido Edmond and Nana Salha. Husband of Rasha Coda. Father of Anna and Angelina. Brother of Riath.',
    color: '#00C853',
    x: 800,
    y: 200,
  },
]

// ─────────────────────────────────────────────────
// EDGES — directed arrows showing family connections
//
// grandparent → parent, parent → child
// ─────────────────────────────────────────────────

export const SAMPLE_EDGES: GraphEdge[] = [
  // Makdesi grandparents → their children
  { from: 'gp-makdesi', to: 'besma' },
  { from: 'gn-makdesi', to: 'besma' },
  { from: 'gp-makdesi', to: 'sarmad' },
  { from: 'gn-makdesi', to: 'sarmad' },
  { from: 'gp-makdesi', to: 'mazen' },
  { from: 'gn-makdesi', to: 'mazen' },

  // Coda grandparents → their children
  { from: 'gp-coda', to: 'riath' },
  { from: 'gn-coda', to: 'riath' },
  { from: 'gp-coda', to: 'rami' },
  { from: 'gn-coda', to: 'rami' },

  // Parents → children
  { from: 'besma', to: 'eddie' },
  { from: 'besma', to: 'ares' },
  { from: 'besma', to: 'nora' },
  { from: 'riath', to: 'eddie' },
  { from: 'riath', to: 'ares' },
  { from: 'riath', to: 'nora' },
]
