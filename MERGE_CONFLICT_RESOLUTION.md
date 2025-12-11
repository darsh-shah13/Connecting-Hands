# Merge Conflict Resolution Guide

## Problem Summary

The `feat/hand-scan-capture` branch cannot be automatically merged to `main` because of conflicting changes in the backend implementation. The main branch still contains the old hand processing architecture while the feature branch replaces it with a simplified, focused implementation.

## Conflicts Overview

### 1. **Main File Conflict: `services/hand-modeler/app/main.py`**

**Main branch has:**
```python
from app.routers import health, hand_detection, hands

app.include_router(hands.router, prefix="/api", tags=["hands"])
```

**Feature branch has:**
```python
from app.routers import health, hand_detection, hand_scan

app.include_router(hand_scan.router, prefix="/api", tags=["hand-scan"])
```

**Resolution:** Use feature branch version (replace `hands` with `hand_scan`)

### 2. **Deleted Files**

The following files exist on main but should be deleted:
- `services/hand-modeler/app/jobs/store.py`
- `services/hand-modeler/app/jobs/__init__.py`
- `services/hand-modeler/app/routers/hands.py`
- `services/hand-modeler/app/services/hands/detector.py`
- `services/hand-modeler/app/services/hands/job_processor.py`
- `services/hand-modeler/app/services/hands/meshing.py`
- `services/hand-modeler/app/services/hands/processing.py`
- `services/hand-modeler/app/services/hands/__init__.py`
- `services/hand-modeler/app/services/__init__.py`
- `services/hand-modeler/tests/test_hand_meshing.py`
- `services/hand-modeler/tests/test_hand_processing.py`
- `services/hand-modeler/tests/test_hands_api.py`

**Resolution:** Delete all above files during merge

### 3. **Changed Files: `services/hand-modeler/app/models/hand_scan.py`**

Main branch has complex models with:
- `HandLandmark` class
- `HandMeshMetadata` class
- `HandScanCreateResponse` class
- `HandScanStatusResponse` class

Feature branch has simplified models:
- `DeviceMetadata` class
- `HandScanRequest` class
- `HandScanResponse` class

**Resolution:** Use feature branch version (completely replace with new implementation)

### 4. **Changed File: `services/hand-modeler/app/config.py`**

Main branch includes:
```python
# Storage settings
jobs_dir: str = "./data/jobs"
```

Feature branch removes this setting.

**Resolution:** Remove the storage settings section

### 5. **Changed File: `.gitignore`**

Main branch includes:
```
# Backend runtime data
services/hand-modeler/data/
```

Feature branch removes this line.

**Resolution:** Remove the backend runtime data section

## Step-by-Step Merge Instructions

### Option A: Manual Merge (Recommended for Understanding)

```bash
# 1. Checkout main branch
git checkout main

# 2. Pull latest from origin
git pull origin main

# 3. Start the merge
git merge feat/hand-scan-capture

# You will see merge conflicts. Resolve each one:
```

For each conflicting file, follow these resolutions:

#### Step 1: Resolve `services/hand-modeler/app/main.py`
```bash
# Edit the file and change:
# FROM: from app.routers import health, hand_detection, hands
# TO:   from app.routers import health, hand_detection, hand_scan

# FROM: app.include_router(hands.router, ...)
# TO:   app.include_router(hand_scan.router, ...)

git add services/hand-modeler/app/main.py
```

#### Step 2: Resolve `services/hand-modeler/app/models/hand_scan.py`
```bash
# Keep the feature branch version (simpler, cleaner)
# It's located at services/hand-modeler/app/models/hand_scan.py

git add services/hand-modeler/app/models/hand_scan.py
```

#### Step 3: Resolve `services/hand-modeler/app/config.py`
```bash
# Keep the feature branch version which removes jobs_dir setting

git add services/hand-modeler/app/config.py
```

#### Step 4: Resolve `.gitignore`
```bash
# Keep the feature branch version which removes the data/ line

git add .gitignore
```

#### Step 5: Delete Old Files
```bash
# Delete all old hand processing files
rm -rf services/hand-modeler/app/jobs
rm -rf services/hand-modeler/app/services
rm services/hand-modeler/tests/test_hand_meshing.py
rm services/hand-modeler/tests/test_hand_processing.py
rm services/hand-modeler/tests/test_hands_api.py

# Stage the deletions
git add -A
```

