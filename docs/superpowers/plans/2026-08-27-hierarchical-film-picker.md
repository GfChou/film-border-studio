# Hierarchical Film Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Film Border Studio with the complete current frame library, a manufacturer/model/version picker, official brand and packaging imagery, and the approved film-frame site logo.

**Architecture:** Move film metadata and selection normalization into a catalog module, render the visual picker through a focused UI module, and keep the existing preview/export pipeline consuming one resolved frame record. Store all frame and official product imagery locally so GitHub Pages makes no runtime third-party image requests.

**Tech Stack:** Vite 7, vanilla JavaScript, CSS, Node test runner, Playwright, GitHub Actions Pages.

---

## File Map

- Create `src/film-catalog.js`: manufacturer/model/version data and deterministic selection helpers.
- Create `src/film-picker.js`: accessible manufacturer tabs, model cards, and version buttons.
- Modify `src/main.js`: integrate catalog state, resolved frame paths, logo, and stale-load protection.
- Modify `src/styles.css`: approved catalog layout, responsive states, and visual refinement.
- Create `tests/film-catalog.test.js`: catalog path, ordering, version, and fallback tests.
- Create `scripts/validate-assets.mjs`: verify all catalog images and frame files exist.
- Modify `package.json`: add `test` and `validate:assets` scripts.
- Replace `public/frames/**`: synchronize all current canonical `model-index.png` assets.
- Create `public/brands/**`: official manufacturer marks.
- Create `public/packages/**`: official packaging/product images.
- Create `public/brand/film-border-studio-logo.png` and `public/brand/favicon.png`: approved site identity.
- Create `BRAND_ASSET_SOURCES.md`: official source ledger.
- Modify `ASSET_LICENSE.md`: clarify third-party trademark and product-image ownership.
- Modify `index.html`: favicon and metadata.

### Task 1: Build the catalog model with tests

**Files:**
- Create: `tests/film-catalog.test.js`
- Create: `src/film-catalog.js`
- Modify: `package.json`

- [ ] Write failing Node tests that assert `135/gold200` exposes versions `0..3`, `135/cinestill800t` exposes `0..2`, `645/e100` exposes `0..1`, and a format change preserves a model only when available.
- [ ] Run `node --test tests/film-catalog.test.js`; expect module-not-found failure.
- [ ] Implement exported `manufacturers`, `filmCatalog`, `getManufacturers(format)`, `getModels(format, manufacturerId)`, `normalizeFilmSelection(selection)`, and `resolveFilm(selection)`.
- [ ] Store exact canonical paths such as `frames/135/gold200-2.png`; do not construct paths by parsing labels.
- [ ] Add `"test": "node --test tests/*.test.js"` to `package.json`.
- [ ] Run `npm test`; expect all catalog tests to pass.
- [ ] Commit with `git commit -m "Add structured film catalog"`.

### Task 2: Synchronize and validate frame assets

**Files:**
- Replace: `public/frames/**`
- Create: `scripts/validate-assets.mjs`
- Modify: `package.json`

- [ ] Copy every PNG from `/Users/zhoujy/Documents/photography/pictures/film/素材/边框素材/{135,645,66,67}` to matching `public/frames/<format>/` directories, retaining `model-index.png` names.
- [ ] Remove superseded underscore-named website copies only after the canonical copies exist.
- [ ] Implement `scripts/validate-assets.mjs` to import `filmCatalog`, resolve every frame/package/logo path below `public`, and exit nonzero with a list of missing files.
- [ ] Add `"validate:assets": "node scripts/validate-assets.mjs"` to `package.json`.
- [ ] Run `npm run validate:assets`; package/logo failures are expected until Task 3, but frame-path failures must be zero.
- [ ] Commit with `git commit -m "Sync current film frame library"`.

### Task 3: Add official manufacturer and packaging imagery

**Files:**
- Create: `public/brands/**`
- Create: `public/packages/**`
- Create: `BRAND_ASSET_SOURCES.md`
- Modify: `ASSET_LICENSE.md`
- Modify: `src/film-catalog.js`

