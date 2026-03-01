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

## How to Morph Nodes into people

#### Context

The current morph shapes render generic lorem ipsum notes (title + body). This spec transforms them into person cards for a family/social graph. Each person has a name, role, info line, bio paragraph, and colored initials circle. The 4 semantic zoom phases show progressively more detail — from a colored initial dot to a full profile.

The existing pipeline is data-agnostic: `semantic-zoom.ts` only updates `w` and `h`, `graph-layout.ts` only reads geometry, `morph-phases.ts` only defines dimensions. None of these files change. Only the shape props, rendering, and sample data change.

---

#### Data Model

**`src/morph/morph-types.ts` — MorphShapeProps**

Replace `{ w, h, title, body }` with:

```ts
interface MorphShapeProps {
  w: number
  h: number
  name: string          // "Eddie" — always present, rendered at every phase
  role: string          // "Son" / "Mother" / "Cousin"
  info: string          // short line — "Makdesi & Coda Family"
  bio: string           // full paragraph — lorem ipsum or real bio
  avatarUrl: string     // image URL or empty string (reserved for future use)
  color: string         // hex color for initials circle bg — e.g. '#9C27B0'
}
```

**`src/morph/morph-types.ts` — GraphNode**

Update to match:

```ts
interface GraphNode {
  id: string
  name: string
  role: string
  info: string
  bio: string
  color: string
  x: number
  y: number
}
```

**Module augmentation + validators** in `MorphShapeUtil.tsx`:

Update `TLGlobalShapePropsMap` and `RecordProps` validators to use `T.string` for each new field. Drop `title` and `body`.

---

#### Rendering per Phase

All inside existing `MorphComponent` function in `MorphShapeUtil.tsx` — same switch structure, new content:

| Phase | Size | Shows | Layout |
|-------|------|-------|--------|
| **Dot** (0–0.19) | 30×30 | Initials circle (first letter of name, colored bg) | Centered single letter, white text on `color` bg |
| **Label** (0.20–0.79) | 200×32 | 24px initials circle + **name** bold | Horizontal flex: `[circle] Name` |
| **Card** (0.80–0.99) | 400×300 | 48px initials circle + name (bold) + role + info | Top row: circle + name/role. Below: info text |
| **Full** (1.00) | 800×600 | 80px initials circle + name + role + info + **full bio** | Large header with circle + name/role. Body: info + bio paragraphs |

**Initials circle** (inline helper, not a separate file):

```tsx
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
```

```ts
// Phase 0: Dot (0.00)
// - Render: initials circle, first letter of name, colored bg (props.color)
// - Geometry: Circle2d for hit testing
// - Size: { w: 30, h: 30 }
// - White text, colored background — NOT black dots anymore

// Phase 1: Label (0.20)
// - Render: dark rounded rect with 24px initials circle + name (bold, white)
// - Geometry: Rectangle2d
// - Size: { w: 200, h: 32 }
// - Horizontal flex layout, 4px border-radius

// Phase 2: Card (0.80)
// - Render: dark rect with 48px initials circle + name/role header + info body
// - Geometry: Rectangle2d
// - Size: { w: 400, h: 300 }
// - canEdit() returns true — fields become editable inputs on double-click
// - 8px border-radius

// Phase 3: Full (1.00)
// - Render: large dark rect with 80px initials circle + full profile
// - Geometry: Rectangle2d
// - Size: { w: 800, h: 600 }
// - name (bold, 18px) + role + info + bio paragraphs
// - canEdit() returns true
// - 8px border-radius
```

---

#### Tldraw Documentation Reference:

##### Editing Pattern (Card + Full phases)

- `canEdit()` returns true for Card/Full phases (already does)
- In component: check `editor.getEditingShapeId() === shape.id`
- When editing: render `<input>` for name, role, info + `<textarea>` for bio
- When not editing: render display-only text
- Use `onPointerDown={isEditing ? (e) => e.stopPropagation() : undefined}` to prevent tldraw from stealing clicks
- On blur/change: `editor.updateShape({ id, type, props: { name: newValue } })`

