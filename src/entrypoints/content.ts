import { getAllModelUrls } from "@/lib/utils";
import { waitForElement } from "@/lib/utils/dom";
import { onMessage } from 'webext-bridge/content-script';

export default defineContentScript({
  matches: getAllModelUrls(),
  main() {
    onMessage('insertPrompt', async ({ data }) => {
      console.log('Content script received insertPrompt:', data);
      const { prompt, inputSelector } = data;
      try {
        const inputElement = await waitForElement(inputSelector);
        if (!inputElement) {
          console.error('Input element not found:', inputSelector);
          return { success: false };
        }

        if (inputElement instanceof HTMLTextAreaElement) {
          inputElement.value = prompt;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.focus();
        } else if (inputElement instanceof HTMLElement) {
          inputElement.innerHTML = prompt;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          inputElement.focus();

          const selection = window.getSelection();
          const range = document.createRange();
          selection?.removeAllRanges();
          range.selectNodeContents(inputElement);
          range.collapse(false);
          selection?.addRange(range);
        }
        return { success: true };
      } catch (error) {
        console.error('Error inserting prompt:', error);
        return { success: false };
      }
    });
  },
});
