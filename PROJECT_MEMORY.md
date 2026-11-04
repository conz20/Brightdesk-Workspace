# Brightdesk Pages project notes

Use exactly Node.js 24.22.2 LTS for development, testing and desktop installer builds.

The product in this repository is called **Brightdesk Pages**. Use that name on its own in customer-facing text, repository descriptions, installer names and release titles. Describe its distribution in terms of desktop installers.

Brightdesk Pages is part of Brightdesk Office Suite. The approved Brightdesk product range is:
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

Outlook, OneDrive and Teams are excluded. Do not add them.

Brightdesk is an independent desktop product with original branding and implementation. Keep installers native to their target operating systems. Do not publish a release without explicit owner approval.


## Naming rule for all future desktop installer work

For every Brightdesk product and every future desktop installer repository, use the product name on its own (for example, **Brightdesk Pages**) and describe the deliverables as **desktop installers**.

Do not use the words "standalone" or "app" in customer-facing wording, product descriptions, repository names or descriptions, README files, documentation, UI labels, download buttons, installer names, release names, workflow names, artwork, or progress updates. When either word appears in those contexts, replace it with clear product-name or desktop-installer wording. Apply this rule consistently to all ten approved Brightdesk products, not just Pages.

When touching code or internal files, also rename avoidable filenames, function names, variables, comments, test names, and workflow identifiers that use the disallowed terminology. Preserve only framework-required technical API identifiers or compatibility keys where changing them would break the desktop runtime or existing data; never expose those unavoidable identifiers as product wording.

The user has explicitly authorised using available plugins and tools as needed to carry out Brightdesk project work. This does not authorise adding products outside the approved ten or publishing releases without explicit release approval.
