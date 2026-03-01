import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Editor,
  Tldraw,
  TLComponents,
  createShapeId,
  DefaultToolbar,
  DefaultToolbarContent,
  TldrawUiMenuToolItem,
  useTools,
  useValue,
  useEditor,
} from 'tldraw'
import 'tldraw/tldraw.css'

import { MorphShapeUtil } from './morph/MorphShapeUtil'
import { MorphTool } from './morph/MorphTool'
import { MORPH_TYPE } from './morph/morph-types'
import { setDetailLevel } from './engine/semantic-zoom'
import { GraphLayout } from './graph/graph-layout'
import { DetailSlider } from './ui/DetailSlider'
import { GraphToggle } from './ui/GraphToggle'
import { uiOverrides } from './ui/ui-overrides'
import { SAMPLE_NODES, SAMPLE_EDGES } from './data/sample-graph'

// ─────────────────────────────────────────────────
// CUSTOM SHAPE UTILS
// ─────────────────────────────────────────────────

const customShapeUtils = [MorphShapeUtil]
const customTools = [MorphTool]

function MorphToolbarItem() {
  const tools = useTools()
  const editor = useEditor()
  const isSelected = useValue(
    'is morph selected',
    () => editor.getCurrentToolId() === 'morph',
    [editor]
  )
  return <TldrawUiMenuToolItem toolId="morph" isSelected={isSelected} />
}

function CustomToolbar() {
  return (
    <DefaultToolbar>
      <DefaultToolbarContent />
      <MorphToolbarItem />
    </DefaultToolbar>
  )
}

// ─────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────

export default function App() {
  const graphRef = useRef<GraphLayout | null>(null)
  const [graphActive, setGraphActive] = useState(false)
  const editorRef = useRef<Editor | null>(null)

  // Handle graph toggle (from button or G key)
  const handleGraphToggle = useCallback(() => {
    const graph = graphRef.current
    if (!graph) return
    graph.toggle()
    setGraphActive(graph.active)
  }, [])

  // Listen for keyboard shortcut event
  useEffect(() => {
    const handler = () => handleGraphToggle()
    window.addEventListener('szoom:toggle-graph', handler)
    return () => window.removeEventListener('szoom:toggle-graph', handler)
  }, [handleGraphToggle])

  // Notify graph layout when phase changes
  const handleLevelChange = useCallback(() => {
    graphRef.current?.onPhaseChange()
  }, [])

  // ── Components overlay ──────────────────────────

  const components: TLComponents = {
    Toolbar: CustomToolbar,
    InFrontOfTheCanvas: () => (
      <>
        <GraphToggle active={graphActive} onToggle={handleGraphToggle} />
        <DetailSlider onLevelChange={handleLevelChange} />
      </>
    ),
  }

  // ── Mount handler ───────────────────────────────

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor

    // Clear stale persisted shapes (old schema had title/body, new has name/role/etc)
    const existing = editor.getCurrentPageShapes()
    if (existing.length > 0) {
      editor.deleteShapes(existing.map((s) => s.id))
    }

    // Create the graph layout manager
    graphRef.current = new GraphLayout(editor)

    // Create morph shapes for each node
    const shapeCreations = SAMPLE_NODES.map((node) => ({
      id: createShapeId(node.id),
      type: MORPH_TYPE as const,
      x: node.x,
      y: node.y,
      props: {
        w: 200,
        h: 32,
        name: node.name,
        role: node.role,
        info: node.info,
        bio: node.bio,
        avatarUrl: '',
        color: node.color,
      },
    }))

    editor.createShapes(shapeCreations)

    // Create arrow bindings between shapes
    for (const edge of SAMPLE_EDGES) {
      const fromShapeId = createShapeId(edge.from)
      const toShapeId = createShapeId(edge.to)
      const arrowId = createShapeId(`arrow-${edge.from}-${edge.to}`)

      // Create the arrow shape
      editor.createShape({
        id: arrowId,
        type: 'arrow',
        props: {
          color: 'black',
          size: 's',
        },
      })

      // Bind arrow start → source shape
      editor.createBinding({
        type: 'arrow',
        fromId: arrowId,
        toId: fromShapeId,
        props: {
          terminal: 'start',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      })

      // Bind arrow end → target shape
      editor.createBinding({
        type: 'arrow',
        fromId: arrowId,
        toId: toShapeId,
        props: {
          terminal: 'end',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      })
    }

    // Set initial detail level (Label phase)
    setDetailLevel(editor, 0.2)

    // Zoom to fit and lock camera at ~73%
    editor.zoomToFit({ animation: { duration: 300 } })

    // Auto-start graph layout
    setTimeout(() => {
      graphRef.current?.start()
      setGraphActive(true)
    }, 100)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    }}>
      <Tldraw
        shapeUtils={customShapeUtils}
        tools={customTools}
        components={components}
        overrides={uiOverrides}
        onMount={handleMount}
        persistenceKey="szoom"
      />
    </div>
  )
}