##### {FILL IN}:

- `pointerEvents: isEditing ? 'all' : 'none'` on wrapper div
- `editor.markEventAsHandled` or `stopPropagation` to keep focus in inputs
- Undo support comes free — `editor.updateShape` is already in the undo stack

---

#### Implementation Scaffold:

| File | Change |
|------|--------|
| `src/morph/morph-types.ts` | Replace `title`/`body` with `name`/`role`/`info`/`bio`/`avatarUrl`/`color` in MorphShapeProps + GraphNode |
| `src/morph/MorphShapeUtil.tsx` | New validators (`T.string` per field), Initials helper, 4-phase person card rendering, editing support |
| `src/morph/MorphTool.ts` | Update default props: `name: 'New Person', role: '', info: '', bio: '', avatarUrl: '', color: '#4ade80'` |
| `src/data/sample-graph.ts` | Replace lorem ipsum nodes with family tree data (12 nodes, edges) |
| `src/App.tsx` | Map new GraphNode fields (`name`, `role`, `info`, `bio`, `color`) to shape props in `handleMount` |

#### Files NOT Modified

| File | Why |
|------|-----|
| `src/engine/semantic-zoom.ts` | Only updates `w` and `h` — data-agnostic |
| `src/morph/morph-phases.ts` | Only defines dimensions — data-agnostic |
| `src/graph/graph-layout.ts` | Only reads shape geometry — data-agnostic |
| `src/ui/DetailSlider.tsx` | UI control, no shape awareness |
| `src/ui/GraphToggle.tsx` | UI control, no shape awareness |
| `src/ui/ui-overrides.ts` | Keyboard shortcuts, no shape awareness |

---

#### Testing Benchmarks

| Test | Pass Criteria |
|------|--------------|
| Phase 0 render | Colored initials circles (not black dots), arrows connecting |
| Phase 1 render | Initials circle + bold name in dark label rect, 32px tall |
| Phase 2 render | Mini profile card: initials + name + role + info, 400×300px |
| Phase 3 render | Full profile: large initials + name + role + info + bio, 800×600px |
| Phase transitions | Discrete snap between phases (no gradual fade) |
| Arrow tracking | Arrows remain connected through all 4 phase transitions |
| Force layout | Shapes spread apart when resized (webcola avoidOverlaps) |
| Editing (Card) | Double-click → inputs appear for name/role/info. Click away → display mode |
| Editing (Full) | Double-click → inputs + textarea for bio. Changes persist after blur |
| Undo | Ctrl+Z reverses edits made in edit mode |
| New morph shapes | M key places person card with defaults ("New Person", green circle) |
| Family colors | Makdesi=red, Coda=blue, Main=purple in initials circles |
| Graph toggle | G key still toggles force layout with new person nodes |

---

#### Timeline

- [x] Update `morph-types.ts` — new props interface + GraphNode
- [x] Update `MorphShapeUtil.tsx` — validators, Initials helper, 4-phase rendering
- [x] Add editing support in `MorphShapeUtil.tsx` — inputs/textarea in Card+Full
- [x] Update `MorphTool.ts` — default props for new person shape
- [x] Replace `sample-graph.ts` — family tree data (12 nodes + edges)
- [x] Update `App.tsx` — map new GraphNode fields to shape props + clear stale persistence
- [x] `npm run dev` — verify all 4 phases render correctly
- [ ] Test editing in Card and Full phases
- [ ] Test force layout with new person nodes
- [ ] Test undo/redo with edits

### Resolved Issues (2026-03-01):

- Old persisted shapes (title/body schema) caused `ValidationError: Expected string, got undefined` for `name` prop → added stale shape cleanup on mount in App.tsx (deletes existing shapes before creating new ones)