#### Step 6: Complete the Merge
```bash
# Verify all conflicts are resolved
git status

# Complete the merge
git commit -m "Merge feat/hand-scan-capture into main

Replace old hand processing architecture with simplified hand scan capture flow.
- Removed complex job processing system
- Removed mesh generation
- Kept focused scan upload and landmark detection
- Simplified Pydantic models
- Updated API routes"

# Push to origin
git push origin main
```

### Option B: Automated Merge Strategy (If Available)

```bash
# If your Git platform supports merge strategies:
git checkout main
git pull origin main
git merge -X ours feat/hand-scan-capture
# Then manually resolve the remaining conflicts
```

### Option C: GitHub/GitLab Web Interface

If using GitHub or GitLab:

1. Create a Pull Request from `feat/hand-scan-capture` → `main`
2. The platform will show conflicts
3. Use the web interface conflict resolver
4. For each file, choose the feature branch version
5. Complete the merge with a clear commit message

## Files to Keep/Delete Summary

### Keep (from feature branch)
- ✅ `apps/mobile/` (all new files)
- ✅ `services/hand-modeler/app/routers/hand_scan.py` (new)
- ✅ `services/hand-modeler/app/models/hand_scan.py` (simplified)
- ✅ `services/hand-modeler/tests/test_hand_scan.py` (new)
- ✅ Updated `services/hand-modeler/app/main.py`
- ✅ Updated `services/hand-modeler/app/config.py`
- ✅ Documentation files (MD files in root)

### Delete (old implementation)
- ❌ `services/hand-modeler/app/jobs/`
- ❌ `services/hand-modeler/app/services/hands/`
- ❌ `services/hand-modeler/app/routers/hands.py`
- ❌ `services/hand-modeler/tests/test_hands_api.py`
- ❌ `services/hand-modeler/tests/test_hand_meshing.py`
- ❌ `services/hand-modeler/tests/test_hand_processing.py`

## Verification After Merge

After merging, verify the changes:

```bash
# 1. Check main branch is current
git log --oneline -1

# 2. Verify file structure
find services/hand-modeler/app -name "*.py" | sort
# Should NOT include: jobs/, services/hands/
# Should include: routers/hand_scan.py

# 3. Verify imports in main.py
grep "from app.routers import" services/hand-modeler/app/main.py
# Should show: health, hand_detection, hand_scan

# 4. Run tests
cd services/hand-modeler
poetry run pytest tests/test_hand_scan.py -v

# 5. Check mobile app
cd apps/mobile
npm test

# 6. Start services
pnpm dev
```

## Why This Approach?

The `feat/hand-scan-capture` branch represents a **strategic simplification** of the hand processing system:

**Old Approach (Main Branch)**
- Complex job queue system
- Async processing with status checks
- 3D mesh generation (GLB output)
- Multiple test suites
- Heavy dependency on MediaPipe, OpenCV, trimesh

**New Approach (Feature Branch)**
- Simple synchronous upload
- Immediate landmark detection
- Focused on mobile capture experience
- Single test suite
- Lightweight, focused implementation

This is an intentional architectural change, not a bug fix. The merge resolves this architectural shift.

## Post-Merge Cleanup

After successful merge:

```bash
# Delete the feature branch (optional, but recommended)
git branch -d feat/hand-scan-capture
git push origin --delete feat/hand-scan-capture

# Document the merge in your project
echo "Merged hand scan capture feature - simplified architecture" >> CHANGELOG.md

# Tag the merge point (optional)
git tag -a v0.1.0-hand-scan -m "Hand scan capture feature merged"
```

## Troubleshooting

### Issue: Merge fails with cherry-pick conflicts
**Solution:** Use the step-by-step manual approach above

### Issue: Can't find a file during merge
**Solution:** Use `git status` to see what's conflicted, then resolve one by one

### Issue: Tests fail after merge
**Solution:** Ensure all old test files are deleted:
```bash
rm services/hand-modeler/tests/test_hand_*.py
git add -A
```

### Issue: Import errors after merge
**Solution:** Verify `app/main.py` imports `hand_scan` not `hands`

## Support

If you encounter issues during merge:

1. Check `MERGE_INSTRUCTIONS.md` for general merge guidelines
2. Review the changes in the feature branch (`git diff main feat/hand-scan-capture`)
3. Consult the detailed file changes above
4. Run tests after each merge step to identify issues early

---

**Last Updated**: December 11, 2024
**Branch**: feat/hand-scan-capture
**Target**: main
**Status**: Ready for manual merge
