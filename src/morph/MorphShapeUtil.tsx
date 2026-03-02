// ─────────────────────────────────────────────────
// MORPH SHAPE UTIL — ProNet Contractor Cards
//
// Custom ShapeUtil rendering contractor business cards
// across 4 discrete semantic zoom phases:
//   Phase 0 (Dot):     Trade-colored initial circle
//   Phase 1 (Label):   Name + company strip with accent bar
//   Phase 2 (Card):    Business card with trades/areas/license
//   Phase 3 (Document): Full profile with tel: link + editing
//
// Patterns from tldraw examples:
//   - HTMLContainer as root wrapper (custom-shape example)
//   - pointerEvents + stopPropagation (interactive-shape)
//   - canEdit + isEditing conditional (editable-shape)
//   - track() wrapper for signal reads (workflow starter kit)
// ─────────────────────────────────────────────────

import {
  Geometry2d,
  HTMLContainer,
  RecordProps,
  Rectangle2d,
  Circle2d,
  ShapeUtil,
  T,
  useEditor,
  track,
} from 'tldraw'
import { MORPH_TYPE, MorphShape, MorphShapeProps, MorphPhase, getTradeColor } from './morph-types'
import { getPhaseFromLevel } from './morph-phases'
import { getDetailLevel } from '../engine/semantic-zoom'

// ─────────────────────────────────────────────────
// SHAPE UTIL CLASS
// ─────────────────────────────────────────────────

export class MorphShapeUtil extends ShapeUtil<MorphShape> {
  static override type = MORPH_TYPE

  static override props: RecordProps<MorphShape> = {
    w: T.number,
    h: T.number,
    name: T.string,
    company: T.string,
    license: T.string,
    trades: T.arrayOf(T.string),
    areas: T.arrayOf(T.string),
    phone: T.string,
    color: T.string,
  }

  getDefaultProps(): MorphShapeProps {
    return {
      w: 240,
      h: 32,
      name: 'New Contractor',
      company: '',
      license: '',
      trades: [],
      areas: [],
      phone: '',
      color: '#6b7280',
    }
  }

  override canEdit() {
    const level = getDetailLevel(this.editor)
    return getPhaseFromLevel(level) >= MorphPhase.Card
  }

  override canResize() {
    return false // size is driven by the semantic zoom engine
  }

  override isAspectRatioLocked() {
    return false
  }

  getGeometry(shape: MorphShape): Geometry2d {
    const level = getDetailLevel(this.editor)
    const phase = getPhaseFromLevel(level)

    if (phase === MorphPhase.Dot) {
      return new Circle2d({
        radius: shape.props.w / 2,
        isFilled: true,
      })
    }

    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  component(shape: MorphShape) {
    return <MorphComponent shape={shape} />
  }

  indicator(shape: MorphShape) {
    const level = getDetailLevel(this.editor)
    const phase = getPhaseFromLevel(level)

    if (phase === MorphPhase.Dot) {
      const r = shape.props.w / 2
      return <circle cx={r} cy={r} r={r} />
    }

    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={phase === MorphPhase.Label ? 4 : 8}
      />
    )
  }
}

// ─────────────────────────────────────────────────
// STYLE CONSTANTS
// ─────────────────────────────────────────────────

const DARK_BG = '#1a1a2e'
const TEXT_PRIMARY = '#e0e0e0'
const TEXT_SECONDARY = '#b0b0b0'
const TEXT_MUTED = '#707070'
const FONT_SANS = 'var(--tl-font-sans)'
const FONT_MONO = 'var(--tl-font-mono)'

// ─────────────────────────────────────────────────
// MORPH COMPONENT — Wrapped in track() to capture
// signal reads (getEditingShapeId, getDetailLevel).
// See CLAUDE.md "Key Learnings" section.
// ─────────────────────────────────────────────────

