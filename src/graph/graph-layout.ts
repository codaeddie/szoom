import { Layout } from 'webcola'
import { Editor, TLShape, TLShapeId } from 'tldraw'
import { MORPH_TYPE, MorphShape } from '../morph/morph-types'

// ─────────────────────────────────────────────────
// COLA NODE/LINK TYPES
// ─────────────────────────────────────────────────

interface ColaNode {
  id: TLShapeId
  x: number
  y: number
  width: number
  height: number
}

interface ColaIdLink {
  source: TLShapeId
  target: TLShapeId
}

interface ColaNodeLink {
  source: ColaNode
  target: ColaNode
}

// ─────────────────────────────────────────────────
// GRAPH LAYOUT
//
// Modernized from Orion's GraphLayoutCollection.
// Instead of the Collection/Provider pattern (which
// depended on old tldraw APIs), this is a standalone
// class that the App directly manages.
//
// The simulation loop:
//   1. requestAnimationFrame calls step()
//   2. step() runs one webcola iteration
//   3. Cola computes new positions
//   4. We sync cola positions → tldraw shape positions
//   5. If a shape is being dragged, we reverse-sync:
//      tldraw position → cola node (user override)
// ─────────────────────────────────────────────────

export class GraphLayout {
  private editor: Editor
  private sim: Layout
  private animFrame = -1
  private nodes: Map<TLShapeId, ColaNode> = new Map()
  private links: Map<string, ColaIdLink> = new Map()
  private _active = false

  constructor(editor: Editor) {
    this.editor = editor
    this.sim = new Layout()
  }

  get active() {
    return this._active
  }

  // ── Lifecycle ───────────────────────────────────

  start() {
    if (this._active) return
    this._active = true

    // Collect all morph shapes as nodes
    const shapes = this.editor
      .getCurrentPageShapes()
      .filter((s): s is MorphShape => s.type === MORPH_TYPE)

    for (const shape of shapes) {
      this.addNode(shape)
    }

    // Collect arrows as links
    this.discoverLinks()

    // Configure and start
    this.refreshSim()

    const loop = () => {
      if (!this._active) return
      this.step()
      this.animFrame = requestAnimationFrame(loop)
    }
    loop()
  }

  stop() {
    this._active = false
    if (this.animFrame !== -1) {
      cancelAnimationFrame(this.animFrame)
      this.animFrame = -1
    }
    this.nodes.clear()
    this.links.clear()
  }

  toggle() {
    if (this._active) this.stop()
    else this.start()
  }

  // ── Node management ─────────────────────────────

  private addNode(shape: TLShape) {
    const bounds = this.editor.getShapeGeometry(shape).bounds
    const centerX = shape.x + bounds.w / 2
    const centerY = shape.y + bounds.h / 2
    this.nodes.set(shape.id, {
      id: shape.id,
      x: centerX,
      y: centerY,
      width: bounds.w,
      height: bounds.h,
    })
  }

  // ── Link discovery ──────────────────────────────
  // In tldraw v4, arrow bindings are separate records.
  // We find all arrows and check their bindings.

  private discoverLinks() {
    this.links.clear()
    const allShapes = this.editor.getCurrentPageShapes()
    const arrows = allShapes.filter((s) => s.type === 'arrow')

    for (const arrow of arrows) {
      // Get bindings FROM this arrow to other shapes
      const bindings = this.editor.getBindingsFromShape(arrow.id, 'arrow')

      let startId: TLShapeId | null = null
      let endId: TLShapeId | null = null

      for (const binding of bindings) {
        const props = binding.props as { terminal?: string }
        if (props.terminal === 'start') startId = binding.toId
        if (props.terminal === 'end') endId = binding.toId
      }

      if (startId && endId && this.nodes.has(startId) && this.nodes.has(endId)) {
        this.links.set(`${startId}-${endId}`, {
          source: startId,
          target: endId,
        })
      }
    }
  }

  // ── Simulation step ─────────────────────────────

  private step() {
    // Run one iteration of webcola
    this.sim.start(1, 0, 0, 0, true, false)

    const colaNodes = this.sim.nodes() as ColaNode[]

    for (const node of colaNodes) {
      const shape = this.editor.getShape(node.id)
      if (!shape) continue

      const bounds = this.editor.getShapeGeometry(node.id).bounds

      // Reverse-sync: if the user is dragging this shape,
      // update cola node from tldraw (user wins)
      if (this.editor.getSelectedShapeIds().includes(node.id)) {
        node.x = shape.x + bounds.w / 2
        node.y = shape.y + bounds.h / 2
      }

      // Update cola node dimensions (may have changed from phase transition)
      node.width = bounds.w
      node.height = bounds.h

      // Forward-sync: cola position → tldraw shape
      // (top-left = center - half dimensions)
      const newX = node.x - bounds.w / 2
      const newY = node.y - bounds.h / 2

      if (Math.abs(shape.x - newX) > 0.1 || Math.abs(shape.y - newY) > 0.1) {
        this.editor.updateShape({
          id: node.id,
          type: shape.type,
          x: newX,
          y: newY,
        })
      }
    }
  }

  // ── Simulation config ───────────────────────────

  refreshSim() {
    const nodesList = [...this.nodes.values()]
    const nodeIdToIndex = new Map(nodesList.map((n, i) => [n.id, i]))

    const linksList = [...this.links.values()]
      .map((l) => ({
        source: nodeIdToIndex.get(l.source),
        target: nodeIdToIndex.get(l.target),
      }))
      .filter((l) => l.source !== undefined && l.target !== undefined)

    this.sim
      .nodes(nodesList)
      // @ts-expect-error webcola types expect different format
      .links(linksList)
      .linkDistance((edge: unknown) => calcEdgeDistance(edge as ColaNodeLink))
      .avoidOverlaps(true)
      .handleDisconnected(true)
  }

  /**
   * Call after phase change to update sim with new shape dimensions.
   * The sim will then push overlapping shapes apart.
   */
  onPhaseChange() {
    if (!this._active) return

    // Update node dimensions from current shape sizes
    for (const [id, node] of this.nodes) {
      const shape = this.editor.getShape(id)
      if (!shape) continue
      const bounds = this.editor.getShapeGeometry(shape).bounds
      node.width = bounds.w
      node.height = bounds.h
    }

    this.refreshSim()
  }
}

// ─────────────────────────────────────────────────
// EDGE DISTANCE CALCULATION
// Directly from Orion's original — accounts for
// node dimensions so links have consistent gaps.
// ─────────────────────────────────────────────────

const LINK_DISTANCE = 100

function calcEdgeDistance(edge: ColaNodeLink): number {
  const dx = edge.target.x - edge.source.x
  const dy = edge.target.y - edge.source.y

  const sourceWidth = edge.source.width
  const sourceHeight = edge.source.height
  const targetWidth = edge.target.width
  const targetHeight = edge.target.height

  const horizontalGap = Math.max(0, Math.abs(dx) - (sourceWidth + targetWidth) / 2)
  const verticalGap = Math.max(0, Math.abs(dy) - (sourceHeight + targetHeight) / 2)

  const centerDist = Math.sqrt(dx * dx + dy * dy)
  const edgeDist = Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap)

  return centerDist - edgeDist + LINK_DISTANCE
}
