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
