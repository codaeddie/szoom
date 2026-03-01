<!--
  CLAUDE.md MAINTENANCE GUIDE
  ────────────────────────────
  This file is the single source of truth for the szoom project. Keep it accurate.

  PRINCIPLES:
  1. Checkboxes must reflect ACTUAL state — never mark done until verified running.
     A file existing is not the same as a feature working. "Checked off" = tested.
  2. When a planned file is skipped or replaced by a different approach, NOTE IT
     explicitly (e.g. "SKIPPED — replaced by X"). Don't leave phantom entries.
  3. Keep the scaffold section in sync with reality. If files are added/removed,
     update the tree. Future agents read this to orient themselves.
  4. Bug fixes and UI tweaks go in the "Resolved Issues" section with date,
     not scattered through the doc.
  5. Backlog items go in the "Backlog" section — don't delete planned features,
     move them there with context about why they were deferred.
  6. This doc is for agents AND humans. Write concisely but don't assume context.
     A new reader should be able to understand the project state in one pass.
     -->

## How to Implement Semantic Zoom in tldraw

#### Reverse Engineering based on Orion Reed description: 

> I've been calling these kind of like visual semantic morphisms or semantic zoom which is a kind of transformation where you're preserving the semantics throughout uh. Imagine that this is your like obsidian graph view uh and we want to go into graph mode uh we can transition between a purely kind of point base graph layout and one with labels where we have little information uh still more than the point but but in this case the the semantics here that the label is inside um because we want it to persist that that kind of encoding of the semantics to other views like we can go to this kind of mini note view uh and make these editable maybe I didn't um but you could for example see a bunch of notes kind of clustered together and and edit them and then of course if you wanted to you could go to one that's close to full screen um so this was just to illustrate that it's it's conceivable that in in a world where we have more of our UI in the same environment that it could be uh it it could be a kind of uh a patchwork collage of different things where you have your email client of choice next to your tree view thing of choice for whatever purpose and you have your all of the stuff together kind with all of its own visual

#### Detail Morph Level:

**Phase 0: Dot (value: 0.00)**

- 8 solid black filled circles (~30-40px diameter) arranged in a force-directed graph layout
- Dark navy/black directed arrows connect between dots — arrows have pointed heads
- No text, no labels — pure topology. Constellation-like appearance
- Layout is organic, spread across center-right of canvas, roughly 400x450px bounding area
- Arrows cross over each other naturally (not routed around)
- Status bar reads `select.idle` — no shape type visible (too small to hover)
- Custom slider bottom-right: `0.00` with green indicator bar
- Camera zoom: 73%. "Graph" toggle button at top center. Standard tldraw toolbar at bottom
- Right panel shows tldraw style options: colors (blue selected), fill styles, geo shapes (circle selected), sizes S/M/L/XL

**Phase 1: Label (value: 0.20)**

