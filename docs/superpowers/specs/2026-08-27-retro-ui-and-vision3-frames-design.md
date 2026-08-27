# Retro UI and VISION3 Frames Design

## Scope

- Remove the explanatory sentence below the logo.
- Restyle the existing application without changing its workflow or layout hierarchy.
- Add a fresh retro palette, translucent glass surfaces, local system typography, and a subtle silver-halide grain texture.
- Reduce film package card image height.
- Convert all displayed hand-painted package PNGs to WebP with a 640px maximum edge and update catalog paths.
- Normalize `5203-0.png` and `5219-0.png` with the established 135 frame workflow, preserve their transparent apertures and native film-base colors, then publish them as Kodak VISION3 50D 5203 and VISION3 500T 5219.

## Visual Direction

Use warm white glass panels over low-saturation sage, mist blue, and pale neutral background bands. Use dark olive text and muted vermilion for selected controls. Grain is a fixed, non-interactive, low-opacity monochrome texture and must not reduce text contrast.

## Asset Rules

- Package images use WebP at a maximum edge of 640px and quality 82.
- Cards use `object-fit: contain`; no crop is allowed.
- The new 135 frames use the existing fixed 135 geometry and 16-bit RGBA PNG output.
- Existing border assets are not overwritten.

## Verification

- Film catalog tests cover both VISION3 entries and WebP package paths.
- The frame tool must pass inspect, dry-run, build, validate, and visual overview review for the two new frames.
- The site must pass unit tests, catalog asset validation, and production build before deployment.
