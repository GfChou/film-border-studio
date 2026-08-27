# 120 Format Hierarchy and 68/69 Design

## Scope

Add reusable 6x8 and 6x9 frame generation to the film-frame tool and skill, generate both formats for every existing 120 frame variant, and publish them in Film Border Studio under a two-level format picker.

## Geometry

- 68: 8000 x 5500 transparent aperture at (240, 240), 8480 x 5980 canvas.
- 69: 9000 x 5500 transparent aperture at (240, 240), 9480 x 5980 canvas.
- All 120 formats retain a 240px border on every side and 16-bit RGBA PNG output.
- Existing 67 output is the authoritative master for legacy 120 assets. Extension preserves the complete left and right strips, including edge lettering, and synthesizes only the added top/bottom film-base span from adjacent native substrate pixels.

## Tool and Skill

Add 68/69 to fixed format specifications and provide a reusable master-frame expansion builder. Configuration may declare a 67 source as `master-frame` for 68/69 outputs. Validation continues to enforce canvas, centered aperture, opaque border, and 16-bit output. Update the processing skill trigger and workflow to list 645/66/67/68/69.

## Website

Replace the flat format row with a hierarchy:

- First level: 135, 120.
- Second level, visible for 120: 645, 66, 67, 68, 69.

The selected leaf remains the catalog `format`; preview/export code continues to consume one resolved format. 66 remains landscape-only; 645, 67, 68, and 69 support the existing clockwise portrait rotation.

## Verification

Tool tests cover fixed geometry and master expansion invariants. Every generated 68/69 file must pass the existing validator. Website tests cover the new catalog paths and hierarchy normalization. Browser verification checks the second-level menu, 69 preview dimensions, and mobile overflow without repeating export downloads.
