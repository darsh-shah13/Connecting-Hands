# Hand Modeler Service

FastAPI service that ingests hand scan frames, extracts 21 landmarks per frame, smooths the
trajectories, generates a normalized 3D mesh, and returns a GLB + JSON metadata payload.

## Endpoints

### `POST /api/hands/scan`

Multipart upload of one or more image frames.

- **Form field**: `frames` (repeatable)
- **Response**: `{ "job_id": "...", "status": "queued" }`

### `GET /api/hands/{job_id}`

Returns job status. When completed, includes:

- `metadata`: normalized landmarks, fingertips/joints, finger lengths, articulation angles
- `glb_base64`: base64-encoded `model/gltf-binary` payload

## Vision dependencies (MediaPipe + OpenCV)

The default landmark detector uses **MediaPipe Hands** if installed.

### Python packages

```bash
poetry add --optional mediapipe opencv-python
# or
poetry install -E vision
```

### System packages (Linux)

Depending on your environment, OpenCV/MediaPipe may require the following shared libs:

```bash
sudo apt-get update
sudo apt-get install -y libgl1 libglib2.0-0
```

## Notes

- The current meshing implementation uses a **convex hull** over the landmark cloud via
  `trimesh` to produce a robust, watertight mesh with minimal dependencies.
- For higher fidelity, replace the meshing function with a surface reconstruction method
  (e.g. voxel + marching cubes, alpha shapes, or a template-fit hand model).
