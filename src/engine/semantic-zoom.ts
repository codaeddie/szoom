import { Editor } from 'tldraw'
import { MORPH_TYPE, MorphShape, DETAIL_LEVEL_KEY } from '../morph/morph-types'
import { getPhaseConfig, getPhaseFromLevel } from '../morph/morph-phases'

// ─────────────────────────────────────────────────
// DETAIL LEVEL — Global state via documentSettings.meta
//
// Using document meta because:
//   1. It's reactive (signals-based — components re-render)
//   2. It persists across sessions
//   3. All shapes can read it via editor ref
// ─────────────────────────────────────────────────

export function getDetailLevel(editor: Editor): number {
  const doc = editor.getDocumentSettings()
  return (doc.meta?.[DETAIL_LEVEL_KEY] as number) ?? 0.2
}

export function setDetailLevel(editor: Editor, level: number) {
  const clamped = Math.max(0, Math.min(1, level))

  editor.updateDocumentSettings({
    meta: {
      ...editor.getDocumentSettings().meta,
      [DETAIL_LEVEL_KEY]: clamped,
    },
  })

  // Snap all morph shapes to the new phase dimensions
  applyPhaseToAllShapes(editor, clamped)
}

// ─────────────────────────────────────────────────
// PHASE APPLICATION
//
// When the detail level changes, every morph shape
// snaps to the new phase dimensions. The webcola
// simulation will then push them apart as needed
// (avoidOverlaps handles the spreading).
//
// We update w/h on the shape props. The force layout
// picks up the new dimensions on its next step().
// ─────────────────────────────────────────────────

export function applyPhaseToAllShapes(editor: Editor, level: number) {
  const config = getPhaseConfig(level)
  const shapes = editor
    .getCurrentPageShapes()
    .filter((s): s is MorphShape => s.type === MORPH_TYPE)

  if (shapes.length === 0) return

  const updates = shapes.map((shape) => ({
    id: shape.id,
    type: MORPH_TYPE as const,
    props: {
      w: config.w,
      h: config.h,
    },
  }))

  editor.updateShapes(updates)
}
