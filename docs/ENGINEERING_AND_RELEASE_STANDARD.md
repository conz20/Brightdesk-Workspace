# Workspace engineering and release standard

This repository maintains **Brightdesk Workspace**, one of the ten approved Brightdesk products. The first coordinated customer release target is **0.1.0**. The current main-branch manifest declares version 0.1.0 and Node.js 24.22.2.

## Languages detected on main

JavaScript is the product runtime and tooling language. Rust source is present in the current main tree and has declared formatting, Cargo test/build, Clippy and native build scripts. HTML and CSS provide the desktop interface. Shell and PowerShell support platform setup and builds. JSON, YAML, Markdown and SVG are configuration, documentation and artwork formats.

Keep this inventory current with tracked source and toolchain files. Do not infer that a language is used at runtime from configuration files alone.

## Required engineering practice

- Keep this product aligned with the Brightdesk Office Suite's exact ten-product scope, original product icon, shared design tokens, visual standard, keyboard behaviour, accessibility and platform consistency.
- For behaviour changes, write or update a regression test first where practical, reproduce the problem, implement the smallest safe fix and run focused tests plus the full repository test command: `npm test`.
- Use Node.js 24.22.2 and the committed lockfile. Keep dependency, licence and security checks intact. Do not weaken tests, accessibility, privacy or security gates to make a workflow pass.
- Because Rust source is present, run the declared Rust formatting, Clippy, locked Cargo tests, native build and Node-API integration checks. A passing JavaScript suite alone is not proof that the native engine works.
- Keep the README, product documentation, feature status, original SVGs and screenshot evidence aligned with the actual source and tested build.
- A concept image is not a product screenshot. Add screenshots only after capturing the genuine running desktop build and validating the workflow shown.

## Required desktop packages

| Platform | Configured output |
| --- | --- |
| Windows x64 | NSIS installer (.exe) |
| macOS universal | DMG, PKG and ZIP |
| Linux x64 | AppImage and Debian package (.deb) |

The repository declares native build and release-verification scripts for all three platforms. That declaration does not prove that a build or installation has passed. Build each target on its native operating system and record the exact commit, version, architecture, file size and SHA-256 checksum.

## Installation, updates and removal

- Present the current licence terms before installation or first use as required by the package format. Declining must stop installation or prevent the product workspace from opening.
- Verify clean installation, first launch, upgrade, repair and uninstallation on Windows, macOS and Linux.
- Preserve customer documents, projects, assets and settings during upgrades and ordinary removal. Delete user data only after a clear, separate customer choice.
- Updates must use a reachable publisher and a verified manifest. Notify the customer and require confirmation before downloading or installing. Never install updates silently.
- Removing this product must not silently remove another product or shared customer data.

## Ongoing maintenance

Development continues before and after Brightdesk Office Suite 0.1.0. Continue fixing defects, improving product workflows, updating supported dependencies, extending JavaScript and Rust regression tests, improving accessibility and keeping release documentation accurate. Keep this product aligned with the other nine products and the Suite after public launch.

## Ownership and release control

Use feature branches and reviewed pull requests. Do not merge, publish a GitHub Release, create release tags, deploy production, make repositories public or change permissions, secrets, billing or runner registration without the owner's explicit approval.

## Shared standard

The canonical portfolio-wide requirements are in the [Brightdesk engineering and release standard](https://github.com/connormolloy12/Brightdesk-suite/blob/main/docs/ENGINEERING_AND_RELEASE_STANDARD.md) and the [Brightdesk visual and interaction standard](https://github.com/connormolloy12/Brightdesk-suite/blob/main/docs/BRIGHTDESK_VISUAL_STANDARD.md). Keep this repository-specific summary aligned with those documents.
