import { usePromptsContext } from "@/lib/contexts/PromptsContext";
import { sendMessage } from "webext-bridge/popup";

export function usePrompt() {
  const { selectedModel } = usePromptsContext();

  const sendPrompt = async (prompt: string) => {
    if (!selectedModel) return;

    return sendMessage('usePrompt', {
      modelId: selectedModel,
      prompt
    }, 'background');
  }

  return { sendPrompt };
}
