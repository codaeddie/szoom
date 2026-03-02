<!--
  PRONET SPEC
  ────────────────────────────
  This file is the build scaffold for the pronet theme branch.

  PRINCIPLES:

    1. Checkboxes must reflect ACTUAL state — never mark done until verified running.
    2. When a planned file is skipped or replaced by a different approach, NOTE IT explicitly.
    3. Keep the scaffold section in sync with reality.
    4. Bug fixes and UI tweaks go in the "Resolved Issues" section with date.
    5. Backlog items go in the "Backlog" section with context.
    6. This doc is for agents AND humans. Write concisely but don't assume context.
       -->

## ProNet — Contractor Relationship Map

#### Vision

A semantic zoom graph where each node is a contractor/tradesperson in your network. Your mom needs a plumber — she opens the graph, zooms in, taps to call. A GC wants to see if you know an electrician — same graph, different cluster.

The cards work like a business card:
- **Name + Company** at top = identity (who is this)
- **License number** = legitimacy (they're real, look them up)
- **Trades** = capability (what they do, specifically)
- **Areas** = relevance (do they work near me)
- **Phone** = action (tap to call, done)

Edges = referral relationships. "I'd recommend this person."

---

#### Semantic Zoom Engine (inherited from main — DO NOT MODIFY)

The core pipeline is data-agnostic. These files define HOW shapes morph, not WHAT they show:

| File | Role | Why untouched |
|------|------|---------------|
| `src/engine/semantic-zoom.ts` | Reads global detail level, determines phase, batch-updates `w` and `h` on all morph shapes | Only touches geometry |
| `src/morph/morph-phases.ts` | Phase dimension definitions (dot=30×30, label=?×32, card=?×?, full=?×?) | Only defines sizes |
| `src/graph/graph-layout.ts` | Webcola force-directed simulation — `avoidOverlaps(true)` pushes nodes apart as they grow | Only reads shape bounds |
| `src/ui/DetailSlider.tsx` | Bottom-right slider (0.00 → 1.00) drives phase transitions | UI control only |
| `src/ui/GraphToggle.tsx` | Top-center "Graph" button / G key toggles force layout | UI control only |
| `src/ui/ui-overrides.ts` | Keyboard shortcuts (G=graph, M=morph tool) | Shortcut wiring only |

**Key behaviors preserved:**
- 4 discrete phase snaps at thresholds: 0.20 / 0.80 / 1.00 (no gradual fade)
- Webcola `avoidOverlaps(true)` + `handleDisconnected(true)` — organic spreading as cards grow
- `requestAnimationFrame` loop syncs cola positions → tldraw shapes
- Dragging overrides sim (selected shape position feeds back into cola node)
- Camera stays locked at 73% during morphs
- Arrows auto-track through all phase transitions via tldraw bindings

---

#### DAG / Force-Directed Graph (inherited from main — DO NOT MODIFY)

The graph layer uses webcola for constraint-based force-directed layout:

```ts
// Core cola configuration (from graph-layout.ts)
this.graphSim
  .nodes(nodes)
  .links(links)
  .constraints(constraints)
  .linkDistance((edge) => calcEdgeDistance(edge))
  .avoidOverlaps(true)
  .handleDisconnected(true)
```

**Integration with semantic zoom:** when morph level changes → all shapes resize → cola receives updated width/height → `avoidOverlaps` pushes nodes apart → `requestAnimationFrame` loop animates repositioning. This is what creates the organic spreading seen between phases.

**Arrow bindings (tldraw v4.4.0 API):**
- `editor.createBinding({ type: 'arrow', fromId: arrowId, toId: shapeId, props: { terminal: 'start'|'end' } })`
- Arrows auto-track bound shapes through resize/reposition
- `editor.getBindingsFromShape(arrowId)` / `editor.getBindingsToShape(shapeId)` for lookups

---

#### Data Model

**Pattern source:** tldraw custom-shape example (`tldraw.dev/examples/custom-config`) uses `RecordProps<T>` with `T.number`, `T.string` validators from the `tldraw` package. The workflow starter kit (`github.com/tldraw/workflow-template`) stores structured data (port configs, execution results) directly in shape props using `T.object()` validators with nested fields. The custom-shape example uses module augmentation on `TLGlobalShapePropsMap` as the canonical registration pattern.

**Validator approach:** tldraw v4.4.0 provides `T.string`, `T.number`, `T.arrayOf()`, and `T.object()` from the `tldraw` package for prop validation. For list-like data (trades, areas), use `T.arrayOf(T.string)` -- this is the idiomatic tldraw pattern for multi-value fields. tldraw stores all prop data as plain JSON in its store, so arrays serialize naturally.

**TypeScript interfaces:**

```ts
// morph-types.ts — Module augmentation (pattern from tldraw custom-shape example)
import { TLShape } from 'tldraw'

export const MORPH_TYPE = 'morph' as const

declare module 'tldraw' {
  interface TLGlobalShapePropsMap {
    [MORPH_TYPE]: MorphShapeProps
  }
}

export type MorphShape = TLShape<typeof MORPH_TYPE>

// Shape props — flat structure, all primitive or array-of-primitive.
// tldraw's store serializes these as JSON. No nested objects needed.
export interface MorphShapeProps {
  w: number        // driven by semantic zoom engine, not user
  h: number        // driven by semantic zoom engine, not user
  name: string     // contractor display name (e.g. "Mike Rivera")
  company: string  // company name (e.g. "Rivera Electric LLC")
  license: string  // license number (e.g. "EC-2847") — empty string if unlicensed
  trades: string[] // trade categories (e.g. ["electrical", "low-voltage"])
  areas: string[]  // service areas (e.g. ["Broward", "Palm Beach"])
  phone: string    // phone number (e.g. "954-555-0142") — used for tel: link
  color: string    // trade color hex (e.g. "#f59e0b") — first trade's color
}
```

**Validator registration** (pattern from `custom-config` CardShapeUtil):

```ts
// In MorphShapeUtil.tsx
import { RecordProps, T } from 'tldraw'

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
```

**GraphNode interface** (used by `sample-graph.ts` to feed `App.tsx`):

```ts
export interface GraphNode {
  id: string
  name: string
  company: string
  license: string
  trades: string[]
  areas: string[]
  phone: string
  color: string   // resolved from first trade via TRADE_COLORS map
  x: number
  y: number
}

export interface GraphEdge {
  from: string  // referrer node id
  to: string    // referred node id
}
```

**Key decisions:**
- `color` is stored as a resolved hex string on the shape, not as a trade enum. This avoids runtime lookups in the render path. The color is resolved once when the shape is created, from the first entry in `trades[]` via the `TRADE_COLORS` map.
- `trades` and `areas` are `string[]` not comma-separated strings. This makes pill/badge rendering a simple `.map()` call.
- `license` uses empty string `""` for unlicensed contractors (not null/undefined). tldraw's `T.string` validator does not support optional -- empty string is the idiomatic "no value" pattern.
- `w` and `h` remain as props (not computed) because the semantic zoom engine batch-updates them via `editor.updateShapes()`.

---

#### Rendering per Phase

All phases use `HTMLContainer` as the root wrapper -- this is the canonical tldraw v4 pattern confirmed across the custom-shape example, interactive-shape example, and workflow starter kit's `NodeShapeUtil.tsx`. Every phase renders a single `<HTMLContainer>` containing a styled `<div>`.

**Style constants** (updated from existing MorphShapeUtil):

```ts
const DARK_BG = '#1a1a2e'
const TEXT_PRIMARY = '#e0e0e0'
const TEXT_SECONDARY = '#b0b0b0'
const TEXT_MUTED = '#707070'
const FONT = "'Courier New', Courier, monospace"
```

**Phase 0: Dot (0.00-0.19) -- 30x30**

Geometry: `Circle2d({ radius: 15, isFilled: true })` -- same pattern as the existing morph dot phase. Circle geometry gives accurate hit testing for the small target.

Rendering: Trade-colored filled circle with a white bold initial letter centered inside. This replaces the old uniform dark dot with a semantically meaningful one -- you can distinguish electricians from plumbers even at the dot level by color.

```
   ┌──────┐
   │  ●M  │   30x30, trade-colored fill
   │      │   white bold initial centered
   └──────┘   border-radius: 50%
```

```tsx
// Phase 0 component (inside MorphComponent)
<HTMLContainer>
  <div style={{
    width: w, height: h,
    borderRadius: '50%',
    background: shape.props.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: FONT,
  }}>
    {shape.props.name.charAt(0).toUpperCase()}
  </div>
</HTMLContainer>
```

**Phase 1: Label (0.20-0.79) -- 240x32**

Geometry: `Rectangle2d({ width: w, height: h, isFilled: true })`.

Rendering: Dark rounded rect with trade-colored left accent bar (4px wide), white monospace bold text showing "Name -- Company". Pattern follows the custom-shape example's HTMLContainer + inline style approach. Text overflow uses `whiteSpace: nowrap` + `textOverflow: ellipsis` -- standard CSS, consistent with how tldraw's own text shapes clip content at bounds.

Width increased from 200 to 240 to accommodate "Name -- Company" format (e.g. "Mike Rivera -- Rivera Electric" is ~30 chars at 13px monospace = ~234px).

```
   ┌─┬──────────────────────────────────┐
   │▌│ Mike Rivera — Rivera Electric    │  32px tall
   └─┴──────────────────────────────────┘  4px color accent left
                                           240px wide, 4px border-radius
```

```tsx
// Phase 1 component
<HTMLContainer>
  <div style={{
    width: w, height: h,
    background: DARK_BG,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'all',
  }}>
    {/* Trade color accent bar */}
    <div style={{
      width: 4, height: '100%',
      background: shape.props.color,
      flexShrink: 0,
    }} />
    <div style={{
      color: TEXT_PRIMARY,
      fontFamily: FONT,
      fontSize: '13px',
      fontWeight: 700,
      padding: '0 10px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}>
      {shape.props.name} — {shape.props.company}
    </div>
  </div>
</HTMLContainer>
```

**Phase 2: Card (0.80-0.99) -- 350x200**

Geometry: `Rectangle2d({ width: w, height: h, isFilled: true })`.

Rendering: Business card layout. Follows the workflow starter kit's `NodeShapeUtil` component pattern: HTMLContainer wraps a flexbox column with distinct sections (heading, body). The workflow kit uses CSS class names via `classNames()`, but for a single shape type inline styles are simpler and avoid a CSS file dependency.

Layout sections (top to bottom):
1. **Header bar** -- trade-colored background strip (40px), name (bold 14px white) + company (regular 12px white/80%)
2. **Body** -- dark background, 3 rows:
   - Trade pills -- colored badges, `display: flex`, `flexWrap: wrap`, `gap: 4px`
   - Areas -- lighter text, comma-separated
   - License -- smallest text, muted color

Dimensions: 350x200 -- tighter than the old 400x300. Business card ratio is 1.75:1 (350/200 = 1.75). Smaller cards produce a tighter force-directed graph, which is desirable for a referral network where relationships matter more than content.

```
   ┌──────────────────────────────────────┐
   │  ████████████████████████████████████ │ ← trade-colored header (40px)
   │  Mike Rivera                         │   name: bold 14px white
   │  Rivera Electric LLC                 │   company: 12px white/80%
   ├──────────────────────────────────────┤
   │  [Electrical] [Low Voltage]          │ ← trade pills, colored bg
   │                                      │
   │  Broward · Palm Beach                │ ← areas, muted text
   │  EC-2847                             │ ← license, smallest/muted
   └──────────────────────────────────────┘
     350 x 200, 8px border-radius
```

```tsx
// Phase 2 component (sketch -- actual implementation may adjust spacing)
<HTMLContainer>
  <div style={{
    width: w, height: h,
    background: DARK_BG,
    borderRadius: '8px',
    overflow: 'hidden',
    pointerEvents: 'all',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: FONT,
  }}>
    {/* Header bar */}
    <div style={{
      background: shape.props.color,
      padding: '8px 12px',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
        {shape.props.name}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
        {shape.props.company}
      </div>
    </div>
    {/* Body */}
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Trade pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {shape.props.trades.map(trade => (
          <span key={trade} style={{
            background: `${shape.props.color}33`,  // 20% opacity
            color: shape.props.color,
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
          }}>{trade}</span>
        ))}
      </div>
      {/* Areas */}
      <div style={{ fontSize: '11px', color: TEXT_SECONDARY }}>
        {shape.props.areas.join(' · ')}
      </div>
      {/* License */}
      {shape.props.license && (
        <div style={{ fontSize: '10px', color: TEXT_MUTED }}>
          Lic: {shape.props.license}
        </div>
      )}
    </div>
  </div>
</HTMLContainer>
```

**Phase 3: Full Profile (1.00) -- 420x320**

Geometry: `Rectangle2d({ width: w, height: h, isFilled: true })`.

Rendering: Expanded contractor profile with interactive phone link. Follows the `interactive-shape` example's pointer event pattern: the phone link uses `pointerEvents: 'all'` on the anchor element with `stopPropagation()` on `onPointerDown` and `onTouchStart` to prevent tldraw from intercepting the tap. This is the exact pattern from tldraw's interactive-shape example for making clickable elements inside shapes.

Editing follows the `editable-shape` example pattern: `canEdit()` returns true for Phase 2+ (already implemented). When `this.editor.getEditingShapeId() === shape.id`, show editable inputs. When not editing, show read-only display. Double-click or Enter enters edit mode; Escape or click-away exits. The `onEditEnd()` callback can validate/trim fields.

Layout (top to bottom):
1. **Header** -- trade-colored, name (18px bold) + company (13px)
2. **Phone row** -- phone icon + tappable `tel:` link (large touch target, 44px min-height per mobile guidelines)
3. **Details section** -- trade pills, areas, license
4. **Bottom muted row** -- license number

```
   ┌──────────────────────────────────────────┐
   │  ████████████████████████████████████████ │ ← trade-colored header
   │  Mike Rivera                             │   name: 18px bold white
   │  Rivera Electric LLC                     │   company: 13px white/80%
   ├──────────────────────────────────────────┤
   │                                          │
   │  📞  (954) 555-0142                      │ ← tappable tel: link
   │  ──────────────────                      │   44px row, pointer stop
   │                                          │
   │  [Electrical] [Low Voltage]              │ ← trade pills
   │                                          │
   │  Areas: Broward · Palm Beach             │ ← areas
   │  License: EC-2847                        │ ← license
   │                                          │
   └──────────────────────────────────────────┘
     420 x 320, 8px border-radius
```

Phone link implementation (from `interactive-shape` example pattern):

```tsx
// Phone row -- interactive element inside shape
<a
  href={`tel:${shape.props.phone}`}
  style={{
    pointerEvents: 'all',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    minHeight: '44px',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: FONT,
  }}
  onPointerDown={(e) => e.stopPropagation()}
  onTouchStart={(e) => e.stopPropagation()}
  onTouchEnd={(e) => e.stopPropagation()}
>
  {shape.props.phone}
</a>
```

**Editing mode** (Phase 3 only, when `isEditing === true`):

The shape enters edit mode via double-click (tldraw built-in, gated by `canEdit() === true`). In edit mode, display `<input>` fields for name, company, phone, license. Each input uses `stopPropagation()` on pointer events per the `interactive-shape` pattern. On edit end (`onEditEnd()` callback or Escape), the values persist to shape props via `editor.updateShapes()`.

```tsx
// Conditional rendering pattern (from editable-shape example)
const isEditing = editor.getEditingShapeId() === shape.id

// In Phase 3 render:
{isEditing ? (
  <input
    value={shape.props.name}
    onChange={(e) => editor.updateShapes([{
      id: shape.id, type: MORPH_TYPE,
      props: { name: e.currentTarget.value }
    }])}
    onPointerDown={(e) => e.stopPropagation()}
    style={{ pointerEvents: 'all', /* ... */ }}
  />
) : (
  <div>{shape.props.name}</div>
)}
```

---

#### Trade Color Palette

**Color approach:** tldraw's `shape-with-tldraw-styles` example uses `DefaultColorStyle` + `useDefaultColorTheme()` + `getColorValue(theme, color, 'solid')` for theme-aware colors. However, our trade colors are domain-specific categories, not user-selectable styles. Following the `shape-with-custom-styles` example pattern, we define our own color constants rather than using tldraw's built-in color palette. This avoids collision with tldraw's UI blue (#3b82f6) which is reserved for selection handles.

**8 trade categories with hex colors** (tested for contrast on `#1a1a2e` dark background):

| Trade | Hex | Rationale |
|-------|-----|-----------|
| Electrical | `#f59e0b` | Amber/yellow -- universal electrical warning color |
| Plumbing | `#3b82f6` | NOTE: this matches tldraw's blue, but it's only used inside shape content, never on selection UI. Blue = water association. |
| HVAC | `#10b981` | Emerald green -- climate/air association |
| General Contractor | `#8b5cf6` | Purple -- distinct from all trade colors, signals management role |
| Painting | `#ec4899` | Pink/magenta -- creative/finish work |
| Roofing | `#ef4444` | Red -- roofing felt / warning / structural |
| Landscaping | `#22c55e` | Bright green -- grass/plants. Distinct from HVAC emerald by being warmer/brighter. |
| Low Voltage | `#06b6d4` | Cyan -- data/signal cables, distinct from electrical amber |

```ts
// In morph-types.ts or a new trade-colors.ts
export const TRADE_COLORS: Record<string, string> = {
  'electrical':  '#f59e0b',
  'plumbing':    '#3b82f6',
  'hvac':        '#10b981',
  'gc':          '#8b5cf6',
  'painting':    '#ec4899',
  'roofing':     '#ef4444',
  'landscaping': '#22c55e',
  'low-voltage': '#06b6d4',
}

export const DEFAULT_TRADE_COLOR = '#6b7280' // gray-500, for unknown trades
```

**Multi-trade color resolution:** The dot (Phase 0) and header bar (Phases 2-3) use the color of the **first trade** in the `trades[]` array. This is resolved once at shape creation time and stored as `props.color`. The trade pills in Phase 2-3 each get their own trade color via `TRADE_COLORS[trade]` lookup at render time.

**Pill/badge rendering style:** tldraw does not have a built-in badge/tag component. The workflow starter kit renders labels as plain text in heading sections. Our pill style uses inline CSS: `background: ${color}33` (hex + 20% alpha), `color: ${color}` (full saturation text), `borderRadius: 10px`, `padding: 2px 8px`, `fontSize: 10px`. This creates a chip/badge that picks up the trade color without needing a separate CSS file -- consistent with tldraw's preference for inline styles in shape components.

---

#### Edge Semantics

Edges = **referral relationships** — "I'd recommend this person."

- Direction: `from` → `to` means "from recommends to"
- Hub nodes (you, family) fan out to many contractors
- Contractors can cross-refer each other

**Topology: 3 hub nodes, ~9 leaf nodes.**

Hub nodes fan out to many contractors. Leaf nodes have 1-2 incoming edges.

- **Eddie** (you) — hub, refers to a GC and a few direct contractors
- **Mom (Besma)** — hub, refers to different contractors she's used for the house
- **A GC** — hub, cross-refers specialists he subcontracts to

This creates a realistic referral network: you know some people directly, your mom knows others, and the GC connects to a cluster of specialty trades he uses on jobs.

**Edge weight: not modeled.** All edges are equal-weight referrals. Trust levels deferred to backlog.

**Visual treatment: all edges identical.** Dark arrows, standard tldraw arrow style. The graph structure itself reveals trust — more connections to a node = more referrals = more trusted.

**Graph shape:**
```
   Eddie ──→ GC ──→ Electrician ──→ Low Voltage
     │         │──→ HVAC
     │         │──→ Painter
     │         └──→ Roofer
     │
     ├──→ Plumber
     └──→ Landscaper

   Mom ──→ Plumber           ← shared referral with Eddie
     │──→ Painter (different)
     │──→ HVAC               ← shared referral with GC
     └──→ Landscaper (different)
```

Cross-referrals (contractor → contractor) create cycles. This produces a realistic small-world topology with 2-3 clusters connected through hubs.

---

#### Tldraw SDK Patterns

Research conducted across 8 tldraw starter kits (`tldraw.dev/starter-kits/overview`), 4 official examples (`custom-shape`, `interactive-shape`, `editable-shape`, `custom-config`), the workflow template source (`github.com/tldraw/workflow-template`), and tldraw v4 docs (`tldraw.dev/docs/shapes`, `tldraw.dev/docs/editor`, `tldraw.dev/sdk-features/performance`).

---

**1. HTMLContainer -- still the standard in v4.4.0**

`HTMLContainer` is a React function component that wraps your JSX for rendering inside the canvas coordinate system. Signature: `HTMLContainer({ children, className, ...rest })`. It accepts any HTML div props. All starter kits and examples use it as the root of `component()`. The workflow starter kit's `NodeShapeUtil.tsx` passes a `className` prop with conditional classes via `classNames()`:

```tsx
<HTMLContainer className={classNames('NodeShape', { NodeShape_executing: isExecuting })}>
```

The custom-shape example passes inline `style`:

```tsx
<HTMLContainer style={{ backgroundColor: '#efefef' }}>
```

Both patterns work. For our case, the inner `<div>` carries all styling (consistent with the existing MorphShapeUtil), and HTMLContainer is used as a bare wrapper.

**Key gotcha:** HTMLContainer does NOT set `pointerEvents` -- it defaults to `none`. You must explicitly set `pointerEvents: 'all'` on child elements that need interaction. This is documented in the interactive-shape example.

---

**2. Interactive elements inside shapes -- pointer event model**

Source: `tldraw.dev/examples/shapes/tools/interactive-shape`

tldraw's canvas event system intercepts all pointer events by default. To make elements interactive inside a shape:

1. Set `pointerEvents: 'all'` on the interactive element (or its container)
2. Call `e.stopPropagation()` on `onPointerDown`, `onTouchStart`, and `onTouchEnd`
3. This prevents tldraw from interpreting the click as a shape selection or canvas pan

The interactive-shape example demonstrates this with a checkbox and text input:

```tsx
<input
  type="checkbox"
  onPointerDown={(e) => e.stopPropagation()}
  onTouchStart={(e) => e.stopPropagation()}
  onTouchEnd={(e) => e.stopPropagation()}
  onChange={(e) => {
    editor.updateShapes([{ id: shape.id, type: SHAPE_TYPE, props: { checked: e.target.checked } }])
  }}
/>
```

**For our `tel:` phone link:** Same pattern. The `<a href="tel:...">` element gets `pointerEvents: 'all'` + `stopPropagation()` on pointer/touch events. The browser handles the `tel:` protocol natively -- no tldraw-specific code needed for the actual call initiation.

**Important nuance from the example:** You can make `stopPropagation` conditional. The interactive-shape example only stops propagation on the text input when `checked === false`, allowing the editor to handle events normally in other states. We do not need this -- our phone link always intercepts taps.

---

**3. Editing pattern -- canEdit / isEditing / conditional rendering**

Source: `tldraw.dev/examples/shapes/tools/editable-shape`

The canonical editing flow:

1. `canEdit()` returns `true` on the ShapeUtil class -- gates whether double-click enters edit mode
2. User double-clicks the shape (or selects + presses Enter)
3. tldraw sets the shape as the editing shape: `editor.getEditingShapeId() === shape.id`
4. In `component()`, check `isEditing` and render different content:
   - **Not editing:** read-only display (text, labels, layout)
   - **Editing:** interactive inputs with `pointerEvents: 'all'` + `stopPropagation()`
5. User presses Escape or clicks away -- tldraw clears editing state
6. `onEditEnd()` callback fires on the ShapeUtil -- use for validation/cleanup

```tsx
// Pattern from editable-shape example
component(shape: MorphShape) {
  const editor = useEditor()
  const isEditing = editor.getEditingShapeId() === shape.id
  // ... conditional rendering based on isEditing
}
```

**For ProNet:** `canEdit()` returns true only in Phase 2+ (Card and Full), which is already implemented. Phase 3 (Full Profile) shows editable input fields when in edit mode. Phase 2 (Card) could optionally support editing but the compact layout makes it awkward -- defer to Phase 3.

---

**4. Shape component styling -- inline styles preferred**

The custom-shape example, interactive-shape example, and custom-config example all use **inline styles** on elements inside HTMLContainer. The workflow starter kit is the exception -- it uses CSS class names with a separate stylesheet (`NodeShape` classes with BEM naming).

**Recommendation for ProNet:** Use inline styles. Reasons:
- Consistent with existing MorphShapeUtil code
- No CSS file to manage or import
- Trade colors are dynamic (per-shape), which requires inline styles anyway
- The workflow starter kit uses CSS classes because its nodes have a single stable layout; our shapes morph between 4 completely different layouts, making class-based CSS unwieldy

tldraw CSS variables (e.g., `var(--tl-font-sans)`) are available but not commonly used inside custom shape content. They're more for UI components (toolbars, panels).

---

**5. Performance patterns for rich content shapes**

Source: `tldraw.dev/sdk-features/performance`

Key patterns from the performance docs:

- **Viewport culling is automatic.** tldraw sets `display: none` on off-screen shapes. A 12-node graph will have at most ~12 shapes rendered. No manual optimization needed at our scale.
- **Use `editor.getEfficientZoomLevel()` not `getZoomLevel()`** for zoom-dependent rendering. The efficient version debounces during camera movement to prevent render thrashing. Not directly relevant for our phase rendering (driven by slider, not zoom), but good practice.
- **Avoid expensive calculations in `component()`.** The workflow starter kit uses `useValue()` for reactive state that might change independently of shape props (execution status). For our case, all rendering data lives in shape props, so no `useValue()` needed in the component.
- **`useMemo()` for complex computations.** If trade pill rendering or area formatting becomes expensive, wrap in `useMemo`. At 12 nodes with ~3 trades each, this is premature.
- **Batch shape updates with `editor.run()`.** The semantic zoom engine already does this when resizing all shapes.

---

**6. Signals and reactive patterns in v4.4.0**

Source: `tldraw.dev/examples/signals`

tldraw v4 uses signia-based signals instead of React state for editor-level reactivity:

- **`useValue(label, fn, deps)`** -- subscribes to a computed value. Equivalent to `useMemo` but integrated with tldraw's signal system. Example from workflow kit: `useValue('isExecuting', () => executionGraph.isExecuting(shape.id), [executionGraph])`.
- **`track(Component)`** -- wraps a React component to auto-track signal reads and re-render on change. Example: `const InfoPanel = track(() => { const tool = editor.getCurrentToolId(); ... })`.
- **`useReactor(label, fn, deps)`** -- runs side effects when signals change, on next animation frame.

**For ProNet:** The `MorphComponent` function should be wrapped in `track()` if it reads any editor signals (e.g., `getEditingShapeId()`). Currently, the existing code calls `useEditor()` + `getDetailLevel(editor)` inside the component -- these are signal reads. Wrapping in `track()` ensures the component re-renders when editing state or detail level changes.

```tsx
const MorphComponent = track(function MorphComponent({ shape }: { shape: MorphShape }) {
  const editor = useEditor()
  const isEditing = editor.getEditingShapeId() === shape.id
  // ...
})
```

Note: tldraw's shape component system may already track the component internally (shape prop changes trigger re-render). But `getEditingShapeId()` is an external signal -- `track()` ensures it's captured. The workflow starter kit explicitly uses `useValue()` for similar external-state reads.

---

**7. ShapeUtil file structure**

The examples split across 1-3 files:
- **custom-config example:** `CardShapeUtil.tsx` (ShapeUtil class + component), `CardShapeTool.tsx` (tool), `card-shape-props.ts` (prop validators)
- **workflow starter kit:** `NodeShapeUtil.tsx` (ShapeUtil class + component + indicator), separate files for ports, connections, execution
- **interactive-shape / editable-shape examples:** single file with ShapeUtil class + inline component

**For ProNet:** Keep the existing structure: `morph-types.ts` (types + validators), `MorphShapeUtil.tsx` (ShapeUtil class + `MorphComponent` function), `MorphTool.ts` (placement tool). No need to split further. The component function is defined in the same file as the ShapeUtil (consistent with all examples) and delegated from `component()`.

---

**8. Responsive / conditional rendering based on shape state**

tldraw does not have a built-in "responsive shape" system. The custom-shape example renders identically regardless of size. The workflow starter kit's nodes have fixed widths (`NODE_WIDTH_PX` constant).

**Our approach is better than any example:** We use discrete phase-based rendering (4 completely different JSX trees), driven by the semantic zoom slider rather than shape dimensions. This is architecturally simpler than trying to make a single layout responsive. The existing `if (phase === MorphPhase.Dot) { ... } else if (phase === MorphPhase.Label) { ... }` pattern is clean and has no tldraw precedent to contradict it.

---

**9. `tel:` and `mailto:` links inside shapes**

No tldraw example explicitly demonstrates `tel:` or `mailto:` links. However, the `interactive-shape` example establishes the pattern: any HTML element with `pointerEvents: 'all'` + `stopPropagation()` works normally inside a shape. An `<a href="tel:...">` is just an HTML element -- the browser handles the protocol. The key insight is that without `stopPropagation()`, tldraw would intercept the click as a selection event and the link would never fire.

---

**10. Recommended conditional rendering approach for phases**

No tldraw example does multi-phase rendering. The closest analogy is the editable-shape example's `isEditing` conditional: one shape, two render modes. Our pattern extends this to four modes.

**Recommended approach** (already implemented in MorphShapeUtil, confirmed idiomatic):

```tsx
function MorphComponent({ shape }: { shape: MorphShape }) {
  const editor = useEditor()
  const level = getDetailLevel(editor)
  const phase = getPhaseFromLevel(level)

  if (phase === MorphPhase.Dot) return <DotView shape={shape} />
  if (phase === MorphPhase.Label) return <LabelView shape={shape} />
  if (phase === MorphPhase.Card) return <CardView shape={shape} />
  return <FullView shape={shape} editor={editor} />
}
```

Extracting each phase into its own sub-component (vs. inline JSX blocks) improves readability as the card/full phases grow in complexity. This is consistent with the workflow starter kit's pattern of delegating from ShapeUtil `component()` to a separate functional component (`NodeShape`).

---

#### Phase Dimensions

**`morph-phases.ts` needs updated dimensions.** The existing sizes were designed for lorem-ipsum document content. Contractor cards have different content density.

**Starter kit reference dimensions:**
- Workflow starter kit uses a fixed `NODE_WIDTH_PX` constant (appears to be ~200-250px based on screenshots) with dynamic height from `getBodyHeightPx()`. Nodes are compact -- they show a label + ports + one value.
- The custom-shape example defaults to 200x200. The custom-config card example defaults to 100x100 (tiny, meant to be resized).
- No starter kit renders card-like content at 800x600 -- that's document territory.

**New dimensions for contractor cards:**

| Phase | Old (lorem) | New (contractor) | Rationale |
|-------|-------------|-------------------|-----------|
| Dot | 30x30 | 30x30 | No change. Circle dot. |
| Label | 200x32 | 240x32 | Wider to fit "Name -- Company" (~30 chars at 13px monospace). 32px height unchanged. |
| Card | 400x300 | 350x200 | Business card ratio (1.75:1). Contractor info is structured (pills, short fields), not prose -- needs less vertical space than lorem body text. |
| Full | 800x600 | 420x320 | Compact profile, not a document. Phone row + trade pills + areas + license fits in ~320px height. 420px width gives breathing room for inputs in edit mode. Still 1.3:1 ratio. |

**Business card ratio:** Yes, honor it for Phase 2. 350/200 = 1.75:1, matching the standard 3.5x2" business card. This feels natural for the content and produces recognizable card shapes in the graph.

**Force layout impact:** Smaller cards (350x200 vs 400x300) produce a tighter graph. For a referral network this is desirable -- the relationships (edges) are the primary information, and a compact layout keeps the whole network visible at 73% zoom. The old 800x600 document phase pushed nodes so far apart that the graph structure was lost; 420x320 keeps neighbors visible.

**Updated `PHASE_CONFIGS`:**

```ts
export const PHASE_CONFIGS: Record<MorphPhase, PhaseConfig> = {
  [MorphPhase.Dot]:      { phase: MorphPhase.Dot,      w: 30,  h: 30,  borderRadius: 15 },
  [MorphPhase.Label]:    { phase: MorphPhase.Label,     w: 240, h: 32,  borderRadius: 4  },
  [MorphPhase.Card]:     { phase: MorphPhase.Card,      w: 350, h: 200, borderRadius: 8  },
  [MorphPhase.Document]: { phase: MorphPhase.Document,  w: 420, h: 320, borderRadius: 8  },
}
```

**Note:** The `Document` phase name is inherited from the existing enum. It now renders a "Full Profile" rather than a document, but renaming the enum would touch engine files we are not modifying. The name is internal only.

---

#### Testing Benchmarks

| Test | Pass Criteria |
|------|--------------|
| Phase 0 render | 30x30 trade-colored circles with white bold initial letter centered. Each dot color matches the contractor's primary trade. `Circle2d` geometry for hit testing. All dots visible at 73% zoom. |
| Phase 1 render | 240x32 dark rounded rects with 4px trade-colored left accent bar. White monospace bold "Name -- Company" text. Text truncated with ellipsis if overflow. 4px border-radius. |
| Phase 2 render | 350x200 dark cards with trade-colored header bar (40px). Name (14px bold white) + company (12px) in header. Trade pills with colored backgrounds below. Areas as muted dot-separated text. License number in smallest muted text. 8px border-radius. |
| Phase 3 render | 420x320 dark cards with trade-colored header (name 18px bold + company 13px). Phone number as blue tappable link with 44px min-height touch target. Trade pills, areas, license below. 8px border-radius. |
| Phase transitions | Discrete snap between phases (no gradual fade) |
| Arrow tracking | Arrows remain connected through all 4 phase transitions |
| Force layout | Shapes spread apart when resized (webcola avoidOverlaps) |
| Editing | Phase 3 only. Double-click enters edit mode. Input fields for name, company, phone, license. Each input has `pointerEvents: 'all'` + `stopPropagation()`. Escape or click-away exits edit mode. Values persist to shape props via `editor.updateShapes()`. |
| Tap-to-call | Phase 3 only. Phone number renders as `<a href="tel:...">` with `pointerEvents: 'all'`. `stopPropagation()` on `onPointerDown`, `onTouchStart`, `onTouchEnd` prevents tldraw from intercepting. Clicking/tapping opens phone dialer (browser native `tel:` handling). Link is visually distinct (blue, 16px, 44px row height). |
| Undo | Ctrl+Z reverses edits made in edit mode |
| New morph shapes | M key places contractor card with defaults |
| Trade colors | Each of 8 trade categories has a distinct hex color. Dots (Phase 0) are visually distinguishable by color. Trade pills (Phase 2-3) use 20% alpha background + full color text for each trade. Multi-trade contractors show first trade color on dot/header, all trade colors on pills. |
| Referral edges | 3 hub nodes (Eddie, Mom, GC) fan out to leaf contractors. Shared referrals create multiple incoming edges on the same node (e.g., Plumber referred by both Eddie and Mom). Cross-referrals between contractors create cycles. Total: ~12 nodes, ~15 edges. Arrow direction indicates "recommends". |
| Graph toggle | G key still toggles force layout |

---

#### Timeline

- [x] Create `pronet` branch from main
- [x] Write spec skeleton (`pronet.md`)
- [x] Research agent fills all {FILL IN} sections from tldraw examples + starter kits
- [x] Update `morph-types.ts` — new props interface + GraphNode + TRADE_COLORS + helpers
- [x] Update `MorphShapeUtil.tsx` — validators, TradeIcon, 4-phase contractor card rendering, track() wrapper, editing support with EditableInput
- [x] Update `MorphTool.ts` — default props for new contractor shape
- [x] Replace `sample-graph.ts` — 12 contractor nodes + 15 referral edges
- [x] Update `App.tsx` — map new GraphNode fields to shape props + stale shape cleanup
- [x] Update `morph-phases.ts` — Label 240x32, Card 350x200, Document 420x320
- [x] Vite build passes (no type errors beyond pre-existing TS1355)
- [ ] `npm run dev` — verify all 4 phases render correctly
- [ ] Test editing in Card and Full phases
- [ ] Test tap-to-call in Full phase
- [ ] Test force layout with contractor nodes
- [ ] Test undo/redo with edits

### Resolved Issues:

(none yet)

### Backlog:

- **Search/filter by trade** — UI to filter visible nodes by trade category
- **Add contractor from contacts** — import from phone contacts or vCard
- **QR code in Full phase** — generate QR code with contact info for easy sharing
- **Rating/notes field** — personal notes about quality of work, last job date
