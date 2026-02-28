import { defineConfig } from "wxt";
import pkg from "./package.json";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: ({ browser, manifestVersion }) => ({
    name: "prompts.chat",
    description: "prompts.chat - AI-powered prompt library for ChatGPT, Claude, Gemini, and more",
    version: pkg.version,
    permissions: [
      "storage",
      "activeTab",
      "tabs",
      // sidePanel permission only exists in Chrome MV3
      ...(browser === "chrome" && manifestVersion === 3 ? ["sidePanel"] : []),
    ],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
    host_permissions: [
      "https://chatgpt.com/*",
      "https://claude.ai/*",
      "https://gemini.google.com/*",
      "https://copilot.microsoft.com/*",
      "https://chat.deepseek.com/*",
      "https://grok.com/*",
      "https://www.perplexity.ai/*",
      "https://chat.mistral.ai/*",
      "https://huggingface.co/*",
      "https://poe.com/*",
      "https://github.com/*",
      "https://bolt.new/*",
      "https://lovable.dev/*",
      "https://v0.dev/*",
      "https://duck.ai/*",
      "https://prompts.chat/*",
    ],
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["**/*"],
      },
    ],
    // Firefox requires browser_specific_settings with an extension ID
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "extension@prompts.chat",
              strict_min_version: "109.0",
              // Firefox requires disclosure of data collection (we use Google Analytics)
              data_collection_permissions: {
                required: ["none"],
                optional: ["technicalAndInteraction"],
              },
            },
          },
        }
      : {}),
  }),
  webExt: {
    startUrls: ["https://chatgpt.com"],
  },
});
