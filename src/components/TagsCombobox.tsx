/**
 * Tags Dropdown Component
 *
 * Multi-column dropdown with toggleable tag badges.
 * Shows selected count in trigger.
 */

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePrompts } from '@/lib/contexts/PromptsContext';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
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

  const hasSelection = selectedTags.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 text-xs font-normal"
          )}
        >
          <span>
            Tags
            {hasSelection && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">
                {selectedTags.length}
              </span>
            )}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[360px] p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            Select tags to filter
          </span>
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTags}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 max-h-[280px] overflow-y-auto">
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <Button
                variant="outline"
                size="sm"
                key={tag.name}
                onClick={() => toggleTag(tag.name)}
                className="text-xs h-8"
                style={{
                  backgroundColor: isSelected ? `${tag.color}30` : `${tag.color}15`,
                  color: tag.color,
                  borderColor: isSelected ? tag.color : 'transparent',
                }}
              >
                <span className="truncate">{tag.name}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
