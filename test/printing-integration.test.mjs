import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const read=file=>fs.readFileSync(path.join(process.cwd(),file),"utf8");

test("Workspace vendors the canonical dependency-free Printing package",()=>{
 const pkg=JSON.parse(read("src/printing-package/package.json")),up=JSON.parse(read("src/printing-package/UPSTREAM.json"));
 assert.equal(pkg.name,"@brightdesk/printing");assert.equal(pkg.version,"0.1.0");assert.deepEqual(pkg.dependencies||{},{});
 assert.equal(up.sourceRepository,"conz20/Brightdesk-Printing");assert.equal(up.sourceCommit,"70d41095616c6d1cd3473c0ad73a6ecb5a596c05");
 assert.ok(fs.statSync(path.join(process.cwd(),"src/printing-package/src/electron-print-adapter.mjs")).isFile());
});
test("Workspace exposes Print actions through protected IPC and preload",()=>{
 const html=read("src/index.html"),app=read("src/app.js"),main=read("src/main.js"),preload=read("src/preload.js");
 assert.match(html,/id="print-button"/);assert.match(html,/id="printer-settings-button"/);
 assert.ok(app.includes("window.brightdesk.printing.print({ printBackground: true })"));
 assert.ok(app.includes("window.brightdesk.printing.openPrinterSettings()"));
 assert.match(main,/registerPrintingIpcHandlers/);assert.match(preload,/printing:list-printers/);
});
test("built-in languages contain printing labels",()=>{for(const locale of ["en-AU","de-DE","es-ES","fr-FR"]){const p=JSON.parse(read("src/languages/"+locale+".json"));assert.ok(p.translations["top.print"]);assert.ok(p.translations["top.printerSettings"]);}});
test("native Mac and Windows helper sources are included and selected by platform",()=>{
 const native=read("scripts/build-native.js"),builder=read("scripts/build-printing-native.js"),mac=read("src/printing-package/tools/build-macos-printer-discovery.sh");
 for(const f of ["src/printing-package/native/macos/ipp-printer-discovery.swift","src/printing-package/native/windows/ipp-printer-discovery.cpp","src/printing-package/tools/build-macos-printer-discovery.sh","src/printing-package/tools/build-windows-printer-discovery.ps1"])assert.ok(fs.statSync(path.join(process.cwd(),f)).isFile(),f);
 assert.ok(native.includes("build-printing-native.js"));assert.match(builder,/process\.platform/);
 assert.match(mac,/arm64-apple-macosx/);assert.match(mac,/x86_64-apple-macosx/);assert.match(mac,/lipo -create/);assert.ok(mac.includes('lipo "$OUTPUT" -verify_arch arm64 x86_64'));
});
test("Workspace packages printer helpers and local-network metadata without losing Rust engine",()=>{
 const pkg=JSON.parse(read("package.json"));
 for(const f of ["native/brightdesk_engine.node","src/printing-package/native/macos/brightdesk-ipp-discovery","src/printing-package/native/windows/brightdesk-ipp-discovery.exe"])assert.ok(pkg.build.asarUnpack.includes(f),f);
 assert.deepEqual(pkg.build.mac.extendInfo.NSBonjourServices,["_ipp._tcp","_ipps._tcp","_printer._tcp"]);
 assert.match(pkg.build.mac.extendInfo.NSLocalNetworkUsageDescription,/printer/i);
 const config=read("electron-builder.app.config.js");
 assert.match(config,/brightdesk_engine\.node/);assert.match(config,/brightdesk-ipp-discovery/);assert.match(config,/NSBonjourServices/);
});


test("macOS printer discovery helper is a universal Apple Silicon and Intel executable",()=>{
 const macBuild=read("src/printing-package/tools/build-macos-printer-discovery.sh");
 const upstream=JSON.parse(read("src/printing-package/UPSTREAM.json"));
 assert.match(macBuild,/arm64-apple-macosx/);
 assert.match(macBuild,/x86_64-apple-macosx/);
 assert.match(macBuild,/xcrun lipo -create/);
 assert.ok(macBuild.includes('lipo "$OUTPUT" -verify_arch arm64 x86_64'));
 assert.equal(upstream.localPatches.macOSBuildScript.sourceCommit,"1b1d7264413520885b400884103095196377a659");

 const windowsBuild=read("src/printing-package/tools/build-windows-printer-discovery.ps1");
 assert.ok(windowsBuild.includes('$TempDir = Join-Path'));
 assert.ok(windowsBuild.includes('$Object = Join-Path $TempDir'));
 assert.ok(windowsBuild.includes('finally {'));
 assert.ok(windowsBuild.includes('Remove-Item -LiteralPath $TempDir -Recurse -Force'));
 assert.equal(upstream.localPatches.windowsBuildScript.sourceCommit,"bb057ac192faa714e92deb218768506301d21367");

});


