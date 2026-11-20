# Brightdesk Workspace contributor instructions

## Product identity and scope

This repository builds **Brightdesk Workspace** only. Use this exact name in customer-facing text, desktop installer names, release titles and documentation. Do not use "standalone" or "app" in customer-facing wording; use the actual product name or clear desktop-installer wording.

The complete Brightdesk customer portfolio contains exactly these ten products: Pages, Sheets, Decks, Notes, Database, Forms, Lists, Planner, To Do and Workspace. Brightdesk Office Suite is their shared desktop experience, not another product. Brightdesk-AI is separate private engineering tooling, not a customer product and not an eleventh product.

Do not add Outlook, OneDrive, Teams or any other unapproved product. This repository must not silently take on another product's identity or runtime.

## Approved runtime and compatibility

Use exactly Node.js **24.22.2 LTS** for development, tests, scripts, builds and CI. Keep package manifests, lockfiles, `.node-version`, `.nvmrc`, `.npmrc`, development containers and GitHub Actions aligned.

Where this repository packages Electron, pin Electron **45.2.1** and electron-builder **26.18.0** exactly. Where it builds or tests Rust crates or native bindings, pin Rust **1.99.1** in the repository's toolchain configuration and CI. Do not add Electron, electron-builder or Rust where they do not apply.

Do not copy older-version code, tutorials, samples or API guidance into the current implementation unchanged. Check the version they target and port useful work to the approved APIs. Update imports, method signatures, configuration, lockfiles, tests and documentation together. Never mix incompatible major-version APIs or use an older runtime to force a test to pass.

Do not change the approved versions without explicit owner approval and a coordinated compatibility review. Do not automatically upgrade to whatever upstream calls latest.

## Customer, privacy and service boundaries

Brightdesk is **free forever**. Do not add subscriptions, trials, paid tiers, in-product purchases, customer billing or paid feature unlocks. Do not require customer accounts, sign-in, passwords, profiles, activation codes, serial numbers or licence servers.

Keep customer documents, projects, assets, settings and spelling data on the customer's device. Do not add cloud storage, cloud synchronisation, hosted collaboration, telemetry, analytics, advertising, crash reporting, remote AI processing or customer-content uploads.

Internet access is limited to official Brightdesk-controlled services for product updates and Brightdesk-controlled language-resource discovery, download and update. Do not add unrelated network services or third-party runtime dictionary downloads. Local work and existing spelling resources must continue to function offline.

## Brand and third-party boundaries

Use original Brightdesk names, interface design, icons, SVGs, fonts and artwork. Microsoft is the primary product and workflow inspiration, not a source of copied code, logos, assets or distinctive trade dress. Adobe may be referenced only for capability and workflow comparisons. Never install, bundle, depend on, integrate with or require an Adobe application or Adobe service. Do not imply Microsoft or Adobe affiliation.

## Development and quality

- Make changes on a dedicated feature branch; do not commit routine work directly to `main`.
- Read the README and relevant project documentation before each development stage.
- Add or update regression tests for behaviour changes where practical. Run focused tests and the repository's full test suite on the exact approved toolchain whenever the environment permits.
- Use locked dependencies. Do not weaken tests, security checks or accessibility checks to obtain a pass.
- Do not claim a test, build, installer or feature passed unless it was actually verified. State any platform or hardware limitation clearly.
- Preserve customer documents, settings, spelling dictionaries and file formats during upgrades and migrations. Add tests for migrations and data preservation.
- Keep the README and affected documentation accurate whenever source code, tests, interface, dependencies, configuration, packaging or release behaviour changes.
- Keep credentials, private reports and personal information out of source, logs, packages and release assets.

## Desktop distribution and release safety

The portfolio's configured package targets are Windows x64 NSIS EXE; macOS universal DMG, PKG and ZIP; and Linux x64 AppImage and DEB. These are targets, not evidence of completed builds. Verify each supported platform on an appropriate native runner.

Before claiming release readiness, verify the exact source commit and version, native components where applicable, package contents, legal notices, SHA-256 checksums, installation, first launch, terms acceptance and decline, upgrade, repair, shortcuts and operating-system registrations, data preservation, and removal behaviour. Never silently delete customer data or remove another Brightdesk product.

Keep publishing disabled in ordinary build jobs. Do not publish a GitHub Release, tag a customer release, deploy production, change repository visibility or permissions, enable paid services or runners, or change secrets and billing without explicit owner approval. The customer release target is **0.1.0**; do not change it without approval.

## Product-specific engineering

Keep Electron responsible for the desktop interface and product lifecycle. Use the shared Rust Node-API engine for bounded local processing and vector operations. Preserve the JavaScript fallback. Rust must not add network access, telemetry, credentials or remote data upload.

The historical `loop` value is an internal build compatibility key for Brightdesk Workspace. Keep it internal; never display it as the product name.
