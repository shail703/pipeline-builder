# Pipeline Builder

A visual, node-based pipeline editor. Drag nodes onto a canvas, wire them together,
and submit the graph to a backend that validates whether it forms a DAG (directed
acyclic graph).

Built with **React + ReactFlow** on the frontend and **FastAPI** on the backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Features](#features)
  - [Node Abstraction](#1-node-abstraction)
  - [Design System & Theming](#2-design-system--theming)
  - [Text Node](#3-text-node)
  - [Backend Integration](#4-backend-integration)
- [Node Reference](#node-reference)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Design Decisions](#design-decisions)

---

## Overview

The app presents a toolbar of draggable node types above an infinite canvas. Nodes are
dropped onto the canvas, configured inline, and connected via handles. Pressing
**Submit** serializes the graph, POSTs it to the backend, and reports back the node
count, edge count, and whether the pipeline is a valid DAG.

**Flow:**

```
Toolbar (drag)  →  Canvas (drop + connect)  →  Zustand store
                                                    │
                                              Submit button
                                                    │
                                       POST /pipelines/parse
                                                    │
                                     FastAPI + Kahn's algorithm
                                                    │
                                 { num_nodes, num_edges, is_dag }
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI framework | React | 18.2 |
| Canvas / graph | ReactFlow | 11.8 |
| State management | Zustand | 4.4 |
| Build tooling | react-scripts (CRA) | 5.0.1 |
| Styling | CSS Modules + CSS custom properties | — |
| Backend framework | FastAPI | latest |
| ASGI server | Uvicorn (standard) | latest |
| Validation | Pydantic | latest |
| Frontend tests | Jest + React Testing Library | — |
| Backend tests | pytest + httpx | — |

---

## Project Structure

```
Vectorshift/
├── backend/
│   ├── main.py               # FastAPI app, Pydantic models, is_dag()
│   ├── test_main.py          # 19 tests: is_dag unit tests + endpoint tests
│   └── Requirements.txt      # Python dependencies
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── package.json
    └── src/
        ├── index.js              # React entry point
        ├── App.js                # Layout: toggle + toolbar + canvas + submit
        ├── store.js              # Zustand store (nodes, edges, ID generation)
        ├── ui.js                 # ReactFlow canvas, nodeTypes registry, drop handling
        ├── toolbar.js            # Node tray
        ├── draggableNode.js      # Draggable chip in the toolbar
        ├── submit.js             # Serializes graph, POSTs to backend
        ├── ThemeToggle.js        # Light/dark switch
        ├── useThemeVar.js        # Reads CSS tokens into JS props
        ├── tokens.css            # Design tokens (colors, spacing, type, motion)
        ├── index.css             # Global reset + token import
        ├── *.module.css          # Scoped component styles
        └── nodes/
            ├── BaseNode.js       # Shared node shell (presentation)
            ├── useNodeBase.js    # Shared node logic (state + handle layout)
            ├── inputNode.js
            ├── outputNode.js
            ├── llmNode.js
            ├── textNode.js       # Custom: auto-resize + variable parsing
            ├── filterNode.js
            ├── mathNode.js
            ├── apiNode.js
            ├── noteNode.js
            └── mergeNode.js
```

---

## Quick Start

Two terminals are needed — one per service.

**Terminal 1 — backend (port 8000):**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r Requirements.txt
uvicorn main:app --reload
```

**Terminal 2 — frontend (port 3000):**

```bash
cd frontend
npm install
npm start
```

Open <http://localhost:3000>.

> Full prerequisites, platform notes, and troubleshooting live in **[SETUP.md](SETUP.md)**.

---

## Features

### 1. Node Abstraction

Nine node types share a single implementation. The abstraction is split into two pieces
so that logic and presentation can be reused independently:

- **`useNodeBase.js`** — a hook owning field state and handle geometry. It seeds field
  values from each field's `defaultValue`, exposes an `updateField(name, value)` setter,
  and computes evenly-spaced handle positions.
- **`BaseNode.js`** — the visual shell. It renders the header, the declared fields
  (`text`, `select`, `textarea`), an optional custom `body`, and the input/output
  handles returned by the hook.

A complete node becomes a declaration rather than a component:

```jsx
export const MathNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Math"
    fields={[{
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: ['Add', 'Subtract', 'Multiply', 'Divide'],
      defaultValue: data?.operation || 'Add',
    }]}
    inputs={[{ id: 'a' }, { id: 'b' }]}
    outputs={[{ id: 'result' }]}
  />
);
```

**Handle positioning is automatic.** Handles are spread with
`top = (index + 1) / (count + 1) × 100%`, so one handle sits at 50%, two at 33%/67%,
three at 25%/50%/75% — no manual offsets anywhere. Handle IDs are namespaced as
`` `${nodeId}-${handleId}` `` to stay unique across the canvas.

Two of the nine nodes exist specifically to prove the abstraction holds at the edges:

- **Note** — a node with *zero* handles (a sticky note).
- **Merge** — a node with *three* inputs, exercising the auto-spacing math.

### 2. Design System & Theming

All styling flows from `tokens.css`: colors, typography scale, an 8px spacing rhythm,
radii, shadows, and motion durations. Components consume tokens through CSS Modules,
so there are no hard-coded hex values in component styles.

Light/dark mode works by flipping a single `data-theme` attribute on `<html>`. Every
token responds to that attribute, so the entire app re-themes from one switch. The
choice persists to `localStorage` and falls back to the OS `prefers-color-scheme`
setting on first visit.

One gap needed bridging: ReactFlow's `<Background />` takes a color **string prop**,
not CSS, so it can't inherit a token automatically. The `useThemeVar` hook solves this
by reading a custom property via `getComputedStyle` and re-reading it through a
`MutationObserver` whenever `data-theme` changes — keeping JS-driven colors in sync
without coupling components to the toggle's state.

### 3. Text Node

The Text node carries behavior the others don't:

**Auto-resizing.** Height grows with content via a `useLayoutEffect` that resets
`scrollHeight` on every keystroke. Width is estimated from the longest line and clamped
between 220px and 480px, so the node grows with the text but never runs away.

**Variable detection.** Text is scanned for `{{ variableName }}` patterns using:

```js
/\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g
```

Each unique match becomes a new input handle on the left edge, created and removed
live as you type. The regex enforces valid JavaScript identifier rules, so `{{ 123 }}`
and `{{ my-var }}` are correctly ignored rather than producing junk handles. Repeated
variables de-duplicate into a single handle via a `Set`.

### 4. Backend Integration

**Submit** pulls the current graph from the store, trims it to just what the backend
needs (node `id`/`type`, edge `source`/`target`), and POSTs it. The response is
surfaced in an alert reporting node count, edge count, and DAG validity in plain
language.

Failure paths are handled explicitly: a non-`ok` HTTP status and a network failure both
produce a readable message that tells the user the backend may not be running, along
with the command to start it.

The DAG check uses **Kahn's algorithm** — repeatedly remove nodes with no incoming
edges; if every node can be removed, there is no cycle. Three edge cases are handled
deliberately:

- **Self-loops** (`a → a`) are caught — such a node's in-degree never reaches zero.
- **Dangling edges** referencing a node not in the node list are skipped during
  in-degree bookkeeping, so a stale edge can't crash the endpoint. They still count
  toward `num_edges`, since that's the literal edge count.
- **Empty pipelines** are vacuously a DAG.

---

## Node Reference

| Node | Inputs | Outputs | Configurable Fields |
|---|---|---|---|
| **Input** | — | `value` | Name (text), Type (Text / File) |
| **Output** | `value` | — | Name (text), Type (Text / Image) |
| **LLM** | `system`, `prompt` | `response` | — |
| **Text** | dynamic, from `{{variables}}` | `output` | Text (auto-resizing textarea) |
| **Filter** | `data` | `filtered` | Condition (text) |
| **Math** | `a`, `b` | `result` | Operation (Add / Subtract / Multiply / Divide) |
| **API Call** | `payload` | `response` | URL (text), Method (GET / POST / PUT / DELETE) |
| **Note** | — | — | Note (textarea) |
| **Merge** | `a`, `b`, `c` | `merged` | Strategy (Concat / Join / Overwrite) |

---

## API Reference

### `POST /pipelines/parse`

Validates a pipeline graph.

**Request body**

```json
{
  "nodes": [
    { "id": "customInput-1", "type": "customInput" },
    { "id": "llm-1",         "type": "llm" }
  ],
  "edges": [
    { "source": "customInput-1", "target": "llm-1" }
  ]
}
```

`type` is optional on nodes. Extra fields are ignored by Pydantic.

**Response `200`**

```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

| Field | Type | Meaning |
|---|---|---|
| `num_nodes` | `int` | Count of nodes submitted |
| `num_edges` | `int` | Count of edges submitted (including dangling ones) |
| `is_dag` | `bool` | `true` if the graph contains no cycles |

**Try it manually**

```bash
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes":[{"id":"a"},{"id":"b"}],"edges":[{"source":"a","target":"b"}]}'
```

Interactive docs are served at <http://localhost:8000/docs> while the backend runs.

**CORS:** the backend allows only `http://localhost:3000` and `http://127.0.0.1:3000`.
Serving the frontend from a different origin requires adding it to `allow_origins` in
`main.py`.

---

## Testing

**61 tests total** — 42 frontend, 19 backend.

### Backend

```bash
cd backend
source venv/bin/activate
pytest -q
```

Covers `is_dag` directly (empty graphs, chains, diamonds, simple cycles, two-node
cycles, self-loops, cycles mixed with acyclic components, dangling edges) plus the
`/pipelines/parse` endpoint end-to-end.

### Frontend

```bash
cd frontend
npm test              # watch mode
CI=true npm test      # single run, useful for CI
```

| Suite | What it covers |
|---|---|
| `store.test.js` | Per-type ID counters, node/edge changes, `onConnect` edge shape, scoped field updates |
| `useNodeBase.test.js` | Default seeding, isolated field updates, handle ID namespacing, even spacing |
| `BaseNode.test.js` | Field rendering by type, typing, handle counts, custom body |
| `textNode.test.js` | Variable parsing, de-duplication, malformed-token rejection, output handle |
| `nodes.test.js` | Per-node defaults and handle wiring |
| `submit.test.js` | Payload shape, DAG/non-DAG alerts, unreachable backend, non-ok status |
| `ThemeToggle.test.js` | Restore from storage, toggle + persist, OS-preference fallback |
| `useThemeVar.test.js` | Token reads, fallback, re-read on theme change |
| `draggableNode.test.js` | Label rendering, `dataTransfer` payload on drag start |

---

## Design Decisions

**Why split `useNodeBase` from `BaseNode`?**
Separating logic from presentation means a node that needs a different shell — the Text
node, with its auto-resize and dynamic handles — can still reuse the handle-layout math
and state helpers without inheriting a layout it doesn't want. `textNode.js` imports the
hook but renders its own markup.

**Why tokens instead of a component library?**
The pipeline canvas has unusual layout needs (nodes, handles, edges) that most component
libraries fight rather than help. A small token layer gives consistency and free theming
without pulling in a dependency whose primitives don't map to the problem.

**Why a slim submit payload?**
The store holds ReactFlow's full node objects — positions, dimensions, drag state,
selection flags. The backend needs identity and connectivity only, so `submit.js` maps
down to `{ id, type }` and `{ source, target }`. This keeps the request small and the
API contract narrow.

**Why not persist the pipeline?**
Nothing here writes to a database. The pipeline lives in memory for the session — the
task is graph construction and validation, not storage. Adding persistence would mean a
new store slice plus save/load endpoints.