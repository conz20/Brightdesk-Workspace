#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
PROJECT_DIR="${2:-}"
PROJECT_NAME="${3:-unknown}"
PLATFORM="${4:-}"
VERIFY_SCRIPT="${5:-}"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "$MODE" || -z "$PROJECT_DIR" || ! -d "$PROJECT_DIR" ]]; then
  echo "Brightdesk private project checker received invalid arguments." >&2
  exit 2
fi

PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
LOG_FILE="${RUNNER_TEMP:-/tmp}/brightdesk-private-${PROJECT_NAME}-${PLATFORM:-tests}.log"
STAGE="runtime check"

fail_check() {
  status="$1"
  if [[ "$MODE" == "build" && "$PROJECT_NAME" == "Brightdesk-suite" && "$PLATFORM" =~ ^(win|mac|linux)$ ]]; then
    local summary_file="${RUNNER_TEMP:-/tmp}/brightdesk-suite-installer-${PLATFORM}-failure-summary.b64"
    if node "$SCRIPT_DIR/private-installer-diagnostics.js" "$LOG_FILE" "$PLATFORM" "$STAGE" "$status" > "$summary_file" 2>/dev/null; then
      if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        printf 'installer_failure_summary_file=%s\n' "$summary_file" >> "$GITHUB_OUTPUT"
      fi
    else
      rm -f "$summary_file"
    fi
  fi
  {
    echo "## Brightdesk private project check"
    echo
    echo "- Project: ${PROJECT_NAME}"
    echo "- Operating system: ${RUNNER_OS:-unknown}"
    if [[ -n "$PLATFORM" ]]; then
      echo "- Installer target: ${PLATFORM}"
    fi
    echo "- Result: **FAILED**"
    echo "- Failed stage: ${STAGE}"
    echo "- Detailed output was kept only on the temporary runner and was not published."
  } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  if [[ "$STAGE" == "installer installation smoke test" && -f "$LOG_FILE" ]]; then
    echo "- Safe smoke-test diagnostics (allowlisted messages only):" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
    diagnostic_count=0
    while IFS= read -r line; do
      case "$line" in
        "Installed application launch check failed with exit code "[0-9]*"."|"The Windows installer exited with code "[0-9]*"."|"The Windows uninstaller exited with code "[0-9]*"."|"Missing system runtime libraries: "*|"Windows installer smoke test requires PowerShell."|"The Windows installer did not install Brightdesk.exe."|"The Windows installer did not create its uninstaller."|"The installed Windows application did not launch its version check."|"The installed Windows application did not complete its startup check."|"The macOS PKG completed without installing Brightdesk.app."|"The macOS DMG did not contain Brightdesk.app.")
          diagnostic_count=$((diagnostic_count + 1))
          printf '  - %s\\n' "$line" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
          printf 'Safe smoke-test diagnostic: %s\\n' "$line" >&2
          ;;
      esac
    done < "$LOG_FILE"
    if [[ "$diagnostic_count" -eq 0 ]]; then
      if [[ "$status" -eq 127 ]]; then
        diagnostic="No allowlisted smoke-test diagnostic matched; a command or executable could not start (exit code 127)."
      else
        diagnostic="No allowlisted smoke-test diagnostic matched; the smoke-test process exited with code $status."
      fi
      echo "- $diagnostic" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
      printf 'Safe smoke-test diagnostic: %s\\n' "$diagnostic" >&2
    fi
  fi
  echo "::error title=Brightdesk check failed::${PROJECT_NAME} failed at ${STAGE} on ${RUNNER_OS:-unknown}. Private command output was suppressed."
  exit "$status"
}

run_private_command() {
  local stage="$1"
  shift
  STAGE="$stage"
  if (cd "$PROJECT_DIR" && "$@") >> "$LOG_FILE" 2>&1; then
    return 0
  else
    local status=$?
    fail_check "$status"
  fi
}

if [[ ! -f "$PROJECT_DIR/package.json" || ! -f "$PROJECT_DIR/package-lock.json" ]]; then
  STAGE="project files"
  fail_check 2
