import { PanelRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function SidePanelNotice() {
  const [isPopup, setIsPopup] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const rootElement = document.getElementById('root');
    const context = rootElement?.dataset.context;
    setIsPopup(context === 'popup');

    chrome.storage.local.get('sidepanel_notice_dismissed').then((result) => {
      setDismissed(result.sidepanel_notice_dismissed === true);
    });
  }, []);

  const handleOpenSidePanel = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    chrome.storage.local.set({ sidepanel_notice_dismissed: true });
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
