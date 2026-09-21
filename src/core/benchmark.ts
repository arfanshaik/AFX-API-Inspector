import { performance } from "node:perf_hooks";
import { inspectRequest } from "./http-client.js";
import type { BenchmarkOptions, BenchmarkSummary } from "../types.js";

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

export async function benchmark(options: BenchmarkOptions): Promise<BenchmarkSummary> {
  if (!Number.isInteger(options.requests) || options.requests <= 0) throw new Error("requests must be a positive integer");
  if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) throw new Error("concurrency must be a positive integer");

  const latencies: number[] = [];
  const statusCounts: Record<string, number> = {};
  let successful = 0;
  let failed = 0;
  let nextIndex = 0;
  const started = performance.now();

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex++;
      if (index >= options.requests) return;
      try {
        const result = await inspectRequest(options);
        latencies.push(result.timing.durationMs);
        const key = String(result.response.status);
        statusCounts[key] = (statusCounts[key] ?? 0) + 1;
        if (result.response.ok) successful++; else failed++;
      } catch {
        failed++;
        statusCounts.error = (statusCounts.error ?? 0) + 1;
      }
    }
  }

  const workers = Array.from({ length: Math.min(options.concurrency, options.requests) }, () => worker());
  await Promise.all(workers);
  const durationMs = performance.now() - started;
  const sorted = [...latencies].sort((a, b) => a - b);
  const avg = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;

  return {
    totalRequests: options.requests,
    successful,
    failed,
    durationMs,
    requestsPerSecond: durationMs > 0 ? (options.requests / durationMs) * 1000 : 0,
    latency: {
      minMs: sorted[0] ?? 0,
      avgMs: avg,
      p50Ms: percentile(sorted, 50),
      p95Ms: percentile(sorted, 95),
      maxMs: sorted[sorted.length - 1] ?? 0
    },
    statusCounts
  };
}
