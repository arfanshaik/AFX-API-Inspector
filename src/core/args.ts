import type { HttpMethod } from "../types.js";

export interface ParsedCommonArgs {
  method: HttpMethod;
  headers: Record<string, string>;
  data?: string;
  bodyFile?: string;
  timeoutMs: number;
  followRedirects: boolean;
  json: boolean;
  showHeaders: boolean;
  output?: string;
  rest: string[];
}

const validMethods = new Set<HttpMethod>(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

export function parseDuration(input: string): number {
  const value = input.trim().toLowerCase();
  const match = value.match(/^(\d+(?:\.\d+)?)(ms|s|m)?$/);
  if (!match) throw new Error(`Invalid duration: ${input}`);
  const n = Number(match[1]);
  const unit = match[2] ?? "ms";
  const factor = unit === "m" ? 60_000 : unit === "s" ? 1_000 : 1;
  const result = Math.round(n * factor);
  if (result <= 0) throw new Error("Duration must be greater than 0");
  return result;
}

export function parseHeader(input: string): [string, string] {
  const index = input.indexOf(":");
  if (index <= 0) throw new Error(`Invalid header ${JSON.stringify(input)}. Expected "Name: Value".`);
  const name = input.slice(0, index).trim();
  const value = input.slice(index + 1).trim();
  if (!name) throw new Error("Header name cannot be empty");
  return [name, value];
}

export function parseCommonArgs(args: string[]): ParsedCommonArgs {
  let method: HttpMethod = "GET";
  const headers: Record<string, string> = {};
  let data: string | undefined;
  let bodyFile: string | undefined;
  let timeoutMs = 15_000;
  let followRedirects = true;
  let json = false;
  let showHeaders = false;
  let output: string | undefined;
  const rest: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = () => {
      const value = args[++i];
      if (value === undefined) throw new Error(`Missing value after ${arg}`);
      return value;
    };

    if (arg === "-X" || arg === "--method") {
      const candidate = next().toUpperCase() as HttpMethod;
      if (!validMethods.has(candidate)) throw new Error(`Unsupported HTTP method: ${candidate}`);
      method = candidate;
    } else if (arg === "-H" || arg === "--header") {
      const [name, value] = parseHeader(next());
      headers[name] = value;
    } else if (arg === "-d" || arg === "--data") {
      data = next();
    } else if (arg === "--body-file") {
      bodyFile = next();
    } else if (arg === "--timeout") {
      timeoutMs = parseDuration(next());
    } else if (arg === "--no-follow") {
      followRedirects = false;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "-i" || arg === "--include-headers") {
      showHeaders = true;
    } else if (arg === "-o" || arg === "--output") {
      output = next();
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      rest.push(arg);
    }
  }

  if (data !== undefined && bodyFile !== undefined) {
    throw new Error("Use either --data or --body-file, not both");
  }

  return { method, headers, data, bodyFile, timeoutMs, followRedirects, json, showHeaders, output, rest };
}
