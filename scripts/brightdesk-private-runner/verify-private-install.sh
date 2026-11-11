#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$1"
PLATFORM="$2"
RELEASE_DIR="$PROJECT_DIR/release"
SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"

run_bounded_launch() {
  local app_pid process_state status attempt
  BRIGHTDESK_STARTUP_SMOKE_TEST=1 BRIGHTDESK_REQUIRE_NATIVE_ENGINE=1 "$@" >/dev/null 2>&1 &
  app_pid=$!
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    process_state="$(ps -o stat= -p "$app_pid" 2>/dev/null | tr -d '[:space:]' || true)"
    if [[ -z "$process_state" || "$process_state" == Z* ]]; then
      if wait "$app_pid"; then
        return 0
      else
        status=$?
        echo "Installed application launch check failed with exit code $status." >&2
        return "$status"
      fi
    fi
    sleep 1
  done
  kill "$app_pid" 2>/dev/null || true
  wait "$app_pid" 2>/dev/null || true
  echo "Installed application launch check failed with exit code 124." >&2
  return 124
}

if [[ -z "$PROJECT_DIR" || ! -d "$PROJECT_DIR" ]]; then
  echo "Brightdesk installer smoke test received an invalid project directory." >&2
  exit 2
fi

case "$PLATFORM" in
  linux)
    DEB_FILE="$(find "$RELEASE_DIR" -maxdepth 1 -type f -name 'brightdesk-*.deb' -print -quit)"
    INSTALL_HELPER="$RELEASE_DIR/Brightdesk-Install-Linux.sh"
    if [[ -z "$DEB_FILE" || ! -f "$INSTALL_HELPER" ]]; then
      echo "Linux installer smoke test could not find the DEB package and consent helper." >&2
      exit 2
    fi

    PACKAGE_NAME="$(dpkg-deb -f "$DEB_FILE" Package)"
    if [[ ! "$PACKAGE_NAME" =~ ^[a-z0-9][a-z0-9+.-]*$ ]]; then
      echo "Linux installer package has an invalid package identifier." >&2
      exit 2
    fi
    INSTALLED_STATUS="$(dpkg-query -W -f='${db:Status-Status}' "$PACKAGE_NAME" 2>/dev/null || true)"
    case "$INSTALLED_STATUS" in
      ""|not-installed) ;;
      *)
        echo "The Brightdesk Linux package has pre-existing package state; refusing to replace or remove it." >&2
        exit 3
        ;;
    esac

    INSTALL_ATTEMPTED=0
    cleanup_linux() {
      if [[ "$INSTALL_ATTEMPTED" -eq 1 ]]; then
        sudo apt-get remove -y "$PACKAGE_NAME" >/dev/null 2>&1 || true
      fi
    }
    trap cleanup_linux EXIT

    export DEBIAN_FRONTEND=noninteractive
    INSTALL_ATTEMPTED=1
    printf 'yes\n' | bash "$INSTALL_HELPER"
    DESKTOP_FILE="$(dpkg-query -L "$PACKAGE_NAME" | grep -E '/usr/share/applications/[^/]+\.desktop$' | head -n 1 || true)"
    if [[ -z "$DESKTOP_FILE" || ! -f "$DESKTOP_FILE" ]]; then
      echo "Installed Linux package did not register a desktop application." >&2
      exit 1
    fi
    APP_BINARY="$(sed -n 's/^Exec=\([^[:space:]]*\).*/\1/p' "$DESKTOP_FILE" | head -n 1)"
    if [[ "$APP_BINARY" != /* ]]; then
      APP_BINARY="$(command -v "$APP_BINARY" || true)"
    fi
    if [[ -z "$APP_BINARY" || ! -x "$APP_BINARY" ]]; then
      echo "Installed Linux application executable was not found in the desktop entry or PATH." >&2
      exit 1
    fi
    APP_REAL_BINARY="$(readlink -f "$APP_BINARY")"
    APP_ROOT="$(dirname "$APP_REAL_BINARY")"
    NATIVE_ADDON="$APP_ROOT/resources/app.asar.unpacked/native/brightdesk_engine.node"
    if [[ ! -f "$NATIVE_ADDON" ]]; then
      echo "Installed Linux application is missing its unpacked Rust native addon." >&2
      exit 1
    fi
    if command -v xvfb-run >/dev/null 2>&1; then
      run_bounded_launch xvfb-run -a "$APP_BINARY" --no-sandbox
    else
      run_bounded_launch "$APP_BINARY" --no-sandbox
    fi
    sudo apt-get remove -y "$PACKAGE_NAME"
    INSTALL_ATTEMPTED=0
    trap - EXIT
    ;;
  mac)
    PKG_FILE="$(find "$RELEASE_DIR" -maxdepth 1 -type f -name '*.pkg' -print -quit)"
    DMG_FILE="$(find "$RELEASE_DIR" -maxdepth 1 -type f -name '*.dmg' -print -quit)"
    if [[ -z "$PKG_FILE" || -z "$DMG_FILE" ]]; then
      echo "macOS installer smoke test could not find both the PKG and DMG packages." >&2
      exit 2
    fi

    PRODUCT_NAME="$(node -e 'const p=require(process.argv[1]);process.stdout.write(String(p.build?.productName || ""))' "$PROJECT_DIR/package.json")"
    if [[ -z "$PRODUCT_NAME" || ! "$PRODUCT_NAME" =~ ^[A-Za-z0-9][A-Za-z0-9\ ._-]*$ ]]; then
      echo "macOS installer smoke test could not read a safe product name from package.json." >&2
      exit 2
    fi
    APP_BUNDLE_NAME="${PRODUCT_NAME}.app"
    PACKAGE_ID="$(node -e 'const p=require(process.argv[1]);process.stdout.write(String(p.build?.appId || ""))' "$PROJECT_DIR/package.json")"
    if [[ -z "$PACKAGE_ID" || ! "$PACKAGE_ID" =~ ^[A-Za-z0-9.-]+$ ]]; then
      echo "macOS installer smoke test could not read a safe package identifier from package.json." >&2
      exit 2
    fi
    APP_PATH="/Applications/$APP_BUNDLE_NAME"
    if [[ -e "$APP_PATH" || -L "$APP_PATH" ]]; then
      echo "A Brightdesk installation already exists; refusing to overwrite or remove it." >&2
      exit 3
    fi
    if pkgutil --pkg-info "$PACKAGE_ID" >/dev/null 2>&1; then
      echo "A Brightdesk installer receipt already exists; refusing to modify or forget it." >&2
      exit 3
    fi

    TEMP_ROOT="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
    TEMP_BASE="${TEMP_ROOT%/}"
    if [[ -z "$TEMP_BASE" ]]; then TEMP_BASE="/tmp"; fi
    WORK_DIR="$(mktemp -d "$TEMP_BASE/brightdesk-installer-smoke.XXXXXX")"
    MOUNT_DIR="$WORK_DIR/mount"
    DMG_APP="$WORK_DIR/$APP_BUNDLE_NAME"
    INSTALL_ATTEMPTED=0
    cleanup_macos() {
      hdiutil detach "$MOUNT_DIR" -quiet >/dev/null 2>&1 || true
      if [[ "$INSTALL_ATTEMPTED" -eq 1 ]]; then
        sudo rm -rf -- "$APP_PATH" >/dev/null 2>&1 || true
        sudo pkgutil --forget "$PACKAGE_ID" >/dev/null 2>&1 || true
      fi
      rm -rf -- "$WORK_DIR"
    }
    trap cleanup_macos EXIT
    mkdir "$MOUNT_DIR"

    hdiutil attach -quiet -nobrowse -mountpoint "$MOUNT_DIR" "$DMG_FILE"
    DMG_APP_SOURCE="$(find "$MOUNT_DIR" -maxdepth 3 -name "$APP_BUNDLE_NAME" -type d -print -quit)"
    if [[ -z "$DMG_APP_SOURCE" ]]; then
      echo "The macOS DMG did not contain the expected product bundle." >&2
      exit 1
    fi
    ditto "$DMG_APP_SOURCE" "$DMG_APP"
    DMG_NATIVE_ADDON="$DMG_APP/Contents/Resources/app.asar.unpacked/native/brightdesk_engine.node"
    if [[ ! -f "$DMG_NATIVE_ADDON" ]]; then
      echo "The macOS DMG app is missing its unpacked Rust native addon." >&2
      exit 1
    fi
    DMG_EXECUTABLE="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$DMG_APP/Contents/Info.plist")"
    run_bounded_launch "$DMG_APP/Contents/MacOS/$DMG_EXECUTABLE"
    hdiutil detach "$MOUNT_DIR" -quiet

    INSTALL_ATTEMPTED=1
    sudo installer -allowUntrusted -pkg "$PKG_FILE" -target / -agreeToLicense
    if [[ ! -d "$APP_PATH" || -L "$APP_PATH" ]]; then
      echo "The macOS PKG completed without installing the expected product bundle." >&2
      exit 1
    fi
    if [[ ! -f "$APP_PATH/Contents/Resources/app.asar.unpacked/native/brightdesk_engine.node" ]]; then
      echo "The macOS PKG app is missing its unpacked Rust native addon." >&2
      exit 1
    fi
    APP_EXECUTABLE="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP_PATH/Contents/Info.plist")"
    run_bounded_launch "$APP_PATH/Contents/MacOS/$APP_EXECUTABLE"
    sudo rm -rf -- "$APP_PATH"
    sudo pkgutil --forget "$PACKAGE_ID"
    INSTALL_ATTEMPTED=0
    rm -rf -- "$WORK_DIR"
    trap - EXIT
    ;;
  win)
    if command -v pwsh >/dev/null 2>&1; then
      pwsh -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$SCRIPT_DIR/verify-private-install.ps1" -ProjectDir "$PROJECT_DIR"
    elif command -v powershell.exe >/dev/null 2>&1; then
      powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$SCRIPT_DIR/verify-private-install.ps1" -ProjectDir "$PROJECT_DIR"
    else
      echo "Windows installer smoke test requires PowerShell." >&2
      exit 2
    fi
    ;;
  *)
    echo "Unsupported installer smoke-test platform: $PLATFORM" >&2
    exit 2
    ;;
esac

echo "Brightdesk $PLATFORM installer installation and launch smoke test passed."