- [ ] Download official marks and product imagery only from manufacturer-controlled pages or official literature: Kodak Professional catalog/resources, Fujifilm Professional Film pages/data guides, CineStill 800T product page, and HARMAN Phoenix II product page.
- [ ] Use official literature artwork for discontinued E100VS and Ultra Color 100UC when current product pages are unavailable; otherwise assign an explicit text-card fallback instead of a third-party image.
- [ ] Crop/resize source images into compact local WebP or PNG thumbnails without altering logos.
- [ ] Record manufacturer, product, source URL, local file, and retrieval date in `BRAND_ASSET_SOURCES.md`.
- [ ] Extend `ASSET_LICENSE.md` to state that trademarks and product imagery remain owned by their manufacturers and are excluded from MIT.
- [ ] Wire exact `logoPath` and `packageImage` values into `src/film-catalog.js`.
- [ ] Run `npm run validate:assets`; expect zero missing assets.
- [ ] Commit with `git commit -m "Add official film brand imagery"`.

### Task 4: Create the approved site identity

**Files:**
- Create: `public/brand/film-border-studio-logo.png`
- Create: `public/brand/favicon.png`
- Modify: `index.html`

- [ ] Produce the approved black film-frame/sprocket mark as a transparent bitmap plus a compact mark-only favicon.
- [ ] Add favicon, theme color, description, and updated title metadata to `index.html`.
- [ ] Verify both bitmap files decode and have transparent backgrounds.
- [ ] Commit with `git commit -m "Add Film Border Studio identity"`.

### Task 5: Implement the catalog picker

**Files:**
- Create: `src/film-picker.js`
- Modify: `src/main.js`
- Modify: `src/styles.css`

- [ ] Implement `renderFilmPicker(container, selection, callbacks)` with manufacturer logo tabs, model package cards, and version buttons shown only for multi-version models.
- [ ] Give tabs/buttons `aria-pressed`, package images meaningful alt text, and text fallbacks through an `error` image handler.
- [ ] Replace the old `<select>` with a `#filmPicker` container and update state to `manufacturerId`, `modelId`, and `versionId`.
- [ ] Make format changes call `normalizeFilmSelection`; manufacturer/model/version clicks update state and immediately redraw the preview.
- [ ] Change `frameUrl()` and export filenames to use `resolveFilm(state).framePath` and formal model name.
- [ ] Add a monotonically increasing frame-load request ID so stale fetch responses cannot overwrite the newest selection.
- [ ] Keep orientation, ordinary export, and 16-bit worker payload behavior otherwise unchanged.
- [ ] Implement the approved warm-gray/black/orange layout, wider desktop panel, horizontal mobile manufacturer scroller, one-column mobile model list, and touch-sized version controls.
- [ ] Run `npm test`, `npm run validate:assets`, and `npm run build`; expect all to pass.
- [ ] Commit with `git commit -m "Add hierarchical visual film picker"`.

### Task 6: Focused browser verification

**Files:**
- Modify only files required by demonstrated failures.

- [ ] Start `npm run dev -- --port 4173` and retain the server.
- [ ] Use Playwright at 1440x1000 and 390x844 to verify no overlap or horizontal overflow, and that the preview remains visible below controls on mobile.
- [ ] Load a small local test image, switch `Gold 200` between versions `01` and `04`, and assert the preview title/version and resolved frame URL change.
- [ ] Switch 67 landscape to portrait and confirm the canvas dimensions rotate; switch to 66 and confirm portrait is disabled.
- [ ] Verify export controls remain enabled after a successful preview. Do not repeat downloads for every output format.
- [ ] Capture desktop and mobile screenshots for visual inspection; fix only demonstrated layout or interaction failures.
- [ ] Rerun `npm test`, `npm run validate:assets`, and `npm run build`.
- [ ] Commit fixes, if any, with `git commit -m "Polish responsive film picker"`.

### Task 7: Publish and verify GitHub Pages

**Files:**
- No planned source changes.

- [ ] Run `git status --short` and confirm only intended files are tracked.
- [ ] Push `main` with `git push origin main`.
- [ ] Inspect the latest GitHub Actions Pages run until it succeeds or exposes an actionable repository failure.
- [ ] Open the deployed Pages URL and verify the new logo, official imagery, manufacturer/model/version picker, and one numbered frame switch.
- [ ] Stop retained local servers and report the deployed URL plus any remaining official-image fallback.

## Self-Review

- Spec coverage: complete frames, three-level picker, official imagery, source ledger, approved logo, responsive polish, error fallback, stale-load protection, focused verification, and publication each map to a task.
- Scope: export internals are not refactored; regression is limited to preview readiness and unchanged controls per the user's latest instruction.
- Naming consistency: catalog state uses `manufacturerId`, `modelId`, and `versionId`; frame records use `framePath`; all tasks use these exact names.
- Placeholder scan: no deferred implementation markers remain.
