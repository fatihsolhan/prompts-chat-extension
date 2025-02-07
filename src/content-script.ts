
function waitForElement(selector: string, timeout = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector)!);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  });
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {

  if (message.action === 'insertPrompt') {
    const { prompt, inputSelector } = message.data;
    (async () => {
      try {
        const inputElement = await waitForElement(inputSelector);

        if (inputElement instanceof HTMLTextAreaElement) {
          (inputElement as HTMLTextAreaElement).value = prompt;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          (inputElement as HTMLTextAreaElement).focus();
        } else if (inputElement instanceof HTMLElement) {
          inputElement.innerHTML = prompt;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          (inputElement as HTMLElement).focus();

          const selection = window.getSelection();
          const range = document.createRange();
          selection?.removeAllRanges();
          range.selectNodeContents(inputElement);
          range.collapse(false);
          selection?.addRange(range);
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error inserting prompt:', error);
        sendResponse({ success: false, error });
      }
    })();
    return true;
  }
});
