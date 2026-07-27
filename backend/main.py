import os
from typing import List, Optional
from collections import defaultdict, deque

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Local development origins are always permitted.
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# The deployed frontend origin is supplied by the host environment, e.g.
# FRONTEND_ORIGIN=https://pipeline-builder.vercel.app (no trailing slash).
frontend_origin = os.environ.get("FRONTEND_ORIGIN")
if frontend_origin:
    allowed_origins.append(frontend_origin)

# Vercel gives every branch and pull request its own preview URL, such as
# https://pipeline-builder-a1b2c3-user.vercel.app. An exact-match list can
# never cover those, so match them by pattern instead.
#
# Note: allow_origins=["*"] is NOT a valid shortcut here — browsers reject a
# wildcard origin whenever allow_credentials is True.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://pipeline-builder.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NodeModel(BaseModel):
    id: str
    type: Optional[str] = None


class EdgeModel(BaseModel):
    source: str
    target: str


class PipelineModel(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]


def is_dag(nodes: List[NodeModel], edges: List[EdgeModel]) -> bool:
    """Return True if the graph has no cycles (i.e. it's a DAG).

    Uses Kahn's algorithm: repeatedly remove nodes with no incoming
    edges. If we can remove every node, there's no cycle. If some nodes
    are never removable, they're part of a cycle.

    - Self-loops (source == target) are correctly detected as cycles:
      such a node always keeps in-degree >= 1 and is never removed.
    - Edges that reference a node not in the node list (e.g. a dangling
      edge left behind after a handle was deleted on the frontend) are
      skipped, so they can't crash the in-degree bookkeeping. They still
      count toward num_edges, since that's the literal edge count.
    - An empty pipeline is vacuously a DAG.
    """
    node_ids = {node.id for node in nodes}
    adjacency = defaultdict(list)
    in_degree = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        if edge.source in node_ids and edge.target in node_ids:
            adjacency[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    queue = deque(node_id for node_id in node_ids if in_degree[node_id] == 0)
    visited_count = 0

    while queue:
        current = queue.popleft()
        visited_count += 1
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited_count == len(node_ids)


@app.get("/")
def health():
    """Liveness probe. Also used to warm the container on free hosting tiers,
    which sleep after a period of inactivity."""
    return {"status": "ok"}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: PipelineModel):
    return {
        "num_nodes": len(pipeline.nodes),
        "num_edges": len(pipeline.edges),
        "is_dag": is_dag(pipeline.nodes, pipeline.edges),
    }
