# Example: QR Code Server (TypeScript)

An MCP App server that generates QR codes from text or URLs.

## MCP Client Configuration

Add to your MCP client configuration (stdio transport):

```json
{
  "mcpServers": {
    "qr": {
      "command": "npx",
      "args": [
        "-y",
        "--silent",
        "--registry=https://registry.npmjs.org/",
        "@modelcontextprotocol/server-qr",
        "--stdio"
      ]
    }
  }
}
```

## Overview

- QR code generation with customizable options (size, colors, error correction)
- Vanilla JS UI displaying the generated QR code image
- Supports both stdio and HTTP transports

## Key Files

- [`server.ts`](server.ts) - MCP server with `generate_qr` tool and widget resource
- [`mcp-app.html`](mcp-app.html) / [`src/mcp-app.ts`](src/mcp-app.ts) - Widget UI

## Getting Started

```bash
npm install
npm run dev
```

## Tool Parameters

The `generate_qr` tool accepts:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | `"https://modelcontextprotocol.io"` | Text/URL to encode |
| `width` | number | `300` | Width in pixels (100-1000) |
| `margin` | number | `4` | Margin in modules (0-10) |
| `errorCorrectionLevel` | `"L"` \| `"M"` \| `"Q"` \| `"H"` | `"M"` | Error correction level |
| `darkColor` | string | `"#000000"` | Dark module color (hex) |
| `lightColor` | string | `"#ffffff"` | Light module color (hex) |

## How It Works

1. The server registers a `generate_qr` tool linked to a widget resource
2. When invoked, the tool generates a QR code PNG and returns it as base64
3. The widget displays the QR code image with theme support
