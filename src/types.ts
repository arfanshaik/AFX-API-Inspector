export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface RequestOptions {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  timeoutMs: number;
  followRedirects: boolean;
}

export interface InspectResult {
  request: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    bodyBytes: number;
  };
  response: {
    status: number;
    statusText: string;
    ok: boolean;
    finalUrl: string;
    redirected: boolean;
    headers: Record<string, string>;
    body: string;
    bytes: number;
    contentType: string;
  };
  timing: {
    durationMs: number;
  };
}

export interface BenchmarkOptions extends RequestOptions {
  requests: number;
  concurrency: number;
}

export interface BenchmarkSummary {
  totalRequests: number;
  successful: number;
  failed: number;
  durationMs: number;
  requestsPerSecond: number;
  latency: {
    minMs: number;
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
    maxMs: number;
  };
  statusCounts: Record<string, number>;
}

export interface CollectionFile {
  name?: string;
  requests: Array<{
    name?: string;
    url: string;
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
    followRedirects?: boolean;
  }>;
}
