import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

test("Brightdesk shared shell matches the approved visual contract", () => {
  for (const [token, value] of [
    ["--bd-canvas", "#F3F6FA"],
    ["--bd-surface", "#FFFFFF"],
    ["--bd-ink", "#202B3C"],
    ["--bd-nav-text", "#EEF3FB"],
    ["--bd-accent", "#4B68A8"],
    ["--bd-accent-strong", "#395287"],
    ["--bd-accent-soft", "#EFF2F9"]
  ]) {
    assert.ok(css.includes(token + ": " + value + ";"), "missing approved " + token + " value " + value);
  }
  assert.ok(css.includes(".sidebar {\n  color: var(--bd-nav-text);\n  background: var(--bd-nav-gradient);"), "sidebar must use the shared deep-navy navigation");
  assert.ok(css.includes(":focus-visible { outline-color: var(--bd-accent); }"), "focus indicator must use the product accent");
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce) {"), "reduced-motion support is required");
});
