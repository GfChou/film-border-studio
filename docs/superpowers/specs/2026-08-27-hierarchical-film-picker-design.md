# Hierarchical Film Picker and Branding Design

## Goal

Update Film Border Studio with the complete current frame library and replace the single film dropdown with a visual hierarchy of manufacturer, film model, and frame version. Add official manufacturer and packaging imagery plus a simple Film Border Studio logo without changing the browser-local image-processing and export behavior.

## Scope

This change includes:

- synchronizing the current 135, 645, 66, and 67 frame assets into the site;
- manufacturer, model, and optional frame-version selection;
- official manufacturer logos and official film packaging imagery;
- a new simple site logo and favicon;
- responsive visual refinement of the existing single-page tool;
- source attribution for official brand and product imagery;
- desktop and mobile browser validation and GitHub Pages publication.

This change does not add a backend, accounts, uploads, persistent user data, or new image export formats. All photo processing remains local to the visitor's browser.

## Asset Model

Film options will be declared as structured records rather than parallel name arrays. Each record contains:

- `format`: 135, 645, 66, or 67;
- `manufacturerId`: stable manufacturer key;
- `modelId`: stable film-model key;
- `displayName`: formal product name;
- `filmType`: concise type and speed metadata where known;
- `packageImage`: local path to an official product image;
- `versions`: ordered records containing numeric ID and exact frame path.

Frame version numbers retain their source suffixes. The UI displays `0` as `01`, `1` as `02`, and so on. The version control is shown only when a selected model has more than one frame in the active format.

The website frame directory will be synchronized from the complete material library. Assets will use stable source-style names such as `gold200-0.png` and `gold200-1.png`; application data will hold exact paths, so parsing filenames at runtime is unnecessary. Obsolete underscore-based website copies will be removed after all references migrate.

## Manufacturer and Packaging Assets

Manufacturer logos and product images will come from official manufacturer pages, press resources, product pages, or official product literature. They will be downloaded into local website asset directories so the picker works without third-party runtime requests.

For discontinued products, an official product-sheet or brochure image may be used when a current product page no longer exists. A missing official package image falls back to a locally rendered text package card; a third-party marketplace image will not be substituted silently.

An attribution file will record the source URL, manufacturer, product, and retrieval date for each official image. Existing `ASSET_LICENSE.md` will be extended to clarify that brand marks and product imagery remain the property of their respective owners and are not covered by the source-code MIT license. Since GitHub Pages is public static hosting, these files remain publicly accessible.

## Picker Interaction

The confirmed picker is the step-by-step catalog layout:

1. Manufacturer row: official logos presented as selectable tabs.
2. Film model list: selectable cards with official packaging thumbnail, formal name, and concise film metadata.
3. Frame version row: compact numbered buttons when more than one version exists.

Changing the format rebuilds the available hierarchy. If the current model exists in the new format, the app preserves it and selects its first available version. Otherwise, it selects the first available manufacturer and model. Changing manufacturer or model immediately loads that model's selected frame and refreshes the preview; no separate Apply action is required.

Selection controls expose pressed/selected state to assistive technology. Package images have useful alternative text, while decorative manufacturer marks are paired with visible manufacturer names.

## Visual Direction

The interface remains a quiet photography work surface rather than a marketing page. The palette uses black, white, warm gray, and a restrained film-orange accent. Controls gain clearer grouping, consistent icon buttons where appropriate, and denser but more legible spacing.

The selected site logo is a black film-frame mark with sprocket perforations plus a two-line `Film Border Studio` wordmark. A compact mark-only bitmap becomes the favicon. Both are stored as local PNG assets.

The desktop control panel becomes slightly wider to fit packaging cards without crowding the preview. On narrow screens, the panel remains above the workspace, manufacturer tabs scroll horizontally, model cards use one column, and version buttons retain touch-friendly dimensions. No nested cards or oversized promotional sections are introduced.

## State and Data Flow

State expands from one `film` key to:

- active format;
- active manufacturer;
- active model;
- active frame version;
- the existing orientation, quality, export type, and image state.

A single selector function resolves these IDs to the exact frame asset record. Preview and export code consume that resolved path. This isolates the new catalog UI from the existing image-processing pipeline.

Frame loads are guarded against stale asynchronous responses: a newer selection cannot be overwritten by an earlier, slower fetch. Successful bitmaps replace and close the previous frame bitmap when supported.

## Error Handling

- A missing package image displays a styled text fallback and keeps the model selectable.
- A failed frame fetch clears the invalid frame state, disables export, and shows a clear status message.
- An unavailable saved selection falls back deterministically to the first valid manufacturer, model, and version for the active format.
- Missing or malformed catalog records fail during development validation rather than at user interaction time.

## Testing and Publication

Validation covers:

- every catalog frame path exists;
- manufacturer, model, and version ordering is deterministic;
- all newly added version choices load distinct expected assets;
- format changes maintain or reset selections correctly;
- desktop and mobile layouts do not overflow or overlap;
- package-image fallback remains usable;
- landscape and portrait previews still rotate frames correctly;
- PNG, JPEG, WebP, and 16-bit PNG exports remain functional;
- the production build succeeds.

Playwright screenshots will be checked at representative desktop and mobile viewports. After local verification, changes will be committed and pushed to the existing GitHub repository. The GitHub Actions run and deployed Pages site will be checked before completion.
