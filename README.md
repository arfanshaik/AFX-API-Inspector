# ⚡ AFX API Inspector

**AFX API Inspector** is a fast developer-focused HTTP API inspection CLI built with **TypeScript + Node.js**. Send requests, inspect status codes and headers, measure response time and payload size, benchmark endpoints, save response bodies, and run reusable API collections from the terminal.

> **Inspect. Test. Benchmark. Ship.**

## Features

- TypeScript-first codebase
- GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS
- Repeatable custom request headers
- Inline request bodies or body files
- Automatic JSON `Content-Type` detection
- Configurable timeouts
- Redirect control
- Pretty JSON response formatting
- Response status, latency, size, content type and final URL
- Optional response headers
- Raw response body export
- Machine-readable JSON output
- Built-in endpoint benchmarking with configurable concurrency
- p50 / p95 latency metrics
- Reusable JSON request collections
- Zero runtime dependencies
- Unit tests
- GitHub Actions CI for Node 20 and 22

## Requirements

- Node.js 18.17+
- npm

## Install for development

```bash
npm install
npm run build
```

Run the CLI:

```bash
node dist/src/cli.js help
```

Or link it globally while developing:

```bash
npm link
afx-api-inspector help
```

## Quick Start

### Inspect a GET request

```bash
afx-api-inspector request https://api.github.com
```

### Send JSON

```bash
afx-api-inspector request https://httpbin.org/post \
  -X POST \
  -H "Accept: application/json" \
  -d '{"project":"AFX","tool":"API Inspector"}'
```

### Include response headers

```bash
afx-api-inspector request https://example.com -i
```

### Set a timeout

```bash
afx-api-inspector request https://example.com --timeout 5s
```

### Save the raw response body

```bash
afx-api-inspector request https://example.com -o response.html
```

### Machine-readable output

```bash
afx-api-inspector request https://api.github.com --json
```

## Benchmark an endpoint

Send 100 requests with 10 concurrent workers:

```bash
afx-api-inspector benchmark https://example.com -n 100 -c 10
```

The benchmark report includes:

- successful and failed request counts
- total duration
- requests per second
- minimum latency
- average latency
- p50 latency
- p95 latency
- maximum latency
- response status distribution

Use responsible request counts and benchmark only systems you own or are authorized to test.

## Collections

A collection groups reusable HTTP requests in JSON.

Example:

```json
{
  "name": "My API",
  "requests": [
    {
      "name": "Health",
      "method": "GET",
      "url": "https://example.com/health"
    }
  ]
}
```

Run it:

```bash
afx-api-inspector collection run examples/collection.json
```

JSON result:

```bash
afx-api-inspector collection run examples/collection.json --json
```

## Project Structure

```text
AFX-API-Inspector/
├── src/
│   ├── cli.ts
│   ├── types.ts
│   └── core/
│       ├── args.ts
│       ├── benchmark.ts
│       ├── collection.ts
│       ├── format.ts
│       └── http-client.ts
├── tests/
│   ├── args.test.ts
│   ├── benchmark.test.ts
│   └── collection.test.ts
├── examples/
│   └── collection.json
├── .github/workflows/ci.yml
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## Development

```bash
npm run build
npm test
```

## Why TypeScript?

TypeScript gives AFX API Inspector strong typing for HTTP requests, inspection results, benchmarks and collection definitions while still producing a portable Node.js CLI.

## Roadmap

Potential future additions:

- environment variables and named environments
- auth helpers for bearer/basic/API-key workflows
- response assertions
- collection variables
- request history
- HTML report generation
- OpenAPI import
- TUI interface
- optional desktop UI

## License

MIT License — see [LICENSE](LICENSE).

---

Built as part of the **AFX developer-tool ecosystem** by **Shaik Arfan**.