- Dots have SNAPPED (not faded) to dark rounded rectangles containing white monospace bold title text
- Labels: "ex tempor", "dolor ipsum", "laborum ad aute duis", "dolore excepteur", "culpa tempor", "do aliqua consectetur", "excepteur occaecat", "consectetur id excepteur ullamco"
- Shapes are ~160-250px wide × ~32px tall (single-line labels with padding)
- Dark background (#1a1a2e or similar), white/light text, ~13px monospace bold
- 4px border radius, tight padding ~8-10px horizontal
- Arrows still connect between shapes — they've tracked the resize automatically
- Graph layout has adjusted — shapes are more spread than dot phase to avoid overlap
- Same 73% zoom, same force-directed positioning (webcola simulation still running)
- Status bar: `select.idle`
- Slider reads `0.20` with green bar

**Phase 2: Card / Mini-Note (value: 0.80)**

- Labels have SNAPPED to expanded card views with title + body text
- Cards are ~350-450px wide × ~200-350px tall
- Dark background, monospace font throughout
- Title: bold, ~14px, at top of card
- Body: lighter color (#b0b0b0), ~11px, line-height ~1.5, fills remaining space, overflows hidden
- Body text is lorem ipsum filler — long paragraphs of content
- Cards are much more spread out — force layout has pushed them apart to avoid overlap
- Some cards partially off-screen (layout extends beyond viewport)
- Arrows still connected, routing between enlarged cards
- Status bar reads: `select.idle / morph / {153, 85}` — CONFIRMS shape type is "morph"
- Slider reads `0.80` with green + yellow bars
- Camera still locked at 73%

**Phase 3: Full Note / Document (value: 1.00)**

- "laborum ad aute duis" has expanded to ~850x700px — nearly fills the viewport
- Full document view: title at top (~18px bold), then body text (~13px, line-height 1.7)
- Body text is multiple paragraphs of lorem ipsum, fully readable
- Dark background with light text, generous padding (~32px)
- Shape is selected (blue selection handles visible at corners)
- Other shapes partially visible at edges (top-right corner shows "dolor ipsum" snippet, bottom-right shows "dolore exc..." clipped)
- Arrow connections still visible, extending off-screen to connected nodes
- Status bar: `select.idle / morph / {315, -648}` — large negative Y confirms shapes spread far apart
- Slider reads `1.00` with all 4 color bars lit (green, yellow, orange, red)
- Camera still 73%

```ts
// Phase 0: Dot (0.00)
// - Render: solid filled circle, ~30px diameter, dark fill (#1a1a2e)
// - Geometry: Circle2d for hit testing
// - Size: { w: 30, h: 30 }
// - No text content rendered
// - Arrows connect center-to-center

// Phase 1: Label (0.20)
// - Render: dark rounded rect with white monospace bold title
// - Geometry: Rectangle2d
// - Size: { w: ~200, h: 32 } (width varies by title length, or fixed)
// - Single line, overflow ellipsis, 4px border-radius
// - Instant snap from dot — no fade transition

// Phase 2: Card (0.80)
// - Render: dark rect with title (bold) + body text (lighter)
// - Geometry: Rectangle2d
// - Size: { w: 400, h: 300 } (approximate)
// - Body text overflow hidden, ~11px, lighter color
// - canEdit() returns true — shapes become editable
// - 8px border-radius

// Phase 3: Full Note (1.00)
// - Render: large dark rect, full document reading/editing mode
// - Geometry: Rectangle2d
// - Size: { w: 800, h: 600 }
// - Full body text with scroll, generous padding
// - Title ~18px, body ~13px, line-height 1.7
// - 8px border-radius
```

---

#### Tldraw Documentation Reference:

**Version:** tldraw v4.4.0 (latest as of Feb 2026). Import from `tldraw` not `@tldraw/tldraw`.

**Custom Shapes (modern API):**

- Use module augmentation: `declare module 'tldraw' { interface TLGlobalShapePropsMap { ... } }`
- Shape type: `TLShape<'morph'>` 
- Props validated with `T.number`, `T.string` from `tldraw`
- `ShapeUtil` class: `component()`, `indicator()`, `getGeometry()`, `getDefaultProps()`
- Register via `<Tldraw shapeUtils={[MorphShapeUtil]} />`
- Docs: https://tldraw.dev/docs/shapes, https://tldraw.dev/examples/custom-shape

**Arrow Bindings (modern API — changed significantly from beta.2):**
- Arrows use `editor.createBinding()` with `type: 'arrow'`
- Each binding connects `fromId` (arrow) → `toId` (target shape) with `terminal: 'start'|'end'`
- Arrows auto-track bound shapes through resize/reposition
- Docs: https://tldraw.dev/reference/editor/Editor (createBinding section)

**Side Effects (replaces old `store.onAfterChange`):**
- `editor.sideEffects.registerAfterChangeHandler('shape', (prev, next, source) => { ... })`
- `editor.sideEffects.registerAfterCreateHandler('shape', (shape) => { ... })`
- `editor.sideEffects.registerAfterDeleteHandler('shape', (shape, source) => { ... })`
- Returns cleanup function. Register in `onMount`.
- Docs: https://tldraw.dev/reference/store/StoreSideEffects

**UI Customization:**

- `TLComponents` prop: `InFrontOfTheCanvas`, `OnTheCanvas`, `Toolbar`, etc.
- `DefaultToolbar` component can be overridden or augmented
- `TLUiOverrides` for keyboard shortcuts and actions
- Docs: https://tldraw.dev/docs/user-interface

**Editor API (key methods):**

- `editor.createShapes([...])`, `editor.updateShapes([...])`, `editor.deleteShapes([...])`
- `editor.getCurrentPageShapes()` — all shapes on current page
- `editor.getSelectedShapeIds()` — current selection
- `editor.getShape(id)` — get single shape
- `editor.getShapeGeometry(id).bounds` — get { w, h } bounds
- `editor.zoomToFit()`, `editor.setCamera()`, `editor.getZoomLevel()`
- `editor.updateDocumentSettings({ meta: { ... } })` — store global state reactively
- Docs: https://tldraw.dev/reference/editor/Editor

**Camera Control:**

- `editor.setCameraOptions({ isLocked: true })` — lock camera
- `editor.setCamera({ x, y, z })` — z controls zoom (0.73 = 73%)

#### Force-Directed Graph Implementation:

- Uses `webcola` (`Layout` class from `webcola` npm package) for constraint-based force-directed layout
- `BaseCollection` pattern: abstract class managing a set of shapes with lifecycle hooks (`onAdd`, `onRemove`, `onShapeChange`)
- `CollectionProvider`: React context that bridges tldraw's store changes to collection instances
- `GraphLayoutCollection` extends `BaseCollection`:
  - Maintains parallel `colaNodes` Map (TLShapeId → ColaNode with x, y, width, height, rotation)
  - Maintains `colaLinks` Map from arrow shapes (source/target by bound shape IDs)
  - Runs `requestAnimationFrame` loop calling `this.step()` each frame
  - `step()`: calls `graphSim.start(1, 0, 0, 0, true, false)` for single iteration, then syncs cola node positions back to tldraw shapes via `editor.updateShape()`
  - Handles dragging: if shape is selected, reads position from tldraw → updates cola node (user overrides sim)
  - `calcEdgeDistance()`: computes link distance accounting for rotated bounding boxes
  - `avoidOverlaps(true)` + `handleDisconnected(true)` on the cola simulation

**Modernization for tldraw v4.x:**

- Replace `store.onAfterChange` / `store.onAfterDelete` with `editor.sideEffects.registerAfterChangeHandler` / `registerAfterDeleteHandler`
- Arrow bindings: old API used `arrow.props.start.type === 'binding'` and `arrow.props.start.boundShapeId`. New API uses `editor.getBindingsFromShape(arrowId)` or check `editor.getBindingsToShape(shapeId)`
- The `BaseCollection` pattern itself is framework-level and can be kept largely intact, just update the tldraw API calls inside it
- Shape type changes: `tldraw` is EXTREMELY OPINIONATED ABOUT FUCKING SHPAES BRO
- The `webcola` library itself is unchanged — it's a standalone layout engine

**Key webcola configuration from original:**

```ts
this.graphSim
  .nodes(nodes)
  .links(links)
  .constraints(constraints)
  .linkDistance((edge) => calcEdgeDistance(edge))
  .avoidOverlaps(true)
  .handleDisconnected(true)
```

**Integration with semantic zoom:**

- When morph level changes, ALL morph shapes resize simultaneously
- Cola simulation receives updated `width`/`height` for each node
- `avoidOverlaps(true)` causes simulation to push nodes apart as they grow
- This is what creates the organic spreading seen in level20→level80→level100
- The sim loop (`requestAnimationFrame`) handles the animated repositioning

#### Implementation Scaffold:

```
szoom/
├── CLAUDE.md                          # This file
└── src/
    ├── main.tsx                        # React entry point
    ├── App.tsx                         # Tldraw mount + wiring
    ├── morph/
    │   ├── morph-types.ts             # Shape type, phase enum, constants
    │   ├── MorphShapeUtil.tsx          # Custom ShapeUtil (rendering per phase)
    │   ├── MorphTool.ts               # Custom tool — click-to-place morph shapes (M key)
    │   └── morph-phases.ts            # Phase definitions (dot/label/card/doc dimensions)
    ├── graph/
    │   ├── graph-layout.ts            # Webcola simulation wrapper (standalone, no Collection pattern)
    │   ├── GraphCollection.ts         # PLANNED — reactive sideEffect layer (not yet created)
    │   └── CollectionProvider.tsx      # PLANNED — React context bridge (not yet created)
    ├── ui/
    │   ├── DetailSlider.tsx           # Bottom-right zoom controller (0.00 → 1.00)
    │   ├── GraphToggle.tsx            # Top-center "Graph" button
    │   └── ui-overrides.ts           # Keyboard shortcuts (G=graph, M=morph) + toolbar tool registration
    ├── engine/
    │   └── semantic-zoom.ts           # Phase logic: reads slider value, batch-updates all morph shapes
    └── data/
        └── sample-graph.ts            # 8 sample nodes 
```

**Implementation order:**

1. Project scaffold (Vite + React + tldraw v4.4.0 + webcola)
2. `morph-types.ts` + `morph-phases.ts` — type system and phase dimensions
3. `MorphShapeUtil.tsx` — custom shape that renders 4 discrete modes based on current phase
4. `semantic-zoom.ts` — engine that reads global detail level, determines phase, batch-resizes all morph shapes
5. `DetailSlider.tsx` — UI controller that sets the global detail level
6. `sample-graph.ts` + `App.tsx` — wire up sample data, create shapes + arrows on mount
7. `GraphCollection.ts` + `CollectionProvider.tsx` — modernized webcola force-directed layout
8. `GraphToggle.tsx` + `ui-overrides.ts` — Graph mode toggle and keyboard shortcut
9. Integration testing — verify all 4 phases match reference images

#### Testing Benchmarks:

| Test | Pass Criteria |
|------|--------------|
| Phase 0 render | 8 solid circles, ~30px, dark fill, arrows connecting |
| Phase 1 render | Dark label rects with white monospace title, ~32px tall |
| Phase 2 render | Cards with title + body, ~400x300px, body text visible |
| Phase 3 render | Full document ~800x600px, scrollable body, readable |
| Phase transitions | Discrete snap (not gradual fade) between phases |
| Camera lock | Zoom stays at 73% during all morph transitions |
| Arrow tracking | Arrows remain connected through all 4 phase transitions |
| Force layout | Shapes spread apart organically when resized (webcola) |
| Drag interaction | Can drag shapes while force sim is running |
| Slider control | Bottom-right slider drives phase changes, shows value |
| Graph toggle | "Graph" button / G key toggles force layout on/off |
| Status bar | Shows `morph` as shape type when hovering morph shapes |
| 8 nodes + edges | Matches Orion's demo topology (verify edge connections) |

---

### Timeline:

- [x] Analyzed reference images (level0-level100.png)
- [x] Read Orion's original implementation (tldraw-graph-layout/)
- [x] Documented tldraw v4.x API changes from beta.2
- [x] Filled in CLAUDE.md spec
- [x] Scaffold project (Vite + React + tldraw 4.4.0 + webcola)
- [x] Implement morph shape type + phases (morph-types.ts, morph-phases.ts)
- [x] Implement MorphShapeUtil (4-mode discrete rendering)
- [x] Implement semantic zoom engine + detail slider (semantic-zoom.ts, DetailSlider.tsx)
- [x] Implement force-directed graph (graph-layout.ts — standalone, no Collection pattern)
- [x] Wire up App.tsx with sample data, arrow bindings, graph toggle
- [x] `npm install` + `npm run dev` — first boot test (confirmed working)
- [x] Verify arrow binding API works with tldraw 4.4.0 (confirmed — arrows track shapes)
- [x] Verify webcola integration (confirmed — force layout runs, no type issues at runtime)
- [x] Test all 4 phase transitions against reference screenshots (confirmed — slider drives discrete snaps)
- [x] Tune phase thresholds to match Orion's demo: snaps at 0.20/0.80/1.00 (was 0.10/0.50/0.90)
- [x] Fix slider interactivity (pointerEvents + stopPropagation — tldraw canvas was swallowing input)
- [x] Test drag interaction during active force simulation (confirmed working)
- [x] Add morph shape tool to toolbar + M key shortcut (MorphTool.ts, toolbar override in App.tsx)
- [ ] Reactive graph layer (GraphCollection + sideEffects — add/remove nodes at runtime)

### Resolved Issues (2026-03-01):

- Detail slider was hidden behind tldraw debug bar + license notice → moved to bottom:60 right:200
- Detail slider was not interactive — tldraw canvas layer swallowed pointer events → added `pointerEvents: 'all'`, `zIndex: 99999`, and `onPointerDown stopPropagation` on the range input
- Graph toggle button used monospace font instead of tldraw's sans font → switched to var(--tl-font-sans)
- tldraw UI menus had browser-default font (no font-family inherited) → added Inter/system sans-serif stack on root container div in App.tsx
- G key conflicted with tldraw's built-in `select-geo-tool` action (NOT `geo`) → cleared its kbd binding, kept G for graph toggle
  - Key learning: tldraw's geo tool shortcut is registered as action `select-geo-tool`, not `geo`. Always check node_modules/tldraw/src/lib/ui/context/actions.tsx for actual action IDs.
- Phase thresholds changed from {0.10, 0.50, 0.90} to {0.20, 0.80, 1.00} to match Orion's demo stops
- Morph tool: added MorphTool.ts (StateNode, StickerTool pattern), toolbar button via CustomToolbar component override (DefaultToolbar + DefaultToolbarContent + MorphToolbarItem), M key shortcut via TLUiOverrides.tools() callback
  - Key learning: toolbar buttons require BOTH a `tools()` override in TLUiOverrides AND a custom Toolbar component that renders the item. The `tools()` override alone only registers the shortcut/action, not the UI button.
  - Key learning: `DefaultToolbar` accepts children prop — pass `<DefaultToolbarContent />` plus custom items to extend without replacing.
  - Returns to select tool after placement unless tool lock is active (`editor.getInstanceState().isToolLocked`)

### Backlog (deferred, not blocked):

- **Camera lock at 73%** — cosmetic polish, not functionally needed. Would use `setCameraOptions({ isLocked: true })` + `setCamera({ z: 0.73 })`
- **GraphCollection.ts + CollectionProvider.tsx** — reactive sideEffect layer so new shapes/arrows auto-join the force sim. No longer blocked (morph toolbar tool exists). Original design used BaseCollection pattern from Orion's beta.2 code; modern approach would use `editor.sideEffects.registerAfterCreateHandler` directly in GraphLayout class.
- **Persistence cleanup** — `persistenceKey="szoom"` may cause stale shapes on reload
