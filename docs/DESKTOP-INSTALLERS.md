# Brightdesk desktop installers

This repository prepares the desktop installers for **Brightdesk Pages**.

The wider Brightdesk Office Suite contains the approved product range: Pages, Sheets, Decks, Notes, Database, Forms, Lists, Planner, To Do and Workspace.

## Build and verification

Use Node.js 24.22.2. Build on the operating system for which the installer is intended:

- Windows: `npm run dist:desktop:win`
- macOS: `npm run dist:desktop:mac`
- Linux: `npm run dist:desktop:linux`

Run the matching `verify:desktop` command after each build. The checks confirm that the expected installer files and release metadata are present.

A GitHub Release is published only after the build and verification steps pass and the release is explicitly approved.