fi

if ! node -e "const p=require(process.argv[1]); if (p.engines?.node !== '24.22.2') process.exit(1)" "$PROJECT_DIR/package.json"; then
  STAGE="required Node.js version"
  fail_check 2
fi

run_private_tests() {
  STAGE="automated tests"
  if (cd "$PROJECT_DIR" && npm test -- --test-reporter=tap) >> "$LOG_FILE" 2>&1; then
    return 0
  else
    local status=$?
    if [[ "$PROJECT_NAME" == "Brightdesk-suite" ]]; then
      local summary
      local summary_file="${RUNNER_TEMP:-/tmp}/brightdesk-private-${PROJECT_NAME}-failure-summary.b64"
      summary="$(node "$SCRIPT_DIR/private-test-diagnostics.js" "$LOG_FILE" "$PROJECT_NAME")"
      printf '%s' "$summary" > "$summary_file"
      if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        printf 'failure_summary_file=%s\n' "$summary_file" >> "$GITHUB_OUTPUT"
      fi
    fi
    fail_check "$status"
  fi
}

run_rust_checks() {
  if [[ ! -f "$PROJECT_DIR/rust/Cargo.toml" ]]; then
    echo "Rust workspace not present; skipping Rust-specific checks."
    return 0
  fi
  run_private_command "Rust formatting check" cargo fmt --manifest-path rust/Cargo.toml --all -- --check
  run_private_command "Rust Clippy" cargo clippy --manifest-path rust/Cargo.toml --workspace --all-targets -- -D warnings
  run_private_command "Rust unit tests" cargo test --manifest-path rust/Cargo.toml --workspace
}

if [[ "$MODE" == "test" ]]; then
  run_private_command "Node.js version check" npm run check:node
  run_private_command "dependency lock check" npm run lock:verify
  run_private_command "locked dependency installation" npm ci --no-audit --no-fund
  run_rust_checks
  run_private_command "third-party licence check" npm run verify:licenses
  if [[ -f "$PROJECT_DIR/rust/Cargo.toml" ]]; then
    run_private_command "Rust Node-API addon build" npm run native:build
    BRIGHTDESK_REQUIRE_NATIVE_ENGINE=1 run_private_tests
  else
    run_private_tests
  fi
  run_private_command "release readiness check" npm run release:preflight
elif [[ "$MODE" == "build" ]]; then
  if [[ -z "$PLATFORM" || -z "$VERIFY_SCRIPT" ]]; then
    STAGE="build configuration"
    fail_check 2
  fi
  run_private_command "Node.js version check" npm run check:node
  run_private_command "dependency lock check" npm run lock:verify
  run_private_command "locked dependency installation" npm ci --no-audit --no-fund
  run_rust_checks
  run_private_command "third-party licence check" npm run verify:licenses
  run_private_command "release readiness check" npm run release:preflight
  if [[ "$PLATFORM" == "mac" ]]; then
    export CSC_IDENTITY_AUTO_DISCOVERY=false
  fi
  run_private_command "installer build" npm run "dist:${PLATFORM}"
  run_private_command "release asset preparation" npm run release:prepare -- "$PLATFORM"
  run_private_command "installer package verification" npm run "$VERIFY_SCRIPT"
  if [[ "$PROJECT_NAME" == "Brightdesk-suite" ]]; then
    run_private_command "installer installation smoke test" bash "$SCRIPT_DIR/verify-private-install.sh" "$PROJECT_DIR" "$PLATFORM"
  fi
else
  STAGE="unknown check mode"
  fail_check 2
fi

{
  echo "## Brightdesk private project check"
  echo
  echo "- Project: ${PROJECT_NAME}"
  echo "- Operating system: ${RUNNER_OS:-unknown}"
  if [[ -n "$PLATFORM" ]]; then
    echo "- Installer target: ${PLATFORM}"
  fi
  echo "- Result: **PASSED**"
  echo "- Detailed command output was not published."
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "Brightdesk private project checks passed."
