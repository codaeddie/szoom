// ─────────────────────────────────────────────────
// MORPH SHAPE UTIL — Person Card
//
// Custom ShapeUtil that renders person cards across
// 4 discrete semantic zoom phases:
//   Dot:      colored initials circle (30x30)
//   Label:    initials + name (200x32)
//   Card:     initials + name + role + info (400x300)
//   Document: full profile with bio (800x600)
//
// Editing: Card + Document phases support double-click
// editing via tldraw's canEdit() pattern.
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
  useValue,
} from 'tldraw'
import { MORPH_TYPE, MorphShape, MorphShapeProps, MorphPhase } from './morph-types'
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
    role: T.string,
    info: T.string,
    bio: T.string,
    avatarUrl: T.string,
    color: T.string,
  }

  getDefaultProps(): MorphShapeProps {
    return {
      w: 200,
      h: 32,
      name: 'Untitled',
      role: '',
      info: '',
      bio: '',
      avatarUrl: '',
      color: '#4ade80',
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
// INITIALS CIRCLE
//
// Renders first letter of name on a colored circle.
// Used at every phase with different sizes:
//   Dot: fills entire 30x30 shape
//   Label: 24px inline before name
//   Card: 48px in header row
//   Document: 80px large header
// ─────────────────────────────────────────────────

function Initials({ name, color, size }: { name: string; color: string; size: number }) {
  const letter = name.charAt(0).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, fontWeight: 700, flexShrink: 0,
    }}>
      {letter}
    </div>
  )
}

// ─────────────────────────────────────────────────
// MORPH COMPONENT — Discrete phase rendering
//
// No fading, no interpolation between phases.
// Each phase is a completely different render.
// "morphing or transitions beautifully jump
//  to the next state (not continuous fade)"
// ─────────────────────────────────────────────────

const DARK_BG = '#1a1a2e'
const TEXT_PRIMARY = '#e0e0e0'
const TEXT_SECONDARY = '#b0b0b0'
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"

function MorphComponent({ shape }: { shape: MorphShape }) {
  const editor = useEditor()
  const level = getDetailLevel(editor)
  const phase = getPhaseFromLevel(level)
  const { w, h, name, role, info, bio, color } = shape.props

  const isEditing = useValue(
    'is editing',
    () => editor.getEditingShapeId() === shape.id,
    [editor, shape.id]
  )

  // ── Phase 0: DOT ──────────────────────────────
  if (phase === MorphPhase.Dot) {
    return (
      <HTMLContainer>
        <div style={{ width: w, height: h, pointerEvents: 'all' }}>
          <Initials name={name} color={color} size={w} />
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
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 10px',
            borderRadius: '4px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            pointerEvents: 'all',
          }}
        >
          <Initials name={name} color={color} size={24} />
          {name}
        </div>
      </HTMLContainer>
    )
  }

  // ── Phase 2: CARD ─────────────────────────────
  if (phase === MorphPhase.Card) {
    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            background: DARK_BG,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            padding: '20px',
            borderRadius: '8px',
            overflow: 'hidden',
            pointerEvents: isEditing ? 'all' : 'all',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          onPointerDown={isEditing ? (e) => e.stopPropagation() : undefined}
        >
          {/* Header: initials + name/role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Initials name={name} color={color} size={48} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              {isEditing ? (
                <>
                  <input
                    value={name}
                    onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { name: e.target.value } })}
                    style={{ ...inputStyle, fontSize: '16px', fontWeight: 700 }}
                    placeholder="Name"
                  />
                  <input
                    value={role}
                    onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { role: e.target.value } })}
                    style={{ ...inputStyle, fontSize: '12px', color: TEXT_SECONDARY }}
                    placeholder="Role"
                  />
                </>
              ) : (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </div>
                  {role && (
                    <div style={{ fontSize: '12px', color: TEXT_SECONDARY }}>
                      {role}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Info */}
          {isEditing ? (
            <input
              value={info}
              onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { info: e.target.value } })}
              style={{ ...inputStyle, fontSize: '13px', color: TEXT_SECONDARY }}
              placeholder="Info"
            />
          ) : (
            info && (
              <div style={{ fontSize: '13px', color: TEXT_SECONDARY, lineHeight: '1.5' }}>
                {info}
              </div>
            )
          )}
        </div>
      </HTMLContainer>
    )
  }

  // ── Phase 3: DOCUMENT ─────────────────────────
  return (
    <HTMLContainer>
      <div
        style={{
          width: w,
          height: h,
          background: DARK_BG,
          color: TEXT_PRIMARY,
          fontFamily: FONT,
          padding: '32px',
          borderRadius: '8px',
          overflow: 'auto',
          pointerEvents: 'all',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onPointerDown={isEditing ? (e) => e.stopPropagation() : undefined}
      >
        {/* Header: large initials + name/role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <Initials name={name} color={color} size={80} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            {isEditing ? (
              <>
                <input
                  value={name}
                  onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { name: e.target.value } })}
                  style={{ ...inputStyle, fontSize: '22px', fontWeight: 700 }}
                  placeholder="Name"
                />
                <input
                  value={role}
                  onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { role: e.target.value } })}
                  style={{ ...inputStyle, fontSize: '14px', color: TEXT_SECONDARY }}
                  placeholder="Role"
                />
              </>
            ) : (
              <>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>{name}</div>
                {role && <div style={{ fontSize: '14px', color: TEXT_SECONDARY }}>{role}</div>}
              </>
            )}
          </div>
        </div>

        {/* Info */}
        {isEditing ? (
          <input
            value={info}
            onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { info: e.target.value } })}
            style={{ ...inputStyle, fontSize: '14px', color: TEXT_SECONDARY }}
            placeholder="Info"
          />
        ) : (
          info && (
            <div style={{ fontSize: '14px', color: TEXT_SECONDARY, lineHeight: '1.5' }}>
              {info}
            </div>
          )
        )}

        {/* Bio */}
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => editor.updateShape({ id: shape.id, type: MORPH_TYPE, props: { bio: e.target.value } })}
            style={{
              ...inputStyle,
              fontSize: '13px',
              lineHeight: '1.7',
              color: TEXT_SECONDARY,
              flex: 1,
              resize: 'none',
            }}
            placeholder="Bio"
          />
        ) : (
          bio && (
            <div style={{ fontSize: '13px', lineHeight: '1.7', color: TEXT_SECONDARY }}>
              {bio}
            </div>
          )
        )}
      </div>
    </HTMLContainer>
  )
}

// ─────────────────────────────────────────────────
// SHARED INPUT STYLES
// ─────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '4px',
  padding: '4px 8px',
  color: TEXT_PRIMARY,
  fontFamily: FONT,
  outline: 'none',
  width: '100%',
}
