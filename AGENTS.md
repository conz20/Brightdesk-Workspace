# Brightdesk Workspace contributor instructions

## Runtime
Use exactly Node.js **24.22.2 LTS**. Keep the version aligned across package.json, package-lock.json, .node-version, .nvmrc, .npmrc, the development container and CI.

## Product identity
This repository builds **Brightdesk Workspace** only. Use this exact name in customer-facing text, desktop installer names, release titles and documentation. The product opens directly into its own workspace; product switching is disabled.

The historical `loop` value is an internal build compatibility key for Brightdesk Workspace. Keep it internal; never display it as the product name.

## Approved Brightdesk range
The complete Brightdesk Office Suite contains exactly: Pages, Sheets, Decks, Notes, Database, Forms, Lists, Planner, To Do and Workspace. This repository is for Brightdesk Workspace; do not add another product here.

Outlook, OneDrive, Teams and all unapproved products are excluded.

## Engineering
Keep Electron responsible for the desktop interface and product lifecycle. Use the shared Rust Node-API engine for bounded local processing and vector operations. Preserve the JavaScript fallback. Rust must not add network access, telemetry, credentials or remote data upload.

Keep product data local by default. Preserve existing tests and licence notices. Do not change customer version **0.1.0** without approval.

## Desktop distribution
Build Windows, macOS and Linux desktop installers with the Workspace-specific commands in package.json. Build and verify the native engine, checksums and platform artifacts before describing a platform as ready.

Keep publishing disabled in ordinary build jobs. Never publish a GitHub Release without explicit owner approval.
