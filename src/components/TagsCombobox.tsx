/**
 * Tags Combobox Component
 *
 * Elegant tag cloud picker with colorful toggleable badges.
 * Shows selected tags inline with clear visual feedback.
 */

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePrompts } from '@/lib/contexts/PromptsContext';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Tag, X } from 'lucide-react';
import { useState } from 'react';

export function TagsCombobox() {
  const { allTags, selectedTags, setSelectedTags } = usePrompts();
  const [open, setOpen] = useState(false);

  const toggleTag = (tagName: string) => {
    setSelectedTags(
      selectedTags.includes(tagName)
        ? selectedTags.filter(t => t !== tagName)
        : [...selectedTags, tagName]
    );
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  const removeTag = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  const hasSelection = selectedTags.length > 0;

  // Get selected tag objects for display
  const selectedTagObjects = allTags.filter(t => selectedTags.includes(t.name));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-9 justify-between text-xs font-normal w-full py-1.5",
            hasSelection && "border-primary/50"
          )}
        >
          <span className="flex items-center gap-1.5 flex-wrap flex-1">
            {hasSelection ? (
              <>
                {selectedTagObjects.slice(0, 2).map(tag => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={(e) => removeTag(tag.name, e)}
                      className="hover:opacity-70"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {selectedTags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{selectedTags.length - 2} more
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Select tags
              </span>
            )}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex items-center justify-between p-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground px-1">
            Filter by tags
          </p>
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTags}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    onClick={() => toggleTag(tag.name)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                      "border border-transparent",
                      "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                    style={{
                      backgroundColor: isSelected ? `${tag.color}30` : `${tag.color}12`,
                      color: tag.color,
                      borderColor: isSelected ? tag.color : 'transparent',
                    }}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{tag.name}</span>
                    {tag.count !== undefined && (
                      <span
                        className="text-[10px] opacity-70 ml-0.5"
                        style={{ color: tag.color }}
                      >
                        {tag.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
        {hasSelection && (
          <div className="p-2 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-center">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
