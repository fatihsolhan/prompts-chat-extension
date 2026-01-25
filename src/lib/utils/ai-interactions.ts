import { Platform } from "../constants";

export async function usePromptInAI(prompt: string, platform: Platform): Promise<boolean> {
  if (!platform) return false;

  try {
    const response = await browser.runtime.sendMessage({
      action: 'usePrompt',
      data: {
        modelId: platform.id,
        prompt
      }
    });
    return response?.success ?? false;
  } catch (error) {
    console.error('Error using prompt in AI:', error);
    return false;
  }
}
