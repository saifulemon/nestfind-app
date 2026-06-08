# Fullstack Pipeline Status - nestfind

## Configuration

```yaml
project: nestfind
created: 2026-05-19
last_run: 2026-05-19T09:42:21.945Z
generation: 1
pipeline_score: 1.00
quality_target: 0.95
seed_id: null
tech_stack:
  backend: nestjs
  frontends: [react]
  dashboards: []
format_version: 3
```

## Progress

| Phase | Status | Score | Output | Loop Runs | Gate Run At | Notes |
|-------|--------|-------|--------|------------|-------------|-------|
| spec | Pending | - | - | 0 | - | - |
| init | Complete | 1.00 | 6/6 checks passed | 0 | 2026-05-19T09:10:17Z | gate-runner |
| prd | Complete | 1.00 | 6/6 checks passed | 0 | 2026-05-19T09:10:17Z | gate-runner |
| user-stories | Pending | - | - | 0 | - | - |
| design | Failed | 0 | 5/8 nodes | 0 | - | fullstack-2 |
| database | Complete | 1.00 | 8/8 checks passed | 0 | 2026-05-19T09:10:18Z | gate-runner |
| backend | Pending | - | - | 0 | - | - |
| frontend | Pending | - | - | 0 | - | - |
| integrate | Pending | - | - | 0 | - | - |
| test-api | Pending | - | - | 0 | - | - |
| test-browser | Pending | - | - | 0 | - | - |
| ship | Pending | - | - | 0 | - | - |

## Generation Log

| Gen | Score | Phases Run | Improved | Stagnant | Duration |
|-----|-------|-----------|----------|----------|----------|

## Artifact Hashes

| Phase | Artifact | Hash | Last Changed |
|-------|----------|------|-------------|

## Gate Proofs

| Phase | Proof File | Executed At | Score | Checks Hash |
|-------|-----------|-------------|-------|-------------|
| init | .gate-proofs/init.proof | 2026-05-19T04:57:02Z | .83 | d0fdd1c31c9f1cfaaa9235d6a4f9a0a847bda53df8f804f20dfe16a57b1cedf9 |
| init | .gate-proofs/init.proof | 2026-05-19T04:58:20Z | .83 | d0fdd1c31c9f1cfaaa9235d6a4f9a0a847bda53df8f804f20dfe16a57b1cedf9 |
| init | .gate-proofs/init.proof | 2026-05-19T04:58:46Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| init | .gate-proofs/init.proof | 2026-05-19T05:00:13Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T05:21:23Z | .66 | 0aed68dd56d9b71b8722e140358a110d1dd866240b809249ccfb38cf0e432649 |
| prd | .gate-proofs/prd.proof | 2026-05-19T05:22:06Z | .66 | 0aed68dd56d9b71b8722e140358a110d1dd866240b809249ccfb38cf0e432649 |
| init | .gate-proofs/init.proof | 2026-05-19T05:22:36Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T05:39:59Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| init | .gate-proofs/init.proof | 2026-05-19T07:09:50Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T07:09:51Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T07:31:57Z | 1.00 | 7fbe60a4e3a944284ac643d1baa0a68d793af459a0b0fa85fe53e14ec829a27d |
| init | .gate-proofs/init.proof | 2026-05-19T07:32:18Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T07:32:18Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T07:32:19Z | 1.00 | 1c894824d410c244a6b5f33aa35fab5df53cb967b96983ca414e5199099faede |
| init | .gate-proofs/init.proof | 2026-05-19T08:03:32Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T08:03:32Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T08:03:33Z | 1.00 | 28101fc62ab003baa5756eb10c55bfafafeffaa3b909ba1806ff950b84d29935 |
| init | .gate-proofs/init.proof | 2026-05-19T08:26:41Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T08:26:41Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T08:26:42Z | 1.00 | 7c530ac61efc41b2c316b14c3219871fb6e2102a99a8486709cf8a9b6f26a3c4 |
| init | .gate-proofs/init.proof | 2026-05-19T09:10:17Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T09:10:17Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T09:10:18Z | 1.00 | 2078bef975e5fb1ed77801606125c53928b14cbc54b2d1f8aeaa65741ef80611 |

