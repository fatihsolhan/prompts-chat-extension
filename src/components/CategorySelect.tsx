/**
 * Category Select Component
 *
 * Refined visual category picker with icons and elegant styling.
 * Uses a popover with scrollable grid layout.
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
import { Check, ChevronDown, Layers } from 'lucide-react';
import { useState } from 'react';

export function CategorySelect() {
  const { categories, selectedCategory, setSelectedCategory } = usePrompts();
  const [open, setOpen] = useState(false);

  const selectedCat = categories.find(c => c.name === selectedCategory);

  const handleSelect = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 justify-between text-xs font-normal w-full",
            selectedCategory && "border-primary/50"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedCat ? (
              <>
                {selectedCat.icon && (
                  <span className="text-base leading-none">{selectedCat.icon}</span>
                )}
                <span className="truncate">{selectedCat.name}</span>
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">All Categories</span>
              </>
            )}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground px-1">
            Filter by category
          </p>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="p-2 space-y-0.5">
            {/* All Categories option */}
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                "w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left transition-colors",
                "hover:bg-accent",
                !selectedCategory && "bg-accent"
              )}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                <Layers className="h-4 w-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium">All Categories</span>
                <span className="block text-[10px] text-muted-foreground">
                  Show all prompts
                </span>
              </span>
              {!selectedCategory && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>

            {/* Divider */}
            <div className="h-px bg-border my-1.5" />

            {/* Category list */}
            {categories.map(category => {
              const isSelected = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => handleSelect(category.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left transition-colors",
                    "hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-lg">
                    {category.icon || '📁'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {category.name}
                    </span>
                    {category.promptCount !== undefined && (
                      <span className="block text-[10px] text-muted-foreground">
                        {category.promptCount} prompts
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
