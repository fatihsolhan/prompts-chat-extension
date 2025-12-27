import { usePrompts } from '@/lib/contexts/PromptsContext';
import { Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';
import { PromptCard } from './PromptCard';
import { PromptDetailDialog } from './PromptDetailDialog';

const ESTIMATED_CARD_HEIGHT = 180;

export function PromptsList({ className }: { className?: string }) {
  const { filteredPrompts } = usePrompts();

  const parentRef = useRef<HTMLDivElement>(null);

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const virtualizer = useVirtualizer({
    count: filteredPrompts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 3,
    gap: 24,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  };

  return (
    <>
      <div
        ref={parentRef}
        className={cn("overflow-auto", className)}
        style={{
          height: 'calc(100vh - 180px)',
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const prompt = filteredPrompts[virtualItem.index];
            return (
              <div
                key={prompt.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <PromptCard
                  prompt={prompt}
                  onClick={() => handlePromptClick(prompt)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <PromptDetailDialog
        prompt={selectedPrompt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