test("prepares a content-only print document for every Brightdesk product", () => {
  const app = read("src/app.js");
  const css = read("src/styles.css");
  assert.match(app, /const PRINTABLE_APP_TARGETS/);
  assert.match(app, /createBrightdeskPrintDocument/);
  assert.match(app, /activeDoc\(\)\.slides/);
  for (const appId of [
    "pages", "sheets", "slides", "notes", "database",
    "forms", "lists", "planner", "todo", "loop"
  ]) {
    assert.ok(app.includes(appId), `Missing print support for ${appId}`);
  }
  assert.match(app, /brightdesk-print-root/);
  assert.match(css, /#brightdesk-print-root/);
  assert.match(css, /data-app=["']slides["']/);
});


test("the current Forms view exposes its available printable question content", () => {
  const html = read("src/index.html");
  const app = read("src/app.js");
  for (const id of [
    "forms-wrap",
    "forms-questions-panel",
    "forms-title",
    "forms-description",
    "forms-question-list",
    "forms-add-question-form"
  ]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(app, /forms:\s*"forms-wrap"/);
  assert.match(app, /createBrightdeskPrintDocument/);
});


test("keeps discovered network printer addresses and service URIs out of product records", async () => {
  const { createHash } = await import("node:crypto");
  const { discoverNetworkPrinterServices } = await import(
    "../src/printing-package/src/ipp-printer-discovery.mjs"
  );

  for (const [serviceUri, address] of [
    ["ipp://192.168.10.24:631/ipp/print", "192.168.10.24"],
    ["ipps://[2001:db8::25]:631/ipp/print", "2001:db8::25"],
    ["ipp://192.168.10.24.local:631/ipp/print", "192.168.10.24"]
  ]) {
    const printers = await discoverNetworkPrinterServices({
      platform: "linux",
      async runCommand() {
        return { stdout: `${serviceUri}\n` };
      }
    });

    const plainDigest = `dns-sd:${createHash("sha256").update(serviceUri, "utf8").digest("hex")}`;
    assert.deepEqual(printers.map(({ id, ...printer }) => printer), [{
      displayName: "Network printer",
      source: "dns-sd",
      availability: "discovered",
      canPrint: false
    }]);
    assert.equal(Object.hasOwn(printers[0], "uri"), false);
    assert.equal(JSON.stringify(printers).includes(serviceUri), false);
    assert.equal(JSON.stringify(printers).includes(address), false);
    assert.match(printers[0].id, /^dns-sd:[a-f0-9]{64}$/);
    assert.notEqual(printers[0].id, plainDigest);
    const repeated = await discoverNetworkPrinterServices({
      platform: "linux",
      async runCommand() { return { stdout: `${serviceUri}\n` }; },
    });
    assert.equal(repeated[0].id, printers[0].id);
  }
});

test("keeps friendly DNS-SD printer names without exposing their service URI", async () => {
  const { discoverNetworkPrinterServices } = await import(
    "../src/printing-package/src/ipp-printer-discovery.mjs"
  );
  const serviceUri = "ipp://Office-Laser.local:631/ipp/print";
  const printers = await discoverNetworkPrinterServices({
    platform: "linux",
    async runCommand() {
      return { stdout: `${serviceUri}\n` };
    }
  });

  assert.equal(printers.length, 1);
  assert.equal(printers[0].displayName, "Office Laser");
  assert.match(printers[0].id, /^dns-sd:[a-f0-9]{64}$/);
  assert.equal(Object.hasOwn(printers[0], "uri"), false);
  assert.equal(JSON.stringify(printers).includes(serviceUri), false);
});

test("keeps Windows WSD device IDs private across refreshes while pairing through the main process", async () => {
  const { discoverNetworkPrinterServices, pairDiscoveredWsdPrinter } = await import(
    "../src/printing-package/src/ipp-printer-discovery.mjs"
  );
  const deviceId = "Brightdesk-Private-WSD-Office-Printer";
  const encodedDeviceId = Buffer.from(deviceId, "utf8").toString("base64url");
  const encodedName = Buffer.from("Office Printer", "utf8").toString("base64url");
  const scan = (id, name) => discoverNetworkPrinterServices({
    platform: "win32",
    async runCommand() { return { stdout: `WSD\t${id}\t${name}\t1\t0\n` }; }
  });

  const [selectedPrinter] = await scan(encodedDeviceId, encodedName);
  assert.equal(selectedPrinter.displayName, "Office Printer");
  assert.match(selectedPrinter.id, /^wsd:[a-f0-9]{64}$/);
  assert.notEqual(selectedPrinter.id, `wsd:${encodedDeviceId}`);
  assert.equal(JSON.stringify(selectedPrinter).includes(encodedDeviceId), false);
  assert.equal(JSON.stringify(selectedPrinter).includes(deviceId), false);

  let pairArgs;
  const paired = await pairDiscoveredWsdPrinter(selectedPrinter, {
    platform: "win32",
    async runCommand(_command, args) {
      pairArgs = args;
      return { stdout: "WSD_PAIR_RESULT\tPAIRED\n" };
    }
  });
  assert.deepEqual(pairArgs, ["--pair-wsd", encodedDeviceId]);
  assert.deepEqual(paired, { status: "paired", protocol: "wsd", refreshRequired: true });

  const otherId = Buffer.from("Brightdesk-Another-WSD-Printer", "utf8").toString("base64url");
  const otherName = Buffer.from("Another Printer", "utf8").toString("base64url");
  await scan(otherId, otherName);
  let refreshedPairArgs;
  const refreshedPairing = await pairDiscoveredWsdPrinter(selectedPrinter, {
    platform: "win32",
    async runCommand(_command, args) {
      refreshedPairArgs = args;
      return { stdout: "WSD_PAIR_RESULT\tPAIRED\n" };
    }
  });
  assert.deepEqual(refreshedPairArgs, ["--pair-wsd", encodedDeviceId]);
  assert.deepEqual(refreshedPairing, { status: "paired", protocol: "wsd", refreshRequired: true });
});
  
test("offers an explicit network-printer search and safe result actions", () => {
  const html = read("src/index.html");
  const app = read("src/app.js");

  assert.match(html, /id="find-network-printers-button"/);
  assert.match(html, /id="network-printer-panel"/);
  assert.match(html, /id="discover-network-printers-button"/);
  assert.match(html, /id="network-printer-results"/);
  assert.match(html, /id="network-printer-status"/);
  assert.match(app, /\$\('find-network-printers-button'\)\.addEventListener\('click', openNetworkPrinterPanel\)/);
  assert.match(app, /\$\('discover-network-printers-button'\)\.addEventListener\('click', discoverNetworkPrinters\)/);
  assert.match(app, /window\.brightdesk\.printing\.discoverNetworkPrinters\(\)/);
  assert.match(app, /window\.brightdesk\.printing\.pairNetworkPrinter\(printer\)/);
  assert.match(app, /window\.brightdesk\.printing\.openPrinterSettings\(\)/);
  assert.doesNotMatch(app, /printer\.uri/);
});

test("shows safe configured-printer capability details and unknown values honestly", () => {
  const html = read("src/index.html");
  const app = read("src/app.js");
  assert.match(html, /id="refresh-configured-printers-button"/);
  assert.match(html, /id="configured-printer-list"/);
  assert.match(html, /id="configured-printer-status"/);
  assert.match(app, /window\.brightdesk\.printing\.listPrinters\(\)/);
  assert.match(app, /window\.brightdesk\.printing\.getPrinterCapabilities\(/);
  assert.match(app, /renderPrinterCapabilities/);
  assert.match(app, /printing\.notReported/);
  assert.match(app, /printing\.maximumCopies/);
  assert.match(app, /printer\.systemName/);
  assert.match(app, /textContent/);
  assert.match(app, /await refreshConfiguredPrinters\(\)/);
});
