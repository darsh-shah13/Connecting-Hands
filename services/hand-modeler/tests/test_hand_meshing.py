"""Unit tests for mesh generation and GLB serialization."""

from __future__ import annotations

import math

import numpy as np

from app.services.hands.meshing import export_mesh_glb, generate_hand_mesh


def test_mesh_generation_and_glb_export() -> None:
    points = np.array(
        [
            [math.cos(i * 0.5) * 0.25, math.sin(i * 0.5) * 0.25, (i - 10) * 0.01]
            for i in range(21)
        ],
        dtype=np.float64,
    )

    mesh = generate_hand_mesh(points)
    assert len(mesh.vertices) > 0
    assert len(mesh.faces) > 0
    assert mesh.is_watertight

    glb = export_mesh_glb(mesh)
    assert isinstance(glb, bytes)
    assert glb[:4] == b"glTF"
    assert len(glb) > 64
