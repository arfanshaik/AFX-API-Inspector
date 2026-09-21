#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { benchmark } from "./core/benchmark.js";
import { parseCommonArgs } from "./core/args.js";
import { runCollection, loadCollection } from "./core/collection.js";
import { formatBenchmark, formatInspect } from "./core/format.js";
import { inspectRequest, loadBody, withJsonContentType } from "./core/http-client.js";

const VERSION = "1.0.0";

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "-h" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "version" || command === "-v" || command === "--version") {
    console.log(`AFX API Inspector v${VERSION}`);
    return;
  }

  if (command === "request") {
    await commandRequest(args);
    return;
  }

  if (command === "benchmark") {
    await commandBenchmark(args);
    return;
  }

  if (command === "collection") {
    await commandCollection(args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function commandRequest(args: string[]): Promise<void> {
  const parsed = parseCommonArgs(args);
  if (parsed.rest.length !== 1) throw new Error("request expects exactly one URL");
  const body = loadBody(parsed.data, parsed.bodyFile);
  const result = await inspectRequest({
    url: parsed.rest[0],
    method: parsed.method,
    headers: withJsonContentType(parsed.headers, body),
    body,
    timeoutMs: parsed.timeoutMs,
    followRedirects: parsed.followRedirects
  });

  if (parsed.output) writeFileSync(parsed.output, result.response.body);
  console.log(parsed.json ? JSON.stringify(result, null, 2) : formatInspect(result, parsed.showHeaders));
  if (!result.response.ok) process.exitCode = 1;
}

async function commandBenchmark(args: string[]): Promise<void> {
  let requests = 20;
  let concurrency = 4;
  const common: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-n" || args[i] === "--requests") {
      const value = args[++i];
      if (!value) throw new Error("Missing request count");
      requests = Number(value);
    } else if (args[i] === "-c" || args[i] === "--concurrency") {
      const value = args[++i];
      if (!value) throw new Error("Missing concurrency value");
      concurrency = Number(value);
    } else {
      common.push(args[i]);
    }
  }

  const parsed = parseCommonArgs(common);
  if (parsed.rest.length !== 1) throw new Error("benchmark expects exactly one URL");
  const body = loadBody(parsed.data, parsed.bodyFile);
  const summary = await benchmark({
    url: parsed.rest[0],
    method: parsed.method,
    headers: withJsonContentType(parsed.headers, body),
    body,
    timeoutMs: parsed.timeoutMs,
    followRedirects: parsed.followRedirects,
    requests,
    concurrency
  });
  console.log(parsed.json ? JSON.stringify(summary, null, 2) : formatBenchmark(summary));
  if (summary.failed > 0) process.exitCode = 1;
}

async function commandCollection(args: string[]): Promise<void> {
  if (args.length < 2 || args[0] !== "run") {
    throw new Error("Usage: afx-api-inspector collection run <collection.json> [--json]");
  }
  const file = args[1];
  const json = args.includes("--json");
  const collection = loadCollection(file);
  const results = await runCollection(collection);

  if (json) {
    console.log(JSON.stringify({ name: collection.name ?? file, results }, null, 2));
    return;
  }

  console.log(`AFX API Inspector — Collection: ${collection.name ?? file}`);
  for (const item of results) {
    if (item.error) {
      console.log(`✗ ${item.name} — ${item.error}`);
    } else if (item.result) {
      console.log(`${item.result.response.ok ? "✓" : "✗"} ${item.name} — ${item.result.response.status} — ${item.result.timing.durationMs.toFixed(1)} ms`);
    }
  }
  if (results.some((item) => item.error || !item.result?.response.ok)) process.exitCode = 1;
}

function printHelp(): void {
  console.log(`AFX API Inspector — inspect and test HTTP APIs from the terminal

Usage:
  afx-api-inspector request <url> [options]
  afx-api-inspector benchmark <url> [options]
  afx-api-inspector collection run <file.json> [--json]
  afx-api-inspector version

Request options:
  -X, --method <METHOD>        GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
  -H, --header "K: V"          Add request header (repeatable)
  -d, --data <body>           Request body
      --body-file <path>      Read request body from file
      --timeout <duration>    Timeout, e.g. 1500ms, 10s, 1m
      --no-follow             Do not follow redirects
  -i, --include-headers       Print response headers
      --json                  Machine-readable JSON output
  -o, --output <path>         Save raw response body

Benchmark options:
  -n, --requests <count>      Total requests (default 20)
  -c, --concurrency <count>   Concurrent requests (default 4)
  Plus all request options above.

Examples:
  afx-api-inspector request https://api.github.com
  afx-api-inspector request https://httpbin.org/post -X POST -d '{"name":"AFX"}'
  afx-api-inspector request https://example.com -i --timeout 5s
  afx-api-inspector benchmark https://example.com -n 50 -c 5
  afx-api-inspector collection run examples/collection.json
`);
}

main().catch((error: any) => {
  console.error(`AFX API Inspector error: ${error?.message ?? String(error)}`);
  process.exitCode = 1;
});
