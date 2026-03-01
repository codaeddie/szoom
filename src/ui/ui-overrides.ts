import { TLUiOverrides } from 'tldraw'

// ─────────────────────────────────────────────────
// UI OVERRIDES
//
// G key toggles graph layout, matching Orion's demo.
// We dispatch a custom event that App.tsx listens to.
// ─────────────────────────────────────────────────

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools['morph'] = {
      id: 'morph',
      label: 'Morph' as any,
      icon: 'blob' as any,
      kbd: 'm',
      onSelect() {
        editor.setCurrentTool('morph')
      },
    }
    return tools
  },
  actions(_editor, actions) {
    // Remove G key from tldraw's built-in geo tool (action id: 'select-geo-tool')
    if (actions['select-geo-tool']) {
      actions['select-geo-tool'] = { ...actions['select-geo-tool'], kbd: '' }
    }
    actions['toggle-graph'] = {
      id: 'toggle-graph',
      label: 'Toggle Graph Layout' as any,
      readonlyOk: true,
      kbd: 'g',
      onSelect() {
        window.dispatchEvent(new CustomEvent('szoom:toggle-graph'))
      },
    }
    return actions
  },
}
