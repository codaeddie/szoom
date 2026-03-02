// ─────────────────────────────────────────────────
// MORPH TOOL — ProNet Contractor Card Placement
//
// Custom tool for placing contractor card shapes on
// the canvas. Click-to-place pattern (StickerTool),
// no drag-to-resize since morph shapes are sized by
// the semantic zoom slider.
//
// Keyboard shortcut: M
// ─────────────────────────────────────────────────

import { StateNode, createShapeId } from 'tldraw'
import { MORPH_TYPE, DEFAULT_TRADE_COLOR } from './morph-types'
import { getPhaseConfig } from './morph-phases'
import { getDetailLevel } from '../engine/semantic-zoom'

export class MorphTool extends StateNode {
  static override id = 'morph'

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onPointerDown() {
    const point = this.editor.inputs.getCurrentPagePoint()
    const level = getDetailLevel(this.editor)
    const config = getPhaseConfig(level)
    const id = createShapeId()

    this.editor.markHistoryStoppingPoint(`creating_morph:${id}`)
    this.editor.createShape({
      id,
      type: MORPH_TYPE,
      x: point.x - config.w / 2,
      y: point.y - config.h / 2,
      props: {
        w: config.w,
        h: config.h,
        name: 'New Contractor',
        company: '',
        license: '',
        trades: [],
        areas: [],
        phone: '',
        color: DEFAULT_TRADE_COLOR,
      },
    })
    this.editor.select(id)

    if (this.editor.getInstanceState().isToolLocked) {
      // Tool lock active — stay in morph tool
    } else {
      this.editor.setCurrentTool('select')
    }
  }

  override onCancel() {
    this.editor.setCurrentTool('select')
  }
}
