import "webext-bridge";

declare module "webext-bridge" {
  export interface ProtocolMap {
    insertPrompt: ProtocolWithReturn<{ prompt: string, inputSelector: string }, { success: boolean }>;
    usePrompt: ProtocolWithReturn<{ prompt: string, modelId: string }, { success: boolean }>;
  }
}
