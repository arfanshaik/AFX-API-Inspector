import { readFileSync } from "node:fs";
import { inspectRequest, withJsonContentType } from "./http-client.js";
import type { CollectionFile, InspectResult } from "../types.js";

export function loadCollection(path: string): CollectionFile {
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as CollectionFile;
  if (!parsed || !Array.isArray(parsed.requests)) {
    throw new Error("Collection must contain a requests array");
  }
  for (const [index, request] of parsed.requests.entries()) {
    if (!request?.url || typeof request.url !== "string") {
      throw new Error(`Collection request #${index + 1} is missing a URL`);
    }
  }
  return parsed;
}

export async function runCollection(collection: CollectionFile): Promise<Array<{ name: string; result?: InspectResult; error?: string }>> {
  const output: Array<{ name: string; result?: InspectResult; error?: string }> = [];
  for (let i = 0; i < collection.requests.length; i++) {
    const request = collection.requests[i];
    const body = request.body === undefined ? undefined : typeof request.body === "string" ? request.body : JSON.stringify(request.body);
    try {
      const result = await inspectRequest({
        url: request.url,
        method: request.method ?? "GET",
        headers: withJsonContentType(request.headers ?? {}, body),
        body,
        timeoutMs: request.timeoutMs ?? 15_000,
        followRedirects: request.followRedirects ?? true
      });
      output.push({ name: request.name ?? `Request ${i + 1}`, result });
    } catch (error: any) {
      output.push({ name: request.name ?? `Request ${i + 1}`, error: error?.message ?? String(error) });
    }
  }
  return output;
}
