import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renderiza a página principal da CDS Car", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /CDS Car/i);
  assert.match(html, /Seu próximo veículo/i);
  assert.match(html, /Nosso estoque/i);
  assert.match(html, /Rua Fernando Falcão, 102/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("mantém metadados, conteúdo e assets de produção", async () => {
  const [page, layout, packageJson, hostingConfig, ogImage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(page, /const vehicles: Vehicle\[\]/);
  assert.match(page, /WHATSAPP_NUMBER/);
  assert.match(layout, /CDS Car \| Veículos com procedência na Mooca/);
  assert.match(layout, /openGraph/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(hostingConfig, /project_id/);
  assert.ok(ogImage.byteLength > 100_000);
});
