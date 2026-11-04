# Brightdesk Workspace

<p align="center"><img src="assets/branding/mark.svg" width="82" height="82" alt="Brightdesk brand mark"><br><strong>brightdesk</strong></p>
<p align="center"><img src="assets/branding/icons/workspace.svg" width="112" height="112" alt="Brightdesk Workspace product icon"></p>

<p align="center"><strong>Bring project notes, tasks and resources together.</strong></p>

<p align="center"><a href="https://raw.githubusercontent.com/connormolloy12/Brightdesk-Workspace/main/assets/previews/workspace.svg"><img src="assets/previews/workspace.svg" width="100%" alt="Brightdesk Workspace workspace design preview"></a></p>

<p align="center"><sub>Select the preview to open the full-size artwork.</sub></p>

> **Concept preview:** This is original design artwork for Brightdesk Workspace, not a screenshot captured from a running desktop build.

## Desktop implementation

This repository contains the desktop source for Brightdesk Workspace. Electron hosts the desktop interface, the product module is maintained in `src/workspace-editor.js`, and the professional visual system is loaded from `src/design-system.css`. The preview above is concept artwork rather than a captured product screenshot.

- [Desktop interface](src/index.html)
- [Brightdesk Workspace feature module](src/workspace-editor.js)
- [Brightdesk visual system](src/design-system.css)
- [Interface integration tests](tests/workspace-ui-integration.test.js)
- [Shared Brightdesk Suite](https://github.com/connormolloy12/Brightdesk-suite)

## Shared Brightdesk design standard

The product follows the [Brightdesk visual and interaction standard](https://github.com/connormolloy12/Brightdesk-suite/blob/main/docs/BRIGHTDESK_VISUAL_STANDARD.md) for branding, icon usage, layout, responsive behaviour and accessibility.

## Product experience

Brightdesk Workspace is designed as a local-first project home that connects pages, notes, checklists and resources in one organised place.

## Planned capabilities

- Create workspaces, pages and project areas.
- Add and organise content blocks.
- Connect notes, tasks and resources within a project.
- Show useful project context and recent activity.
- Keep project information on this device.

## Implementation status

**Desktop source is committed to `main`.** This repository includes an Electron desktop shell, product modules, the shared visual system, Rust engine integration, build scripts and automated interface tests. The concept preview is not a screenshot from a running build. A platform desktop installer should only be described as ready after its build and verification checks pass.

## Design brief

See [docs/DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) for the screen designs, navigation and acceptance targets.

## Related project

[Brightdesk Office Suite](https://github.com/connormolloy12/Brightdesk-suite)
