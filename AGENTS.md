# Brightdesk Workspace project instructions

## Runtime
Use exactly Node.js **24.22.2 LTS**. Keep the version aligned across package.json, package-lock.json, .node-version, .nvmrc, .npmrc, the dev container and CI.

## Product identity
This repository builds **Brightdesk Workspace** only. Use this exact name in customer-facing text, desktop installer names, release titles and documentation. The product opens directly into its own workspace; product switching is disabled.

## Approved Brightdesk range
The complete Brightdesk Office Suite contains exactly: Pages, Sheets, Decks, Notes, Database, Forms, Lists, Planner, To Do and Workspace. This repository is for Brightdesk Workspace; do not add another product here.

Outlook, OneDrive, Teams and all unapproved products are excluded.

## Engineering
Keep Electron responsible for the interface and application lifecycle. Use the shared safe Rust Node-API 8 engine for bounded source processing and vector operations. Preserve the JavaScript fallback. Rust must not add network access, telemetry, credentials or remote data upload.

Keep product data local by default. Preserve existing tests and licence notices. Do not change customer version 0.1.0 without approval.

## Desktop distribution
Build Windows, macOS and Linux desktop installers with the product-specific commands in package.json. Keep publishing disabled in ordinary build jobs. Never claim a platform is ready until its build, native engine, checksums and verification tests pass.

Do not publish a GitHub Release without explicit owner approval.
