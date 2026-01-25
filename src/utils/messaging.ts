import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  usePrompt(data: { modelId: string; prompt: string }): { success: boolean };
  insertPrompt(data: { prompt: string; inputSelector: string }): { success: boolean };
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
