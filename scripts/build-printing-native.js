#!/usr/bin/env node
"use strict";

const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const toolsDir = path.join(root, "src", "printing-package", "tools");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root, stdio: "inherit", shell: false, env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.platform === "darwin") {
  run("bash", [path.join(toolsDir, "build-macos-printer-discovery.sh")]);
} else if (process.platform === "win32") {
  run("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(toolsDir, "build-windows-printer-discovery.ps1")]);
} else if (process.platform === "linux") {
  console.log("Brightdesk Printing uses the host CUPS ippfind utility on Linux.");
} else {
  console.error(`Brightdesk Printing does not support native discovery builds on ${process.platform}.`);
  process.exit(2);
}
