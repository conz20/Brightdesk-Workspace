# Brightdesk Workspace

<p align="center"><img src="assets/branding/mark.svg" width="82" height="82" alt="Brightdesk brand mark"><br><strong>brightdesk</strong></p>
<p align="center"><img src="assets/branding/icons/workspace.svg" width="112" height="112" alt="Brightdesk Workspace product icon"></p>

<p align="center"><strong>Bring project notes, tasks and resources together.</strong></p>

<p align="center"><a href="https://raw.githubusercontent.com/connormolloy12/Brightdesk-Workspace/main/assets/previews/workspace.svg"><img src="assets/previews/workspace.svg" width="100%" alt="Brightdesk Workspace interface design"></a></p>

<p align="center"><sub>Select the interface image to open the full-size design.</sub></p>

> **Interface design artwork — not a screenshot.** This image shows the intended Brightdesk interface. It is not a capture from the running desktop build. A genuine product screenshot will be added after the current desktop build has been launched and its primary workflow verified.

## Desktop implementation

This repository contains the desktop source for Brightdesk Workspace. Electron hosts the desktop interface, the product module is maintained in `src/workspace-editor.js`, and the professional visual system is loaded from `src/design-system.css`. The image above is interface design artwork rather than a captured product screenshot.

- [Desktop interface](src/index.html)
- [Brightdesk Workspace feature module](src/workspace-editor.js)
- [Brightdesk visual system](src/design-system.css)
- [Interface integration tests](tests/workspace-ui-integration.test.js)
- [Shared Brightdesk Suite](https://github.com/connormolloy12/Brightdesk-suite)

## Shared Brightdesk design standard

The product follows the [Brightdesk visual and interaction standard](https://github.com/connormolloy12/Brightdesk-suite/blob/main/docs/BRIGHTDESK_VISUAL_STANDARD.md) for branding, icon usage, layout, responsive behaviour and accessibility.



### Live interaction motion

The shared motion stylesheet now animates the entry of the document and product workspaces, the Get apps and Languages views, and native disclosure-panel content. Product buttons use the shared timing and easing scale while preserving the existing horizontal navigation hover treatment. Update checks and downloads show a decorative loading spinner beside the live status text; presentation mode uses the shared open/close overlay and closes immediately when reduced motion is requested.

## Shared motion foundation

This product bundles the canonical Brightdesk motion stylesheet locally at `src/motion.css`, loaded after `src/design-system.css`. Existing product controls use the shared fast timing and standard easing tokens (120 ms); the shared scale also defines 180 ms and 260 ms transitions. Reusable surface, interactive-control, overlay, progress and loading-indicator primitives are available for product-owned components.

The stylesheet is packaged with the desktop product and does not load from GitHub or another network service at runtime. The `prefers-reduced-motion: reduce` setting disables the shared transitions and spinner animation. Motion does not replace keyboard focus, accessibility semantics or component-specific state handling.

## Cross-platform consistency

The Windows, macOS and Linux editions use the same approved Brightdesk interface and supported product scope. Shared layout, typography, spacing, component states and navigation follow the [Brightdesk visual and interaction standard](https://github.com/connormolloy12/Brightdesk-suite/blob/main/docs/BRIGHTDESK_VISUAL_STANDARD.md). This product's original icon and approved accent remain the same on every operating system. Only operating-system integrations such as window controls, native file dialogs, keyboard conventions and package formats may adapt to platform conventions.

| Operating system | Configured package targets |
| --- | --- |
| Windows | x64 NSIS installer (.exe) |
| macOS | Universal disk image (.dmg), package installer (.pkg) and archive (.zip) |
| Linux | x64 AppImage (.AppImage) and Debian package (.deb) |

These are configured build targets, not confirmation that a package has passed its native build, installation, upgrade and removal checks. Each operating system must pass its own release verification before its download is described as available.

**Terms and first launch:** A valid acceptance of the current Brightdesk Terms and Conditions is required before the product opens. When no current acceptance record exists, a blocking agreement window is shown. Accept continues; declining or closing the window exits the product. This first-use gate is present in the product source for Windows, macOS and Linux. Follow any additional agreement shown by the native installer.

**Updates and removal:** The approved product version and feature scope must remain aligned across all operating systems. Update packages must come from the same tested release. Native installation and removal controls can differ by operating system, but the expected outcome is consistent: remove the product without silently deleting local project data. Do not claim update, upgrade or uninstall verification for an operating system until its native workflow has passed.

## Current first-use workflows

- Create, rename and delete local workspaces.
- Create, rename and delete pages within a workspace.
- Add, edit, delete and reorder paragraph, heading, bullet, callout, divider and checklist blocks.
- Add, edit, complete and remove checklist items.
- Search page titles and block content.
- Keep workspaces and pages saved on this device.

**Not included in this first version:** Live collaboration, shared workspaces, accounts, cloud sync, permissions, external integrations and connected multi-user components.

## Implementation status

**Desktop source is committed to `main`.** This repository includes an Electron desktop shell, product modules, the shared visual system, Rust engine integration, build scripts and automated interface tests. The interface design image is not a screenshot from a running build. A platform desktop installer should only be described as ready after its build and verification checks pass.

## Design brief

See [docs/DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) for the screen designs, navigation and acceptance targets.

## Related project

[Brightdesk Office Suite](https://github.com/connormolloy12/Brightdesk-suite)

## Documentation freshness

The root README is maintained alongside the product, not as an end-of-project task. Every pull request that changes application code, tests, UI, design assets, screenshots, icons, configuration, dependencies, packaging, or build/release workflows must also update this README in the same pull request. Keep feature status, screenshots and visual references, application icons, setup/build instructions, platform compatibility, and repository links aligned with the latest verified implementation. Describe planned or untested functionality as planned, never as completed. The **README freshness** GitHub Actions check requires a root `README.md` update whenever a pull request or direct push to `main` changes a non-Markdown file; a passing check confirms inclusion, while reviewers remain responsible for checking factual accuracy and current visuals.


## Customer network policy

Once installed, this product uses the internet only to check for, download and install official Brightdesk updates. The product does not provide separate in-product installer downloads, customer accounts, passwords, profiles, subscriptions, cloud storage or online services. Normal product work remains local and available offline. Initial installer distribution takes place outside the running product. Spelling checks run locally. Already-installed, integrity-verified dictionaries remain available offline. Entries that are not included in this build are catalogue information only and cannot be downloaded in-product. Future dictionary pack discovery, download and updates must use verified official Brightdesk resources; automatic hybrid fallback and the complete pack catalogue are still pending for this product.

## GitHub-hosted CI

Product quality checks run on GitHub-hosted Ubuntu. The README freshness check also runs on a GitHub-hosted runner. These workflows do not require a self-hosted runner, the owner's MacBook or another personal computer. Cross-platform installer builds remain separate and must be verified on the corresponding GitHub-hosted Windows, macOS and Linux runners before platform support is claimed.


## Installer and platform verification

The product build configuration defines desktop packages for all three supported operating systems:

- **Windows:** NSIS installer (.exe).
- **macOS:** DMG, PKG and ZIP packages.
- **Linux:** AppImage and Debian package (.deb).

The private installer smoke-test scripts are shared verification tooling. Their regression tests check that a test run uses product-specific names and unique temporary locations, refuses to overwrite an existing macOS installation or package receipt, and does not remove a pre-existing Linux package. These source and regression checks are not proof that a native installer has been executed on each operating system.

A platform is complete only after the matching current-version artifacts and SHA-256 records are verified, followed by actual install, first launch, upgrade, repair, uninstall and user-data-preservation checks on that platform. Wine compatibility checks must not be described as native Windows certification. No unverified platform is described as release-ready.


## Shared offline JSON storage

This product bundles the Brightdesk Common-Libs JSON storage helper locally at `src/vendor/brightdesk-common-libs/json-storage.js`. Existing `brightdesk-docs-v3` and `brightdesk-app-setup-v1` storage keys are retained, and the older `brightdesk-docs-v2` key remains readable as a fallback without being deleted. Exact upstream source provenance is recorded in `src/vendor/brightdesk-common-libs/UPSTREAM.json`.

The helper loads from the installed product before `src/app.js`. It does not download from GitHub, a package registry or another network service at runtime. Normal local documents and settings continue to work offline.

## Application identity

The Electron main process validates the configured product ID against the shared ten-product catalogue exported by `src/desktop-downloads.js`. The startup import is covered by `tests/main-product-catalog.test.js`, which guards the approved product list so unsupported IDs cannot enter the product launch path.
