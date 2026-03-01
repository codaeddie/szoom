import { GraphNode, GraphEdge } from '../morph/morph-types'

// ─────────────────────────────────────────────────
// SAMPLE GRAPH DATA
//
// 8 nodes + directed edges matching Orion's demo.
// Titles from screenshots. Body text is lorem ipsum
// matching the content visible in level80/level100.
//
// Initial positions approximate the level20 layout
// before force-directed takes over.
// ─────────────────────────────────────────────────

export const SAMPLE_NODES: GraphNode[] = [
  {
    id: 'ex-tempor',
    title: 'ex tempor',
    body: 'Ad et reprehenderit ea voluptate exercitation qui cillum sit. Incididunt veniam fugiat ut ullamco magna aute nisi cillum velit excepteur officia cupidatat enim in. Quis fugiat enim proident culpa est enim voluptate eiusmod aliquo non aliquip. Magna mollit Lorem enim. Incididunt tempor sunt magna. Quis velit dolor consequat dolore aute eiusmod sint ea labore sunt consectetur. Id ipsum laborum laborum eiusmod ipsum non amet ad culpa eu. Cillum deserunt irure.',
    x: 200,
    y: 100,
  },
  {
    id: 'dolor-ipsum',
    title: 'dolor ipsum',
    body: 'Nisi sint non officia ipsum anim sit. Non enim proident et nisi nisi incididunt cupidatat magna id sit. Elit esse ut officia consectetur occaecat labore aliqua aute occaecat. Qui in eiusmod aute adipisicing aute amet ert. Sint do commodo reprehenderit id adipisicing voluptate excepteur. Aliquip velit veniam magna minim aliqua labore. Voluptate nostrud dolor id in voluptate non elit ipsum nisi mollit ipsum. Anim.',
    x: 350,
    y: 60,
  },
  {
    id: 'laborum-ad-aute-duis',
    title: 'laborum ad aute duis',
    body: 'Deserunt incididunt deserunt labore id anim occaecat incididunt non do adipisicing consequat. Incididunt ipsum sit proident velit est nisi ea officia esse do pariatur. Sint eu irure est mollit aute Lorem et voluptate. Aliquip deserunt sint deserunt reprehenderit nulla fugiat mollit. Non occaecat eu duis sit culpa nisi adipisicing exercitation tempor eiusmod non. Duis aliqua qui commodo mollit consectetur mollit. Laborum laborum eu enim cillum ad dolore. Sunt amet ut adipisicing irure non quis deserunt exercitation. Ipsum qui sint exercitation. Anim mollit voluptate ullamco do officia consectetur tempor. Et fugiat elit qui proident do officia culpa sit labore nulla cupidatat labore tempor ert. Enim incididunt velit quis exercitation et ex adipisicing mollit consectetur dolore proident. Occaecat ex dolor labore enim. Aliquip pariatur esse labore dolor de veniam ea adipisicing. Aute in in laborum elit nisi nostrud eu esse. Id amet quis id eiusmod cupidatat et magna consectetur. Ea officia enim enim consectetur tempor. Labore eiusmod laborum reprehenderit nostrud et. Sint fugiat nisi representativeut eu officia voluptate deserunt deserunt dolore. Ullamco sunt et elit mollit fugiat fugiat. Voluptate pariatur cillum aute enim excepteur laborum. Excepteur labore nisi commodo fugiat cillum in officia ad proident do dolore adipisicing commodo adipisicing. Ut reprehenderit dolore adipisicing. Nisi commodo ex tempor ullamco sit cupidatat dolore nisi pariatur. Labore occaecat aliqua nostrud nulla cillum labore commodo magna deserunt nulla commodo minim. Labore consequat Lorem et do amet exercitation proident elit dolor quis duis Lorem. Enim aute aliquip nulla exercitation pariatur irure eiusmod enim id excepteur nostrud. Ipsum cupidatat sit proident id duis eu nulla magna sunt enim et nisi amet excepteur. Exercitation elit anim est in ad labore culpa. Cupidatat culpa in ipsum ipsum ullamco qui dolor ullamco adipisicing magna ad anim cupidatat. Labore do enim adipisicing nostrud et dolore enim in. Nisi eiusmod eiusmod esse eiusmod sit elit adipisicing. Irure nisi tempor pariatur sunt nulla.',
    x: 300,
    y: 200,
  },
  {
    id: 'dolore-excepteur',
    title: 'dolore excepteur',
    body: 'Velit nisi occaecat veniam eiusmod do exercitation eu consectetur adipisicing velit elit dolor. Voluptate reprehenderit nisi ex. Quis consectetur labore in exercitation fugiat irure. Do minim consectetur minim dolor consectetur labore anim irure commodo ea aute dolor in. Sunt duis non laborum. Sit voluptate magna amet nostrud reprehenderit eiusmod ut et labore ex amet do. Quis excepteur cupidatat labore aliqua sit cillum officia amet.',
    x: 550,
    y: 200,
  },
  {
    id: 'culpa-tempor',
    title: 'culpa tempor',
    body: 'Nostrud labore nisi mollit ut cupidatat incididunt voluptate. Ipsum ut deserunt consectetur. Elit proident labore deserunt dolore culpa laborum ex mollit in tempor est non. Reprehenderit occaecat non fugiat est. Ut mollit ad tempor elit labore deserunt occaecat laborum duis amet cupidatat laborum. Nulla incididunt adipisicing amet commodo cupidatat. Labore sit reprehenderit sit. Reprehenderit quis magna eu commodo. Ex quis elit pariatur.',
    x: 700,
    y: 200,
  },
  {
    id: 'do-aliqua-consectetur',
    title: 'do aliqua consectetur',
    body: 'Proident fugiat dolor sit dolor ea proident amet sit. Excepteur eiusmod cillum aute adipisicing culpa labore occaecat dolore eu anim. Officia mollit nisi eiusmod commodo sint et. Do ullamco do velit in laborum sint. Deserunt magna deserunt officia tempor exercitation. Cupidatat quis tempor deserunt duis in et nostrud tempor mollit sit labore. Voluptate mollit deserunt esse consequat. Cupidatat magna voluptate nulla dolor commodo. Irure.',
    x: 280,
    y: 320,
  },
  {
    id: 'excepteur-occaecat',
    title: 'excepteur occaecat',
    body: 'Labore veniam elit nisi. Cupidatat tempor id cillum et. Deserunt ad voluptate fugiat sint labore ad do officia nostrud voluptate occaecat est do. Exercitation qui officia sit ex nostrud velit cillum eiusmod dolore ipsum commodo aliqua consequat et anim. Incididunt aliquip incididunt sit ex ea proident in deserunt in. Mollit minim qui magna Lorem deserunt sunt est mollit. Adipisicing ullamco ea anim voluptate sint culpa id consequat irure.',
    x: 240,
    y: 420,
  },
  {
    id: 'consectetur-id-excepteur-ullamco',
    title: 'consectetur id excepteur ullamco',
    body: 'Fugiat magna ea est occaecat aliqua ex sint. In culpa labore ut velit tempor laborum cillum tempor est commodo nulla deserunt qui reprehenderit. Cillum ad reprehenderit nisi quis culpa dolor aliquip. Consectetur cupidatat sunt et et. Magna sunt et officia veniam. Irure enim.',
    x: 200,
    y: 520,
  },
]

// ─────────────────────────────────────────────────
// EDGES — directed arrows matching Orion's demo
// Reconstructed from the arrow directions visible
// in the reference screenshots.
// ─────────────────────────────────────────────────

export const SAMPLE_EDGES: GraphEdge[] = [
  { from: 'dolor-ipsum', to: 'ex-tempor' },
  { from: 'dolor-ipsum', to: 'laborum-ad-aute-duis' },
  { from: 'dolore-excepteur', to: 'laborum-ad-aute-duis' },
  { from: 'culpa-tempor', to: 'dolore-excepteur' },
  { from: 'laborum-ad-aute-duis', to: 'do-aliqua-consectetur' },
  { from: 'do-aliqua-consectetur', to: 'excepteur-occaecat' },
  { from: 'excepteur-occaecat', to: 'consectetur-id-excepteur-ullamco' },
  // Cross-link visible in level0 — dolore-excepteur fans into do-aliqua area
  { from: 'dolore-excepteur', to: 'do-aliqua-consectetur' },
]
