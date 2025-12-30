import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
import { AI_MODELS } from './src/lib/constants'

const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

const getAllModelUrls = () => {
  const urls = AI_MODELS
    .filter(model => model.baseUrl.startsWith('http'))  // Only http/https URLs
    .map(model => {
      const baseUrlObj = new URL(model.baseUrl);
      return `${baseUrlObj.protocol}//${baseUrlObj.hostname}/*`;
    });
  return [...new Set(urls)];
};

const modelUrls = getAllModelUrls();

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name:
    env.mode === 'staging'
      ? '[INTERNAL] prompts.chat'
      : 'prompts.chat',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  icons: {
    "16": "prompts-chat-logo-16.png",
    "48": "prompts-chat-logo-48.png",
    "128": "prompts-chat-logo-128.png"
  },
  action: {
    default_popup: 'index.html?context=popup',
    default_icon: {
      "16": "prompts-chat-logo-16.png",
      "48": "prompts-chat-logo-48.png",
      "128": "prompts-chat-logo-128.png"
    }
  },
  side_panel: {
    default_path: 'index.html?context=sidepanel',
  },
  permissions: [
    'storage',
    'activeTab',
    'tabs',
    'sidePanel',
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
  content_scripts: [
    {
      matches: modelUrls,
      js: ['src/content-script.ts'],
    },
  ],
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  host_permissions: [...modelUrls, 'https://prompts.chat/*'],
  web_accessible_resources: [
    {
      matches: ['<all_urls>'],
      resources: ['**/*', '*'],
      use_dynamic_url: false,
    },
  ],
}))
