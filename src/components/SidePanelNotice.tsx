import { PanelRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

// Declare chrome global for Chrome-specific APIs (sidePanel)
declare const chrome: typeof globalThis extends { chrome: infer T } ? T : any;

// Check if we're in Chrome (has sidePanel API) or Firefox (uses sidebar)
const isChrome = typeof chrome !== 'undefined' && !!chrome?.sidePanel;

export function SidePanelNotice() {
  const [isPopup, setIsPopup] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const rootElement = document.getElementById('root');
    const context = rootElement?.dataset.context;
    setIsPopup(context === 'popup');

    browser.storage.local.get('sidepanel_notice_dismissed').then((result) => {
      setDismissed(result.sidepanel_notice_dismissed === true);
    });
  }, []);

  const handleOpenSidePanel = async () => {
    try {
      if (isChrome) {
        // Chrome: use sidePanel API
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          await chrome.sidePanel.open({ tabId: tab.id });
          window.close();
        }
      } else {
        // Firefox: open sidebar via browser API
        await (browser as any).sidebarAction.open();
        window.close();
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    browser.storage.local.set({ sidepanel_notice_dismissed: true });
  };

  if (!isPopup || dismissed) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <PanelRight className="h-4 w-4 text-primary shrink-0" />
        <span className="text-foreground/80">
          For the best experience, open in Side Panel. It stays visible as you browse.
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs"
          onClick={handleOpenSidePanel}
        >
          Open
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