## Gate Results

Gate scripts provide deterministic, non-LLM validation after each phase.

### database — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| entity-files-exist | PASS | count=      10 (expected >= 1) | 0ms |
| schema-compiles | PASS |  | 666ms |
| entities-have-decorator | PASS | count=       9 (expected >= 1) | 0ms |
| migrations-exist | PASS | count=       1 (expected >= 1) | 0ms |
| naming-convention | PASS |  | 18ms |
| uuid-primary-keys | PASS |        3/       3 entities use UUID PK | 0ms |
| soft-delete-support | PASS |        1 entities have soft delete | 0ms |
| prefer-enum-over-string | PASS |        0 potential string-as-enum fields | 0ms |
| **Score** | **1.00** | **2026-05-19T07:31:57Z** | |

**Fix Attempts:** _none_

### backend — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

### frontend — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

### integrate — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

### test-api — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

### test-browser — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

### ship — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

## Improvement Queue

Items identified for future iterations.

| Phase | Improvement | Priority | Source | Target Gen |
|-------|-------------|----------|--------|------------|

## Skill Paths by Tier

| Tier | Base Path | Description |
|------|-----------|-------------|
| base | `.claude/skills/` | Generic orchestration (init, ship) |
| $BACKEND | `.claude/$BACKEND/skills/` | Backend skills (prd, database, backend) |
| $FRONTEND | `.claude/$FRONTEND/skills/` + `guides/` | Frontend skills (frontend, dashboard, integrate, qa) |
| $STACK | `.claude/{context}/skills/` | Context-dependent (backend or frontend) |

### Tech Stack Resolution

- `$BACKEND` = tech_stack.backend (e.g., "nestjs", "django")
- `$FRONTEND` = tech_stack.frontends[0] (e.g., "react")
- `$STACK` = Resolved based on phase context

**Supported Tech Stacks:**

| Category | Options | Submodule URL |
|----------|---------|---------------|
| Backend | nestjs, django | github.com/potentialInc/claude-{backend} |
| Frontend | react, react-native | github.com/potentialInc/claude-{frontend} |

## Execution Log

| Date | Phase | Gen | Duration | Result | Score | Notes |
|------|-------|-----|----------|--------|-------|-------|
| 2026-05-19 | init | 1 | 538s | Failed | 0 | fullstack-2 failed:evidence-check |
| 2026-05-19 | init | 1 | - | Complete | .83 | gate-runner |
| 2026-05-19 | init | 1 | 0s | Failed | 0.83 | fullstack-2 failed:gate |
| 2026-05-19 | init | 1 | - | Complete | .83 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | 0s | Failed | 0 | fullstack-2 failed:seed-check |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Failed | .66 | gate-runner |
| 2026-05-19 | prd | 1 | 1269s | Failed | 0.66 | fullstack-2 failed:gate |
| 2026-05-19 | prd | 1 | - | Failed | .66 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | 1043s | Complete | 1 | fullstack-2 |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | 1726s | Failed | 0 | fullstack-2 failed:require-variation-selection |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | 1987s | Failed | 0 | fullstack-2 failed:design-full-generation |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | 1924s | Failed | 0 | fullstack-2 failed:design-full-generation |

## Phase Details

### spec
- **Status**: Pending
- **Seed**: -
- **Ambiguity**: -

### init
- **Status**: Pending
- **Output**: -

### prd
- **Status**: Pending
- **PRD**: -
- **Converted Docs**: -

---

## Status Labels

| Label | Meaning |
|-------|---------|
| Complete | Phase finished successfully |
| In Progress | Currently executing |
| Pending | Not yet started |
| Failed | Execution failed |
| Needs Review | Artifact invalidated, re-evaluation needed |
| Skipped | Carried from previous generation |