const MorphComponent = track(function MorphComponent({ shape }: { shape: MorphShape }) {
  const editor = useEditor()
  const level = getDetailLevel(editor)
  const phase = getPhaseFromLevel(level)
  const isEditing = editor.getEditingShapeId() === shape.id
  const { w, h } = shape.props

  // ── Phase 0: DOT ──────────────────────────────
  if (phase === MorphPhase.Dot) {
    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            borderRadius: '50%',
            background: shape.props.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: FONT_SANS,
          }}
        >
          {shape.props.name.charAt(0).toUpperCase()}
        </div>
      </HTMLContainer>
    )
  }

  // ── Phase 1: LABEL ────────────────────────────
  if (phase === MorphPhase.Label) {
    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            background: DARK_BG,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            pointerEvents: 'all',
          }}
        >
          {/* Trade color accent bar */}
          <div
            style={{
              width: 4,
              height: '100%',
              background: shape.props.color,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              color: TEXT_PRIMARY,
              fontFamily: FONT_SANS,
              fontSize: '13px',
              fontWeight: 700,
              padding: '0 10px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {shape.props.name}
            {shape.props.company && (
              <span style={{ color: TEXT_SECONDARY, fontWeight: 400 }}>
                {' — '}{shape.props.company}
              </span>
            )}
          </div>
        </div>
      </HTMLContainer>
    )
  }

  // ── Phase 2: CARD (Business Card) ─────────────
  if (phase === MorphPhase.Card) {
    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            background: DARK_BG,
            borderRadius: '8px',
            overflow: 'hidden',
            pointerEvents: 'all',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: FONT_SANS,
          }}
        >
          {/* Trade-colored header bar */}
          <div
            style={{
              background: shape.props.color,
              padding: '8px 12px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
              {shape.props.name}
            </div>
            {shape.props.company && (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                {shape.props.company}
              </div>
            )}
          </div>
          {/* Body */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Trade pills */}
            {shape.props.trades.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {shape.props.trades.map((trade) => {
                  const tc = getTradeColor(trade)
                  return (
                    <span
                      key={trade}
                      style={{
                        background: `${tc}33`,
                        color: tc,
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {trade}
                    </span>
                  )
                })}
              </div>
            )}
            {/* Areas */}
            {shape.props.areas.length > 0 && (
              <div style={{ fontSize: '11px', color: TEXT_SECONDARY }}>
                {shape.props.areas.join(' · ')}
              </div>
            )}
            {/* License */}
            {shape.props.license && (
              <div style={{ fontSize: '10px', color: TEXT_MUTED }}>
                Lic: {shape.props.license}
              </div>
            )}
          </div>
        </div>
      </HTMLContainer>
    )
  }

  // ── Phase 3: FULL PROFILE ─────────────────────
  return (
    <HTMLContainer>
      <div
        style={{
          width: w,
          height: h,
          background: DARK_BG,
          borderRadius: '8px',
          overflow: 'hidden',
          pointerEvents: 'all',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: FONT_SANS,
        }}
      >
        {/* Trade-colored header */}
        <div
          style={{
            background: shape.props.color,
            padding: '12px 16px',
            flexShrink: 0,
          }}
        >
          {isEditing ? (
            <EditableInput
              value={shape.props.name}
              onChange={(val) =>
                editor.updateShapes([{ id: shape.id, type: MORPH_TYPE, props: { name: val } }])
              }
              style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}
            />
          ) : (
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              {shape.props.name}
            </div>
          )}
          {isEditing ? (
            <EditableInput
              value={shape.props.company}
              placeholder="Company"
              onChange={(val) =>
                editor.updateShapes([{ id: shape.id, type: MORPH_TYPE, props: { company: val } }])
              }
              style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}
            />
          ) : (
            shape.props.company && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                {shape.props.company}
              </div>
            )
          )}
        </div>

        {/* Body content */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto' }}>
          {/* Phone row — tappable tel: link (interactive-shape pattern) */}
          {(shape.props.phone || isEditing) && (
            <div>
              {isEditing ? (
                <EditableInput
                  value={shape.props.phone}
                  placeholder="Phone number"
                  onChange={(val) =>
                    editor.updateShapes([{ id: shape.id, type: MORPH_TYPE, props: { phone: val } }])
                  }
                  style={{ fontSize: '16px', fontWeight: 600, color: '#60a5fa' }}
                />
              ) : (
                <a
                  href={`tel:${shape.props.phone.replace(/[^0-9+]/g, '')}`}
                  style={{
                    pointerEvents: 'all',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '44px',
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: FONT_MONO,
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  {shape.props.phone}
                </a>
              )}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

          {/* Trade pills */}
          {(shape.props.trades.length > 0 || isEditing) && (
            isEditing ? (
              <EditableInput
                value={shape.props.trades.join(', ')}
                placeholder="Trades (comma-separated)"
                onChange={(val) =>
                  editor.updateShapes([{
                    id: shape.id,
                    type: MORPH_TYPE,
                    props: { trades: val.split(',').map((s) => s.trim()).filter(Boolean) },
                  }])
                }
                style={{ fontSize: '11px', color: TEXT_SECONDARY }}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {shape.props.trades.map((trade) => {
                  const tc = getTradeColor(trade)
                  return (
                    <span
                      key={trade}
                      style={{
                        background: `${tc}33`,
                        color: tc,
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 10px',
                        borderRadius: '10px',
                      }}
                    >
                      {trade}
                    </span>
                  )
                })}
              </div>
            )
          )}

          {/* Areas */}
          {(shape.props.areas.length > 0 || isEditing) && (
            isEditing ? (
              <EditableInput
                value={shape.props.areas.join(', ')}
                placeholder="Areas (comma-separated)"
                onChange={(val) =>
                  editor.updateShapes([{
                    id: shape.id,
                    type: MORPH_TYPE,
                    props: { areas: val.split(',').map((s) => s.trim()).filter(Boolean) },
                  }])
                }
                style={{ fontSize: '11px', color: TEXT_SECONDARY }}
              />
            ) : (
              <div style={{ fontSize: '12px', color: TEXT_SECONDARY }}>
                {shape.props.areas.join(' · ')}
              </div>
            )
          )}

          {/* License */}
          {(shape.props.license || isEditing) && (
            isEditing ? (
              <EditableInput
                value={shape.props.license}
                placeholder="License number"
                onChange={(val) =>
                  editor.updateShapes([{ id: shape.id, type: MORPH_TYPE, props: { license: val } }])
                }
                style={{ fontSize: '11px', color: TEXT_MUTED }}
              />
            ) : (
              <div style={{ fontSize: '11px', color: TEXT_MUTED }}>
                Lic: {shape.props.license}
              </div>
            )
          )}
        </div>
      </div>
    </HTMLContainer>
  )
})

// ─────────────────────────────────────────────────
// EDITABLE INPUT — Inline input for edit mode.
// Uses stopPropagation per interactive-shape example
// to prevent tldraw from intercepting pointer events.
// ─────────────────────────────────────────────────

function EditableInput({
  value,
  placeholder,
  onChange,
  style,
}: {
  value: string
  placeholder?: string
  onChange: (val: string) => void
  style?: React.CSSProperties
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.currentTarget.value)}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        pointerEvents: 'all',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '4px',
        padding: '4px 8px',
        fontFamily: FONT_SANS,
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        ...style,
      }}
    />
  )
}
