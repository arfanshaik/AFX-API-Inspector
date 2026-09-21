import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import type { InspectResult, RequestOptions } from "../types.js";

export async function inspectRequest(options: RequestOptions): Promise<InspectResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
      body: options.method === "GET" || options.method === "HEAD" ? undefined : options.body,
      redirect: options.followRedirects ? "follow" : "manual",
      signal: controller.signal
    });

    const body = options.method === "HEAD" ? "" : await response.text();
    const durationMs = performance.now() - started;
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => { responseHeaders[key] = value; });

    return {
      request: {
        url: options.url,
        method: options.method,
        headers: options.headers,
        bodyBytes: options.body ? Buffer.byteLength(options.body, "utf8") : 0
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        finalUrl: response.url || options.url,
        redirected: response.redirected,
        headers: responseHeaders,
        body,
        bytes: Buffer.byteLength(body, "utf8"),
        contentType: response.headers.get("content-type") ?? ""
      },
      timing: { durationMs }
    };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${options.timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function loadBody(data?: string, bodyFile?: string): string | undefined {
  if (bodyFile) return readFileSync(bodyFile, "utf8");
  return data;
}

export function withJsonContentType(headers: Record<string, string>, body?: string): Record<string, string> {
  if (!body) return headers;
  const hasContentType = Object.keys(headers).some((key) => key.toLowerCase() === "content-type");
  if (hasContentType) return headers;
  try {
    JSON.parse(body);
    return { ...headers, "Content-Type": "application/json" };
  } catch {
    return headers;
  }
}
