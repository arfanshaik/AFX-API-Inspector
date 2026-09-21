import type { BenchmarkSummary, InspectResult } from "../types.js";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

function prettyBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return c.green;
  if (status >= 300 && status < 400) return c.cyan;
  if (status >= 400 && status < 500) return c.yellow;
  return c.red;
}

export function formatInspect(result: InspectResult, showHeaders = false): string {
  const lines: string[] = [];
  lines.push(`${c.bold}AFX API Inspector${c.reset}`);
  lines.push(`${c.dim}${result.request.method}${c.reset} ${result.request.url}`);
  lines.push("");
  lines.push(`${statusColor(result.response.status)}${c.bold}${result.response.status} ${result.response.statusText}${c.reset}`);
  lines.push(`Time       ${result.timing.durationMs.toFixed(1)} ms`);
  lines.push(`Size       ${prettyBytes(result.response.bytes)}`);
  lines.push(`Type       ${result.response.contentType || "unknown"}`);
  lines.push(`Final URL  ${result.response.finalUrl}`);
  if (result.response.redirected) lines.push(`Redirect   yes`);

  if (showHeaders) {
    lines.push("", `${c.bold}Response Headers${c.reset}`);
    for (const [key, value] of Object.entries(result.response.headers)) {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("", `${c.bold}Response Body${c.reset}`);
  lines.push(formatBody(result.response.body, result.response.contentType));
  return lines.join("\n");
}

function formatBody(body: string, contentType: string): string {
  if (!body) return `${c.dim}<empty>${c.reset}`;
  if (contentType.toLowerCase().includes("json")) {
    try { return JSON.stringify(JSON.parse(body), null, 2); } catch { /* fall through */ }
  }
  return body;
}

export function formatBenchmark(summary: BenchmarkSummary): string {
  return [
    `${c.bold}AFX API Inspector — Benchmark${c.reset}`,
    `Requests        ${summary.totalRequests}`,
    `Successful      ${summary.successful}`,
    `Failed          ${summary.failed}`,
    `Total time      ${summary.durationMs.toFixed(1)} ms`,
    `Throughput      ${summary.requestsPerSecond.toFixed(2)} req/s`,
    `Latency min     ${summary.latency.minMs.toFixed(1)} ms`,
    `Latency avg     ${summary.latency.avgMs.toFixed(1)} ms`,
    `Latency p50     ${summary.latency.p50Ms.toFixed(1)} ms`,
    `Latency p95     ${summary.latency.p95Ms.toFixed(1)} ms`,
    `Latency max     ${summary.latency.maxMs.toFixed(1)} ms`,
    `Status codes    ${Object.entries(summary.statusCounts).map(([k, v]) => `${k}:${v}`).join("  ") || "none"}`
  ].join("\n");
}
