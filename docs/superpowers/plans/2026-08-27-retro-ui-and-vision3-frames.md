# Retro UI and VISION3 Frames Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the site with a compact fresh-retro UI, optimize package images, and publish Kodak VISION3 5203/5219 135 borders.

**Architecture:** Keep the existing static Vite application and film catalog. Process new frame scans through the shared film-frame tool, and serve resized WebP package assets directly from `public`.

**Tech Stack:** Vite, vanilla JavaScript/CSS, Node test runner, Python film-frame tool, ImageMagick or macOS image conversion tools.

---

### Task 1: Normalize the two 135 frames

**Files:**
- Create: `/Users/zhoujy/Documents/photography/pictures/film/素材/工具/film-frame-tool/config/vision3-135.json`
- Create: `/Users/zhoujy/Documents/photography/pictures/film/素材/边框素材/135/5203-0.png`
- Create: `/Users/zhoujy/Documents/photography/pictures/film/素材/边框素材/135/5219-0.png`

- [ ] Inspect both manually cut sources and confirm their Alpha apertures.
- [ ] Run `build --dry-run` and confirm no output conflicts.
- [ ] Build both frames with the established 135 geometry.
- [ ] Run `validate` and inspect a two-frame overview image.

### Task 2: Add catalog coverage

**Files:**
- Modify: `src/film-catalog.js`
- Modify: `tests/film-catalog.test.js`
- Create: `public/frames/135/5203-0.png`
- Create: `public/frames/135/5219-0.png`

- [ ] Add a failing test expecting Kodak VISION3 50D 5203 and VISION3 500T 5219.
- [ ] Add both catalog entries and their frame/package paths.
- [ ] Run `npm test` and confirm the catalog test passes.

### Task 3: Optimize package assets

**Files:**
- Modify: `src/film-catalog.js`
- Modify: `tests/film-catalog.test.js`
- Replace: `public/packages/hand-painted/{120,135}/*.png` with `.webp` files.

- [ ] Change package-path expectations from PNG to WebP and confirm the test fails.
- [ ] Resize every referenced hand-painted package image to a maximum edge of 640px and encode WebP at quality 82.
- [ ] Update catalog paths and asset validation.
- [ ] Confirm total package payload is materially smaller than the current PNG set.

### Task 4: Apply the compact retro UI

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

- [ ] Remove the logo explanatory paragraph.
- [ ] Add the approved palette, local typography, glass surfaces, and subtle grain layer.
- [ ] Reduce package image area while preserving `object-fit: contain`.
- [ ] Keep existing responsive breakpoints and controls intact.

### Task 5: Verify and publish

**Files:**
- Modify: repository commit only.

- [ ] Run `npm test`.
- [ ] Run `npm run validate:assets`.
- [ ] Run `npm run build`.
- [ ] Commit, push `main`, and wait for the GitHub Pages workflow to complete successfully.
