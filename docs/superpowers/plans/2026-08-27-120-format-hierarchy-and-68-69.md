# 120 Format Hierarchy and 68/69 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and publish complete 68/69 film-frame libraries and organize all medium-format choices beneath a 120 parent menu.

**Architecture:** Extend the shared fixed geometry table and add a master-frame expansion builder that preserves 67 side strips while extending native top/bottom substrate. Keep the website catalog keyed by leaf format, adding a separate format-family UI layer so preview and export internals remain unchanged.

**Tech Stack:** Python 3, Pillow, NumPy, unittest, Vite, vanilla JavaScript, Node test runner, GitHub Actions Pages.

---

### Task 1: Extend Film Tool Geometry and Builder

**Files:**
- Modify: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/filmframes/specs.py`
- Modify: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/filmframes/builders.py`
- Modify: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/filmframes/cli.py`
- Test: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/tests/test_specs.py`
- Test: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/tests/test_builders.py`

- [ ] Add failing assertions for 68 canvas/window `(8480, 5980)/(8000, 5500)` and 69 `(9480, 5980)/(9000, 5500)`.
- [ ] Add a failing builder test asserting that expansion preserves 240px side strips, creates the exact transparent aperture, and returns the target canvas.
- [ ] Implement `expand_120_master(rgba, spec)` using the detected 67 aperture, native left/right strips, and horizontally extended top/bottom bands sampled from their own center pixels.
- [ ] Add `master-frame` mode to CLI dispatch and run `python -m unittest` with all tests passing.

### Task 2: Generate and Validate Complete 68/69 Assets

**Files:**
- Create: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/config/extend-68-69.json`
- Create: `/Users/zhoujy/Documents/photography/pictures/film/素材/边框素材/68/*.png`
- Create: `/Users/zhoujy/Documents/photography/pictures/film/素材/边框素材/69/*.png`

- [ ] Configure every existing `67/*.png` as a `master-frame` source for 68 and 69 with source and output roots both at the frame library.
- [ ] Run dry-run, build atomically, and validate all 18 outputs as 16-bit RGBA with exact centered apertures.
- [ ] Generate 68 and 69 overview sheets, inspect them, then remove the overview sheets after verification.

### Task 3: Update the Reusable Skill

**Files:**
- Modify: `/Users/zhoujy/.codex/skills/processing-film-frames/SKILL.md`

- [ ] Extend trigger text and fixed geometry references to 68/69.
- [ ] Document when to use 67 master expansion and the exact 240px/8000x5500/9000x5500 invariants.
- [ ] Run frontmatter and placeholder checks; keep the skill concise.

### Task 4: Add Website Catalog and Hierarchical Format Picker

**Files:**
- Modify: `src/film-catalog.js`
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `tests/film-catalog.test.js`
- Modify: `README.md`
- Create: `public/frames/68/*.png`
- Create: `public/frames/69/*.png`

- [ ] Add failing catalog tests for 68/69 availability and paths.
- [ ] Add 68/69 to every model currently available in 67 and add matching 8000x5500/9000x5500 apertures.
- [ ] Render first-level `135/120` buttons and a conditional second-level `645/66/67/68/69` row; retain the selected leaf as `state.format`.
- [ ] Keep only 66 landscape-only and update responsive styles and documentation.
- [ ] Synchronize canonical frame assets and pass tests, asset validation, and production build.

### Task 5: Focused Verification and Publish

**Files:**
- Modify only files required by demonstrated failures.

- [ ] Check desktop/mobile hierarchy without horizontal overflow and load one 69 preview to confirm 9480x5980 canvas and 9000x5500 aperture metadata.
- [ ] Push `main`, wait for GitHub Pages success, and verify the published page plus one 69 frame return HTTP 200.

## Self-Review

- Coverage includes tool geometry, reusable expansion, all 120 assets, skill documentation, hierarchical UI, focused verification, and publication.
- `master-frame`, `formatFamily`, and leaf `format` names remain consistent across tasks.
- No deferred implementation markers or unrelated export refactors are included.
