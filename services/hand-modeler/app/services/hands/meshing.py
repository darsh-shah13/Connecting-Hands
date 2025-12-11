"""Point-cloud-to-mesh conversion and GLB serialization."""

from __future__ import annotations

from typing import Any

import numpy as np
from numpy.typing import NDArray


def generate_hand_mesh(points: NDArray[np.float64]) -> Any:
    """Generate a watertight mesh from a sparse landmark cloud.

    The current implementation uses a convex hull for robustness and minimal
    dependencies.

    Returns:
        A trimesh.Trimesh instance.
    """

    import trimesh  # type: ignore[import-untyped]

    if points.shape[1] != 3:
        raise ValueError("Expected points with shape (N, 3)")

    cloud = trimesh.points.PointCloud(points)
    mesh = cloud.convex_hull
    if mesh.is_empty:
        raise ValueError("Generated empty mesh")

    mesh.remove_degenerate_faces()
    mesh.remove_unreferenced_vertices()
    mesh.process(validate=True)

    return mesh


def export_mesh_glb(mesh: Any) -> bytes:
    """Export a trimesh mesh to binary glTF (GLB)."""

    glb = mesh.export(file_type="glb")
    if isinstance(glb, bytes):
        return glb

    if isinstance(glb, str):
        return glb.encode("utf-8")

    raise TypeError(f"Unexpected GLB export type: {type(glb)}")
