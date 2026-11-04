# Brightdesk Workspace project notes

## Runtime
Use exactly Node.js **24.22.2 LTS** for development, testing and desktop installer builds. Keep the runtime aligned across package.json, package-lock.json, .node-version, .nvmrc, .npmrc, the development container and CI.

## Product identity
This repository builds **Brightdesk Workspace** only. Use this exact name in customer-facing text, desktop installer names, release titles and documentation. The product opens directly into its own workspace; product switching is disabled.

## Approved Brightdesk range
The complete Brightdesk Office Suite contains exactly:
- Brightdesk Pages
- Brightdesk Sheets
- Brightdesk Decks
- Brightdesk Notes
- Brightdesk Database
- Brightdesk Forms
- Brightdesk Lists
- Brightdesk Planner
- Brightdesk To Do
- Brightdesk Workspace

Outlook, OneDrive, Teams and all unapproved products are excluded.

## Engineering and data
Keep Electron responsible for the desktop interface and product lifecycle. Use the shared Rust Node-API engine for bounded local processing. Preserve the JavaScript fallback. Rust must not add network access, telemetry, credentials or remote data upload.

Keep product data local by default. Preserve existing tests and licence notices. Do not change customer version **0.1.0** without approval.

## Desktop distribution
Prepare native Windows, macOS and Linux desktop installers using the product-specific build and verification commands. Keep publishing disabled in ordinary build jobs. Do not claim a platform is ready until its build, native engine, checksums and verification tests pass.

Do not publish a GitHub Release without explicit owner approval.

## Customer-facing naming
Use the product name on its own and describe distribution as **desktop installers**. Do not use the words "standalone" or "app" in customer-facing wording, product descriptions, README files, documentation, interface labels, download buttons, installer names, release names, workflow names, artwork or progress updates.

When touching internal files, also replace avoidable filenames, function names, variables, comments, test names and workflow identifiers that use those terms. Preserve only framework-required technical identifiers or compatibility keys when changing them would break the desktop runtime or existing data. Never expose unavoidable identifiers as product wording.

The user has authorised using available plugins and tools for Brightdesk project work. This does not authorise adding products outside the approved ten or publishing releases without explicit release approval.
