import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { z } from "zod";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const RESOURCE_URI = "ui://qr-server/mcp-app.html";

/**
 * Input schema for the generate_qr tool.
 */
const GenerateQrInputSchema = z.object({
  text: z.string().default("https://modelcontextprotocol.io").describe("The text/URL to encode"),
  width: z.number().int().min(100).max(1000).default(300).describe("Width of QR code in pixels"),
  margin: z.number().int().min(0).max(10).default(4).describe("Margin around QR code in modules"),
  errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]).default("M").describe("Error correction level - L(7%), M(15%), Q(25%), H(30%)"),
  darkColor: z.string().default("#000000").describe("Dark module color (hex like #000000)"),
  lightColor: z.string().default("#ffffff").describe("Light module color (hex like #ffffff)"),
});

type GenerateQrInput = z.infer<typeof GenerateQrInputSchema>;

/**
 * Output schema for the generate_qr tool.
 */
const GenerateQrOutputSchema = z.object({
  dataUrl: z.string().describe("Base64-encoded data URL of the QR code image"),
  text: z.string().describe("The text that was encoded"),
});

/**
 * Creates a new MCP server instance with QR code generation tool and widget resource.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "QR Code Server",
    version: "1.0.0",
  });

  // Register the QR code generation tool with UI metadata
  registerAppTool(server,
    "generate_qr",
    {
      title: "Generate QR Code",
      description: "Generate a QR code from text or URL. Returns a base64-encoded PNG image.",
      inputSchema: GenerateQrInputSchema,
      outputSchema: GenerateQrOutputSchema,
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (args: GenerateQrInput): Promise<CallToolResult> => {
      const {
        text,
        width,
        margin,
        errorCorrectionLevel,
        darkColor,
        lightColor,
      } = args;

      const dataUrl = await QRCode.toDataURL(text, {
        width,
        margin,
        errorCorrectionLevel,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      return {
        content: [
          {
            type: "image",
            data: dataUrl.replace(/^data:image\/png;base64,/, ""),
            mimeType: "image/png",
          },
        ],
        structuredContent: { dataUrl, text },
      };
    },
  );

  // Register the widget resource
  registerAppResource(server,
    RESOURCE_URI,
    RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");

      return {
        contents: [
          { uri: RESOURCE_URI, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  return server;
}
