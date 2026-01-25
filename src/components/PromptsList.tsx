import { usePrompts } from "@/lib/contexts/PromptsContext";
import { Prompt } from "@/lib/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FileSearch, Sparkles } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { PromptCard } from "./PromptCard";
import { PromptDetailDialog } from "./PromptDetailDialog";

// Hoisted static JSX components to prevent recreation on every render
function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        Try adjusting your search or filters to find what you're looking for.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Loading prompts...</h3>
      <p className="text-sm text-muted-foreground">Fetching the latest prompts for you.</p>
    </div>
  );
}

// Memoized row component to prevent unnecessary re-renders
const VirtualRow = memo(function VirtualRow({
  prompt,
  measureRef,
  dataIndex,
  onPromptClick,
}: {
  prompt: Prompt;
  measureRef: (node: HTMLDivElement | null) => void;
  dataIndex: number;
  onPromptClick: (prompt: Prompt) => void;
}) {
  return (
    <div ref={measureRef} data-index={dataIndex} className="pb-3">
      <PromptCard prompt={prompt} onClick={() => onPromptClick(prompt)} />
    </div>
  );
});

export function PromptsList() {
  const { filteredPrompts, query, selectedType, selectedCategory, selectedTags } = usePrompts();

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Scroll container ref - this is the element that actually scrolls
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track previous filter state to detect changes
  const prevFilterKeyRef = useRef<string>("");

  const hasFilters = query || selectedType !== "all" || selectedCategory || selectedTags.length > 0;

  // Create a stable filter key to detect when filters change
  const filterKey = `${query}-${selectedType}-${selectedCategory}-${selectedTags.join(",")}`;

  const virtualizer = useVirtualizer({
    count: filteredPrompts.length,
    getScrollElement: () => scrollContainerRef.current,
    // Estimate size - will be replaced by actual measurements
    estimateSize: () => 140,
    // Enable dynamic measurement
    measureElement: (element) => {
      return element.getBoundingClientRect().height;
    },
    // Overscan for smoother scrolling
    overscan: 5,
  });

  // Reset virtualizer when filters change
  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;

      // Reset scroll position to top
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Reset all measurements - this is the key fix for filter issues
      virtualizer.measure();
    }
  }, [filterKey, virtualizer]);

  // Memoized click handler factory to prevent recreating handlers
  const handlePromptClick = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  }, []);

  if (filteredPrompts.length === 0) {
    return (
      <Container className="h-full">
        {hasFilters ? <NoResultsState /> : <LoadingState />}
      </Container>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="h-full flex flex-col">
      <Container>
        <div className="flex items-center py-2 text-xs text-muted-foreground">
          <span>
            {filteredPrompts.length} {filteredPrompts.length === 1 ? "prompt" : "prompts"}
            {hasFilters && " found"}
          </span>
        </div>
      </Container>

      {/* Scroll container - must have fixed height and overflow */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto min-h-0">
        <Container>
          {/* Inner container with total height for proper scrollbar */}
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {/* Positioned container for virtual items */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
              }}
            >
              {virtualItems.map((virtualRow) => {
                const prompt = filteredPrompts[virtualRow.index];
                return (
                  <VirtualRow
                    key={prompt.id}
                    prompt={prompt}
                    measureRef={virtualizer.measureElement}
                    dataIndex={virtualRow.index}
                    onPromptClick={handlePromptClick}
                  />
                );
              })}
            </div>
          </div>
        </Container>
      </div>

      <PromptDetailDialog prompt={selectedPrompt} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
