import test from "node:test";
import assert from "node:assert/strict";
import printingIpc from "../src/printing-ipc.cjs";

const { registerPrintingIpcHandlers } = printingIpc;

function makeHarness(authorized = true) {
  const handlers = new Map();
  let adapterRequests = 0;
  const adapter = {
    listPrinters: async () => [{ systemName: "Virtual_Printer" }],
    discoverNetworkPrinters: async () => [],
    pairNetworkPrinter: async (printer) => ({ status: "paired", printer }),
    getPrinterCapabilities: async (name) => ({ systemName: name }),
    openPrinterSettings: async () => ({ status: "opened" }),
    print: async (request) => ({ status: "submitted", requestedPrinterName: request.printerName ?? null }),
  };
  registerPrintingIpcHandlers({ handle: (name, fn) => handlers.set(name, fn) }, {
    isAuthorizedSender: () => authorized,
    getAdapter: async () => { adapterRequests += 1; return adapter; },
  });
  return { handlers, get adapterRequests() { return adapterRequests; } };
}

test("registers the six supported printing channels", () => {
  const { handlers } = makeHarness();
  assert.deepEqual([...handlers.keys()].sort(), [
    "printing:discover-network-printers", "printing:get-capabilities",
    "printing:list-printers", "printing:open-settings",
    "printing:pair-network-printer", "printing:print",
  ]);
});

test("rejects unauthorized renderer requests before creating an adapter", async () => {
  const harness = makeHarness(false);
  await assert.rejects(harness.handlers.get("printing:list-printers")({ sender: {} }), /Invalid sender/);
  await assert.rejects(harness.handlers.get("printing:print")({ sender: {} }, {}), /Invalid sender/);
  assert.equal(harness.adapterRequests, 0);
});

test("forwards authorized calls to the shared adapter", async () => {
  const harness = makeHarness(true);
  const event = { sender: {} };
  const printer = { id: "wsd:virtual", canPrint: false };
  assert.deepEqual(await harness.handlers.get("printing:list-printers")(event), [{ systemName: "Virtual_Printer" }]);
  assert.deepEqual(await harness.handlers.get("printing:discover-network-printers")(event), []);
  assert.deepEqual(await harness.handlers.get("printing:pair-network-printer")(event, printer), { status: "paired", printer });
  assert.deepEqual(await harness.handlers.get("printing:get-capabilities")(event, "Virtual_Printer"), { systemName: "Virtual_Printer" });
  assert.deepEqual(await harness.handlers.get("printing:open-settings")(event), { status: "opened" });
  assert.deepEqual(await harness.handlers.get("printing:print")(event, { printerName: "Virtual_Printer" }), {
    status: "submitted", requestedPrinterName: "Virtual_Printer",
  });
  assert.equal(harness.adapterRequests, 6);
});
