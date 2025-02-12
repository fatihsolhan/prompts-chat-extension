export function waitForElement(selector: string, timeout = 10000): Promise<Element> {
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

export function hasSameDomain(urlA: string, urlB: string): boolean {
  try {
    const urlObjA = new URL(urlA);
    const urlObjB = new URL(urlB);
    return urlObjA.hostname === urlObjB.hostname;
  } catch (error) {
    console.error('Error validating URL:', error);
    return false;
  }
}
