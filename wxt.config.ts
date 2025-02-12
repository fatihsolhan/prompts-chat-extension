import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true
  },
  outDir: 'dist',
  manifest: {
    permissions: ['storage'],
    icons: {
      16: 'logo/prompts-chat-logo-16.png',
      24: 'logo/prompts-chat-logo-24.png',
      48: 'logo/prompts-chat-logo-48.png',
      96: 'logo/prompts-chat-logo-96.png',
      128: 'logo/prompts-chat-logo-128.png'
    },
    browser_specific_settings: {
      gecko: {
        id: 'prompts-chat@prompts-chat.com'
      }
    }
  },
});
