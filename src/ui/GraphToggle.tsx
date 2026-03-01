import { track } from 'tldraw'

// ─────────────────────────────────────────────────
// GRAPH TOGGLE
//
// Top-center "Graph" button matching Orion's demo.
// Toggles the force-directed layout on/off.
// ─────────────────────────────────────────────────

interface GraphToggleProps {
  active: boolean
  onToggle: () => void
}

export const GraphToggle = track(function GraphToggle({ active, onToggle }: GraphToggleProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          background: active ? '#4ade80' : '#1a1a2e',
          color: active ? '#1a1a2e' : '#e0e0e0',
          border: 'none',
          borderRadius: 6,
          padding: '6px 16px',
          fontFamily: "var(--tl-font-sans, 'Inter', 'Helvetica', 'Arial', sans-serif)",
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        Graph
      </button>
    </div>
  )
})
