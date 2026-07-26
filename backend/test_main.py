"""Tests for main.py — the is_dag helper and the /pipelines/parse endpoint."""

from fastapi.testclient import TestClient

from main import EdgeModel, NodeModel, app, is_dag

client = TestClient(app)


def _nodes(*ids):
    return [NodeModel(id=node_id) for node_id in ids]


def _edges(*pairs):
    return [EdgeModel(source=src, target=tgt) for src, tgt in pairs]


# --------------------------------------------------------------------------- #
# is_dag — unit tests
# --------------------------------------------------------------------------- #


def test_empty_pipeline_is_dag():
    """An empty graph is vacuously a DAG."""
    assert is_dag([], []) is True


def test_single_node_no_edges_is_dag():
    assert is_dag(_nodes("a"), []) is True


def test_nodes_without_edges_is_dag():
    assert is_dag(_nodes("a", "b", "c"), []) is True


def test_simple_chain_is_dag():
    # a -> b -> c
    assert is_dag(_nodes("a", "b", "c"), _edges(("a", "b"), ("b", "c"))) is True


def test_diamond_is_dag():
    # a -> b, a -> c, b -> d, c -> d
    nodes = _nodes("a", "b", "c", "d")
    edges = _edges(("a", "b"), ("a", "c"), ("b", "d"), ("c", "d"))
    assert is_dag(nodes, edges) is True


def test_simple_cycle_is_not_dag():
    # a -> b -> c -> a
    nodes = _nodes("a", "b", "c")
    edges = _edges(("a", "b"), ("b", "c"), ("c", "a"))
    assert is_dag(nodes, edges) is False


def test_two_node_cycle_is_not_dag():
    # a -> b -> a
    assert is_dag(_nodes("a", "b"), _edges(("a", "b"), ("b", "a"))) is False


def test_self_loop_is_not_dag():
    # a -> a keeps in-degree >= 1 forever
    assert is_dag(_nodes("a"), _edges(("a", "a"))) is False


def test_cycle_with_extra_acyclic_nodes_is_not_dag():
    # x -> y (acyclic) plus a -> b -> a (cycle)
    nodes = _nodes("x", "y", "a", "b")
    edges = _edges(("x", "y"), ("a", "b"), ("b", "a"))
    assert is_dag(nodes, edges) is False


def test_dangling_edge_referencing_unknown_node_is_skipped():
    # Edge target "ghost" is not a node; it must not crash and the graph
    # (just node "a") remains a DAG.
    nodes = _nodes("a")
    edges = _edges(("a", "ghost"))
    assert is_dag(nodes, edges) is True


def test_dangling_edge_does_not_mask_real_cycle():
    nodes = _nodes("a", "b")
    edges = _edges(("a", "b"), ("b", "a"), ("a", "ghost"))
    assert is_dag(nodes, edges) is False


def test_duplicate_edges_still_dag():
    nodes = _nodes("a", "b")
    edges = _edges(("a", "b"), ("a", "b"))
    assert is_dag(nodes, edges) is True


# --------------------------------------------------------------------------- #
# /pipelines/parse — endpoint tests
# --------------------------------------------------------------------------- #


def test_parse_empty_pipeline():
    resp = client.post("/pipelines/parse", json={"nodes": [], "edges": []})
    assert resp.status_code == 200
    assert resp.json() == {"num_nodes": 0, "num_edges": 0, "is_dag": True}


def test_parse_acyclic_pipeline():
    payload = {
        "nodes": [{"id": "a"}, {"id": "b", "type": "custom"}, {"id": "c"}],
        "edges": [{"source": "a", "target": "b"}, {"source": "b", "target": "c"}],
    }
    resp = client.post("/pipelines/parse", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"num_nodes": 3, "num_edges": 2, "is_dag": True}


def test_parse_cyclic_pipeline():
    payload = {
        "nodes": [{"id": "a"}, {"id": "b"}],
        "edges": [{"source": "a", "target": "b"}, {"source": "b", "target": "a"}],
    }
    resp = client.post("/pipelines/parse", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"num_nodes": 2, "num_edges": 2, "is_dag": False}


def test_parse_counts_dangling_edges_toward_num_edges():
    # The dangling edge is skipped for cycle detection but still counted.
    payload = {
        "nodes": [{"id": "a"}],
        "edges": [{"source": "a", "target": "ghost"}],
    }
    resp = client.post("/pipelines/parse", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"num_nodes": 1, "num_edges": 1, "is_dag": True}


def test_parse_node_type_is_optional():
    payload = {"nodes": [{"id": "solo"}], "edges": []}
    resp = client.post("/pipelines/parse", json=payload)
    assert resp.status_code == 200
    assert resp.json()["num_nodes"] == 1


def test_parse_missing_required_field_returns_422():
    # Node without an "id" is invalid per NodeModel.
    payload = {"nodes": [{"type": "custom"}], "edges": []}
    resp = client.post("/pipelines/parse", json=payload)
    assert resp.status_code == 422


def test_parse_missing_body_returns_422():
    resp = client.post("/pipelines/parse", json={})
    assert resp.status_code == 422
