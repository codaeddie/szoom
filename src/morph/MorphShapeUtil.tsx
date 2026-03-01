import {
  Geometry2d,
  HTMLContainer,
  RecordProps,
  Rectangle2d,
  Circle2d,
  ShapeUtil,
  T,
  useEditor,
} from 'tldraw'
import { MORPH_TYPE, MorphShape, MorphShapeProps, MorphPhase } from './morph-types'
import { getPhaseFromLevel } from './morph-phases'
import { getDetailLevel } from '../engine/semantic-zoom'

// ─────────────────────────────────────────────────
// MORPH SHAPE UTIL
// ─────────────────────────────────────────────────

export class MorphShapeUtil extends ShapeUtil<MorphShape> {
  static override type = MORPH_TYPE

  static override props: RecordProps<MorphShape> = {
    w: T.number,
    h: T.number,
    title: T.string,
    body: T.string,
  }

  getDefaultProps(): MorphShapeProps {
    return {
      w: 200,
      h: 32,
      title: 'Untitled',
      body: 'Lorem ipsum dolor sit amet.',
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
const FONT = "'Courier New', Courier, monospace"

function MorphComponent({ shape }: { shape: MorphShape }) {
  const editor = useEditor()
  const level = getDetailLevel(editor)
  const phase = getPhaseFromLevel(level)
  const { w, h, title, body } = shape.props

  // ── Phase 0: DOT ──────────────────────────────
  if (phase === MorphPhase.Dot) {
    return (
      <HTMLContainer>
        <div
          style={{
            width: w,
            height: h,
            borderRadius: '50%',
            background: DARK_BG,
          }}
        />
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
            padding: '0 10px',
            borderRadius: '4px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            pointerEvents: 'all',
          }}
        >
          {title}
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
            padding: '16px',
            borderRadius: '8px',
            overflow: 'hidden',
            pointerEvents: 'all',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: '11px',
              lineHeight: '1.5',
              overflow: 'hidden',
              color: TEXT_SECONDARY,
            }}
          >
            {body}
          </div>
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
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
          {title}
        </h2>
        <div style={{ fontSize: '13px', lineHeight: '1.7', color: TEXT_SECONDARY }}>
          {body}
        </div>
      </div>
    </HTMLContainer>
  )
}
