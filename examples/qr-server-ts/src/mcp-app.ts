/**
 * @file QR Code widget that displays generated QR codes from the MCP server.
 */
import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult, ImageContent } from "@modelcontextprotocol/sdk/types.js";
import "./global.css";
import "./mcp-app.css";

const mainEl = document.querySelector(".main") as HTMLElement;
const qrContainer = document.getElementById("qr-container")!;

function handleHostContextChanged(ctx: McpUiHostContext) {
  if (ctx.theme) {
    applyDocumentTheme(ctx.theme);
  }
  if (ctx.styles?.variables) {
    applyHostStyleVariables(ctx.styles.variables);
  }
  if (ctx.safeAreaInsets) {
    mainEl.style.paddingTop = `${ctx.safeAreaInsets.top}px`;
    mainEl.style.paddingRight = `${ctx.safeAreaInsets.right}px`;
    mainEl.style.paddingBottom = `${ctx.safeAreaInsets.bottom}px`;
    mainEl.style.paddingLeft = `${ctx.safeAreaInsets.left}px`;
  }
}

function displayQRCode(result: CallToolResult) {
  const imageContent = result.content?.find(
    (c): c is ImageContent => c.type === "image"
  );

  if (imageContent) {
    const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
    const mimeType = allowedTypes.includes(imageContent.mimeType ?? "")
      ? imageContent.mimeType
      : "image/png";

    qrContainer.innerHTML = "";
    const img = document.createElement("img");
    img.src = `data:${mimeType};base64,${imageContent.data}`;
    img.alt = "QR Code";
    qrContainer.appendChild(img);
  }
}

// 1. Create app instance
const app = new App({ name: "QR Widget", version: "1.0.0" });

// 2. Register handlers BEFORE connecting
app.onteardown = async () => {
  console.info("QR Widget is being torn down");
  return {};
};

app.ontoolinput = (params) => {
  console.info("Received tool input:", params);
  // Show loading state when new input arrives
  qrContainer.innerHTML = '<p class="loading">Generating QR code...</p>';
};

app.ontoolresult = (result) => {
  console.info("Received tool result:", result);
  displayQRCode(result);
};

app.ontoolcancelled = (params) => {
  console.info("Tool call cancelled:", params.reason);
  qrContainer.innerHTML = '<p class="error">QR code generation cancelled</p>';
};

app.onerror = (error) => {
  console.error("App error:", error);
  qrContainer.innerHTML = '<p class="error">Error generating QR code</p>';
};

app.onhostcontextchanged = handleHostContextChanged;

// 3. Connect to host
app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx) {
    handleHostContextChanged(ctx);
  }
});
