import { track, useEditor } from 'tldraw'
import { getDetailLevel, setDetailLevel } from '../engine/semantic-zoom'
import { DETAIL_PRESETS } from '../morph/morph-phases'

// ─────────────────────────────────────────────────
// DETAIL SLIDER
//
// Bottom-right controller matching Orion's demo.
// Shows current value (0.00–1.00) + colored bars
// + range input + clickable presets.
// ─────────────────────────────────────────────────

interface DetailSliderProps {
  onLevelChange?: (level: number) => void
}

export const DetailSlider = track(function DetailSlider({ onLevelChange }: DetailSliderProps) {
  const editor = useEditor()
  const level = getDetailLevel(editor)

  const handleChange = (newLevel: number) => {
    setDetailLevel(editor, newLevel)
    onLevelChange?.(newLevel)
  }

  // Bar colors matching Orion's demo
  const bars = [
    { threshold: 0.0, color: '#4ade80' },  // green
    { threshold: 0.33, color: '#facc15' }, // yellow
    { threshold: 0.66, color: '#f97316' }, // orange
    { threshold: 0.9, color: '#ef4444' },  // red
  ]

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        right: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#1a1a2e',
        padding: '6px 14px',
        borderRadius: 8,
        fontFamily: 'var(--tl-font-mono)',
        fontSize: 14,
        color: '#e0e0e0',
        zIndex: 99999,
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        userSelect: 'none',
        pointerEvents: 'all',
      }}
    >
      {/* Current value display */}
      <span style={{ fontWeight: 700, minWidth: 36 }}>
        {level.toFixed(2)}
      </span>

      {/* Color bars */}
      <div style={{ display: 'flex', gap: 3 }}>
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 16,
              borderRadius: 1,
              background: level >= bar.threshold ? bar.color : '#333',
              transition: 'background 0.1s',
            }}
          />
        ))}
      </div>

      {/* Range slider */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={level}
        onChange={(e) => handleChange(parseFloat(e.target.value))}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ width: 100, accentColor: '#4ade80', cursor: 'pointer' }}
      />
    </div>
  )
})
