# Merge Checklist - Hand Scan Capture Feature

## Pre-Merge Preparation

- [ ] Read `SOLUTION_SUMMARY.md` (2 min)
- [ ] Read `MERGE_CONFLICT_RESOLUTION.md` (5 min)
- [ ] Ensure working tree is clean: `git status`
- [ ] Ensure you have merge permissions to main branch
- [ ] Backup current state or have a recovery plan

## Merge Execution

### Step 1: Update Local Repository
- [ ] `git checkout main`
- [ ] `git pull origin main`
- [ ] Verify you're on main branch: `git branch`

### Step 2: Start Merge
- [ ] `git merge feat/hand-scan-capture`
- [ ] Note any conflicts shown

### Step 3: Resolve Conflicts

#### Conflict: `services/hand-modeler/app/main.py`
- [ ] Open the file
- [ ] Change: `from app.routers import ... hands` → `... hand_scan`
- [ ] Change: `app.include_router(hands.router, ...)` → `app.include_router(hand_scan.router, ...)`
- [ ] Save file
- [ ] `git add services/hand-modeler/app/main.py`

#### Conflict: `services/hand-modeler/app/models/hand_scan.py`
- [ ] Keep feature branch version (simpler, cleaner)
- [ ] `git add services/hand-modeler/app/models/hand_scan.py`

#### Conflict: `services/hand-modeler/app/config.py`
- [ ] Keep feature branch version (removes jobs_dir)
- [ ] `git add services/hand-modeler/app/config.py`

#### Conflict: `.gitignore`
- [ ] Keep feature branch version (removes data/ line)
- [ ] `git add .gitignore`

### Step 4: Delete Old Files

```bash
rm -rf services/hand-modeler/app/jobs
rm -rf services/hand-modeler/app/services
rm services/hand-modeler/tests/test_hand_meshing.py
rm services/hand-modeler/tests/test_hand_processing.py
rm services/hand-modeler/tests/test_hands_api.py
git add -A
```

- [ ] Confirmed old job files deleted
- [ ] Confirmed old services files deleted
- [ ] Confirmed old test files deleted
- [ ] Staged all deletions with `git add -A`

### Step 5: Complete Merge

```bash
git status  # Verify all conflicts resolved
git commit -m "Merge feat/hand-scan-capture: simplified hand scan architecture"
git push origin main
```

- [ ] All conflicts resolved
- [ ] All deletions staged
- [ ] Commit message is clear
- [ ] Successfully pushed to origin/main

## Post-Merge Verification

### Step 1: Verify File Structure
```bash
# Check routers
ls services/hand-modeler/app/routers/
# Should have: hand_scan.py, hand_detection.py, health.py, __init__.py
# Should NOT have: hands.py
```
- [ ] hand_scan.py exists
- [ ] hand_detection.py exists  
- [ ] health.py exists
- [ ] hands.py does NOT exist

### Step 2: Verify Import Statements
```bash
grep "from app.routers import" services/hand-modeler/app/main.py
# Should show: health, hand_detection, hand_scan
# Should NOT show: hands
```
- [ ] Shows hand_scan (not hands)
- [ ] Shows health
- [ ] Shows hand_detection

### Step 3: Verify Old Directories Gone
```bash
ls services/hand-modeler/app/
# Should NOT show: jobs, services
```
- [ ] No jobs directory
- [ ] No services directory

### Step 4: Run Backend Tests
```bash
cd services/hand-modeler
poetry install
poetry run pytest tests/test_hand_scan.py -v
```
- [ ] All hand_scan tests pass
- [ ] No import errors
- [ ] No missing module errors

### Step 5: Run Mobile Tests
```bash
cd apps/mobile
npm install
npm test
```
- [ ] All mobile tests pass
- [ ] No TypeScript errors
- [ ] No missing module errors

### Step 6: Verify Development Build
```bash
cd /home/engine/project
pnpm install
pnpm dev:backend &
pnpm dev:mobile
```
- [ ] Backend starts on port 8000
- [ ] Mobile dev server starts on port 8081
- [ ] No critical errors in console
- [ ] API endpoints respond

### Step 7: Manual Smoke Test
In the app:
- [ ] Navigate to Hand Detection tab
- [ ] Click "Start Hand Scan"
- [ ] See permissions screen
- [ ] Can grant permissions (if on device)
- [ ] See guidance screen
- [ ] Can proceed (or see error gracefully)

- [ ] UI renders without crashes
- [ ] Buttons are clickable
- [ ] Navigation works
- [ ] Error handling works

## Documentation Updates (Optional)

- [ ] Update CHANGELOG.md with merge date
- [ ] Update main branch README if needed
- [ ] Tag merge point: `git tag -a v0.1.0-hand-scan`
- [ ] Document any decisions made during merge

## Cleanup

- [ ] Delete feature branch: `git branch -d feat/hand-scan-capture`
- [ ] Delete remote branch: `git push origin --delete feat/hand-scan-capture`
- [ ] Archive merge guide documents (optional, keep for reference)
- [ ] Notify team of successful merge

## Final Verification

```bash
# Verify main branch has all new features
git log --oneline -5
# Should show merge commit at top

# Verify feature branch is gone (locally)
git branch | grep hand-scan
# Should show nothing

# Verify remote branch is gone (optional)
git branch -r | grep hand-scan
# Should show nothing
```

- [ ] Main branch has merge commit
- [ ] Feature branch is deleted locally
- [ ] Feature branch is deleted from origin
- [ ] All tests are passing
- [ ] Development servers start without errors

## Sign-Off

Once all checkboxes are complete:

```bash
echo "Merge completed successfully on $(date)" >> MERGE_COMPLETED.log
git log --oneline -1
```

- [ ] All checks complete
- [ ] Merge confirmed successful
- [ ] Team notified
- [ ] Ready for deployment

---

## Troubleshooting

If something goes wrong:

### If merge fails to start
```bash
git merge --abort
git pull origin main
git merge feat/hand-scan-capture
```

### If conflicts are different than expected
```bash
git diff HEAD feat/hand-scan-capture
# Review the actual differences
```

### If tests fail after merge
```bash
# Check what changed
git log --oneline -5

# Review specific file
git show HEAD:services/hand-modeler/app/main.py
```

### If old files still exist
```bash
# Verify with git
git ls-tree -r HEAD --name-only | grep -E "jobs/|services/hands"
# If output, old files are still tracked - delete and commit again
```

---

**Total Time Estimate**: 15-20 minutes (including verification)

**Difficulty**: Medium (straightforward but requires attention to detail)

**Support**: Refer to MERGE_CONFLICT_RESOLUTION.md for any step
