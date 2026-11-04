# Brightdesk private project maintenance runner

## Why this runs from Brightdesk Pages

GitHub-hosted jobs in the private Brightdesk repositories have repeatedly failed before their first step starts. This controller centralises the checks and keeps source access scoped to short-lived, repository-specific read-only tokens.

This controller runs from the Brightdesk Pages repository and checks out all ten private Brightdesk source repositories onto a temporary GitHub-hosted runner. It does not copy private source files into Brightdesk Pages, publish them as artifacts, or print raw test/build logs.

## Private repository access (one-time setup)

**Important:** The current workflow uses a GitHub App. It does not read a fine-grained personal access token named `BRIGHTDESK_PRIVATE_REPOSITORIES_READ`. The earlier PAT instructions for this controller were incorrect.

The workflow expects these two repository-level settings in **Brightdesk-Pages**:

- **Actions variable:** `BRIGHTDESK_APP_ID` — the numeric App ID for the dedicated Brightdesk read-only GitHub App.
- **Actions secret:** `BRIGHTDESK_APP_PRIVATE_KEY` — the private key PEM for that same GitHub App.

Before adding them, confirm the GitHub App is installed for the `connormolloy12` account and can access these ten private repositories:

- Brightdesk-suite
- Brightdesk-Sheets
- Brightdesk-Decks
- Brightdesk-Notes
- Brightdesk-Database
- Brightdesk-Forms
- Brightdesk-Lists
- Brightdesk-Planner
- Brightdesk-To-Do
- Brightdesk-Workspace

For a selected-repository installation, add Lists, Planner, To Do and Workspace to the installation's repository access list. Keep the permission scope at **Contents: Read-only**; no broader repository permissions are needed for checkout and tests.

The App must have **Contents: Read-only** permission for those repositories. Do not grant Contents write, Administration, Actions write, Secrets, or signing-related permissions for this maintenance workflow.

To configure the repository settings:

1. Open [Brightdesk-Pages Actions secrets and variables](https://github.com/connormolloy12/Brightdesk-Pages/settings/secrets/actions).
2. Under **Variables**, create `BRIGHTDESK_APP_ID` and enter the App ID.
3. Under **Secrets**, create `BRIGHTDESK_APP_PRIVATE_KEY` and paste the PEM private key for that App.
4. Save both settings. Do not paste the private key into chat, workflow files, commits, or issue comments.

The workflow creates a short-lived installation token for only the repository being checked in that job, requesting **Contents: Read-only**. It does not need a personal access token. Never expose or log the private key or generated token.

### Optional private Suite failure diagnostics

When Brightdesk-suite tests fail, the runner creates a small summary containing sanitised failing test names only. It does not include assertion messages, source paths, stack traces, raw logs or source code.

To post that summary to the private [Brightdesk-suite issue #27](https://github.com/connormolloy12/Brightdesk-suite/issues/27), the dedicated GitHub App also needs the repository permission **Issues: Read and write**. The workflow requests this through a separate short-lived installation token restricted to the `Brightdesk-suite` repository and used only by the issue-comment step. The app-level Issues permission is available to the repositories selected for that GitHub App installation, but this workflow requests the Issues token for Brightdesk-suite only. The normal checkout token remains **Contents: Read-only**. No **Contents: Write**, Actions, Administration, Secrets or signing permission is required.

To approve the additional permission:

1. Open [your GitHub Apps settings](https://github.com/settings/apps) and select the Brightdesk maintenance app.
2. Open **Permissions & events**.
3. Under **Repository permissions**, set **Issues** to **Read and write**, then save.
4. Approve the permission update for the installed app when GitHub prompts you.

GitHub requires an installation owner to approve newly requested permissions before they take effect. Until that approval is complete, the test job still runs and correctly fails, but the diagnostic names remain on the temporary runner and are not posted.

If these two settings are already present and the App installation has the required access, do not recreate the App or replace the key.

## Run the checks

1. Open [Brightdesk-Pages Actions](https://github.com/connormolloy12/Brightdesk-Pages/actions/workflows/brightdesk-private-maintenance.yml).
2. Select **Run workflow**.
3. Leave **Build and verify all private project installers on Windows, macOS and Linux** unchecked for the ordinary daily test run.
4. Start the workflow and inspect the ten private-project test jobs.

The workflow also runs daily. A trusted push to the controller on `main` triggers the same ten-repository daily checks, while pull-request events only validate the public controller and never check out private projects. Its weekly schedule builds and verifies the configured Windows, macOS and Linux packages after the daily checks pass. The manual cross-platform option starts the full 30-project/platform build matrix.

All build commands use the existing non-publishing scripts. The controller does not upload artifacts or publish a release.

## Privacy

The private repository checkout uses `persist-credentials: false`. Test, build and verification command output is redirected to a temporary file on the runner. Only the repository name, operating system, target format, pass/fail stage and a generic message are written to the public workflow summary. No source files, raw logs, installer files or private test output are uploaded as artifacts.

This is still a public workflow, so changes to the controller must be reviewed before merging. The GitHub App should remain limited to read-only access for the approved private repositories.

## Limits

- The controller requires `BRIGHTDESK_APP_ID` and `BRIGHTDESK_APP_PRIVATE_KEY` in Brightdesk-Pages and a matching GitHub App installation with Contents: Read-only access to all ten private repositories.
- It checks code, dependencies, release readiness and whether the existing package build/verification scripts succeed. It does not install each package into a real Windows, macOS or Linux machine, launch the installed app, or verify uninstall cleanup yet.
- This first controller does not write code, create update pull requests, respond to `/ai` comments in private repositories or publish user releases.
- macOS `macos-latest` uses the current GitHub-hosted Apple-silicon runner image. Brightdesk's universal macOS build is intended to include Intel support, but the controller still needs a real Intel Mac installation test.
- Windows ARM64 and Linux ARM64 are not included in the currently declared build matrix.
- The workflow does not require a paid AI API, paid AI key, signing key or paid self-hosted runner.
