# Brightdesk Workspace

<p align="center"><img src="assets/branding/mark.svg" width="82" height="82" alt="Brightdesk brand mark"><br><strong>brightdesk</strong></p>
<p align="center"><img src="assets/branding/icons/workspace.svg" width="112" height="112" alt="Brightdesk Workspace application icon"></p>

<p align="center"><strong>Bring project notes, tasks and resources together.</strong></p>

<p align="center"><a href="https://raw.githubusercontent.com/connormolloy12/Brightdesk-Workspace/main/assets/previews/workspace.svg"><img src="assets/previews/workspace.svg" width="100%" alt="Brightdesk Workspace design preview"></a></p>

<p align="center"><sub>Select the preview to open the full-size artwork.</sub></p>

> **Visual example:** This is the proposed Brightdesk Workspace experience. It is a design concept, not a screenshot of a finished application.

## Standalone implementation

This repository contains the runnable standalone desktop application source for Brightdesk Workspace. The actual workspace is rendered by the app code, and the professional design layer is loaded at runtime from `src/design-system.css`. The preview artwork above remains a design concept, not a captured screenshot.

- [Desktop application shell](src/index.html)
- [Product module](src/workspace-editor.js)
- [Professional design system](src/design-system.css)
- [UI integration tests](tests/workspace-ui-integration.test.js)
- [Shared Brightdesk Suite](https://github.com/connormolloy12/Brightdesk-suite)

## Shared Brightdesk design standard

The planned product follows the [Brightdesk visual and interaction standard](https://github.com/connormolloy12/Brightdesk-suite/blob/main/docs/BRIGHTDESK_VISUAL_STANDARD.md) for branding, icon usage, layout, responsive behaviour and accessibility.

## Product experience

Brightdesk Workspace is planned as a local-first project home that connects pages, notes, checklists and resources in one organised place.

## Planned capabilities

- Create workspaces, pages and project areas.
- Add and organise content blocks.
- Connect notes, tasks and resources within a project.
- Show useful project context and recent activity.
- Keep project information on this device.

## Implementation status

**Standalone source committed to main.** This repository now includes an Electron app shell, the app modules, the shared visual design layer, Rust engine integration, build scripts and automated UI tests. The preview artwork remains concept art rather than a screenshot of the running application.

## Design brief

See [docs/DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md) for planned screens, navigation and acceptance targets.

## Related project

[Brightdesk Office Suite](https://github.com/connormolloy12/Brightdesk-suite)
