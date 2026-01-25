import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { ReactNode, useMemo, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
  color?: string;
  icon?: ReactNode;
}

interface FilterSelectProps {
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder: string;
  title: string;
  icon?: ReactNode;
  multiple?: boolean;
  searchPlaceholder?: string;
}

export function FilterSelect({
  options,
  value,
  onChange,
  placeholder,
  title,
  icon,
  multiple = false,
  searchPlaceholder = "Search...",
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = multiple ? (value as string[]).length : 0;
  const hasValue = multiple ? selectedCount > 0 : !!value;

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  function isSelected(optionValue: string): boolean {
    if (multiple) {
      return (value as string[]).includes(optionValue);
    }
    return value === optionValue;
  }

  function clearSelection(): void {
    onChange(multiple ? [] : "");
  }

  function handleSelect(optionValue: string): void {
    if (multiple) {
      const currentValues = value as string[];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(value === optionValue ? "" : optionValue);
      setOpen(false);
    }
  }

  function handleClear(e: React.MouseEvent): void {
    e.stopPropagation();
    clearSelection();
  }

  function handleClearAll(): void {
    clearSelection();
    setSearch("");
  }

  function handleOpenChange(newOpen: boolean): void {
    setOpen(newOpen);
    if (newOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearch("");
    }
  }

  function getDisplayLabel(): string {
    if (multiple) {
      if (selectedCount === 0) return placeholder;
      if (selectedCount === 1) {
        const selected = options.find(opt => (value as string[]).includes(opt.value));
        return selected?.label || placeholder;
      }
      return `${selectedCount} selected`;
    }
    if (!value) return placeholder;
    const selected = options.find(opt => opt.value === value);
    return selected?.label || placeholder;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-8 px-3 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border group",
            hasValue
              ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
              : "bg-background text-foreground border-border hover:border-foreground/50 data-[state=open]:bg-accent data-[state=open]:border-foreground/50"
          )}
        >
          {icon}
          <span className="max-w-[100px] truncate">{getDisplayLabel()}</span>

          {hasValue ? (
            <span
              role="button"
              onClick={handleClear}
              className="ml-0.5 p-0.5 rounded-full hover:bg-background/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">
            {title}
            {multiple && selectedCount > 0 && (
              <span className="ml-1.5 text-foreground">({selectedCount})</span>
            )}
          </span>
          {hasValue && (
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-sm bg-muted border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[240px]">
          <div className="p-1.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredOptions.map(option => {
                const selected = isSelected(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left",
                      "hover:bg-accent focus:bg-accent focus:outline-none",
                      selected && "bg-accent/50"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors",
                        multiple ? "rounded" : "rounded-full",
                        selected
                          ? "bg-foreground border-foreground text-background"
                          : "border-border"
                      )}
                    >
                      {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>

                    {option.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}

                    {option.icon && (
                      <span className="shrink-0 text-muted-foreground">
                        {option.icon}
                      </span>
                    )}

                    <span className="flex-1 truncate text-sm">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
