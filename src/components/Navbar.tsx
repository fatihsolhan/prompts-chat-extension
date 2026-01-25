import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Clock,
  Github,
  Info,
  Layers,
  Moon,
  Search,
  Sun,
  Tag,
  ThumbsUp,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { AboutDialog } from "./AboutDialog";
import { Container } from "./Container";
import { FilterSelect, FilterOption } from "./FilterSelect";
import { Logo } from "./Logo";

const sortOptions = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'votes', label: 'Votes', icon: ThumbsUp },
] as const;

const promptTypes = [
  { id: 'all', label: 'All Types' },
  { id: 'IMAGE', label: 'Image' },
  { id: 'VIDEO', label: 'Video' },
  { id: 'AUDIO', label: 'Audio' },
  { id: 'TEXT', label: 'Text' },
] as const;

export function Navbar() {
  const {
    isDarkMode,
    setIsDarkMode,
    query,
    setQuery,
    sortBy,
    setSortBy,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    categories,
    allTags,
    clearAllFilters,
  } = usePrompts();

  const [typeOpen, setTypeOpen] = useState(false);
  const typeLabel = promptTypes.find(t => t.id === selectedType)?.label || 'All Types';

  // Memoized handler to prevent recreation on every render
  const handleClearQuery = useCallback(() => setQuery(''), [setQuery]);

  // Convert categories to FilterOption format
  const categoryOptions: FilterOption[] = useMemo(() =>
    categories.map(c => ({
      value: c.name,
      label: c.name,
    })),
    [categories]
  );

  // Convert tags to FilterOption format
  const tagOptions: FilterOption[] = useMemo(() =>
    allTags.map(t => ({
      value: t.name,
      label: t.name,
      color: t.color,
    })),
    [allTags]
  );

  return (
    <div className="bg-background border-b border-border/50 shrink-0">
      <Container>
        {/* Header Row */}
        <div className="flex items-center gap-3 py-2.5">
          {/* Logo */}
          <a
            href="https://prompts.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </a>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search prompts..."
              className="pl-9 pr-9 h-9 text-sm bg-background border-border focus:border-foreground/50 rounded-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="h-8 w-8"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isDarkMode ? "Light mode" : "Dark mode"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/fatihsolhan/prompts-chat-extension"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">GitHub</TooltipContent>
              </Tooltip>

              <AboutDialog
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                }
              />
            </TooltipProvider>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between gap-2 pb-2.5">
          {/* Left: Filters */}
          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <Popover open={typeOpen} onOpenChange={setTypeOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border group whitespace-nowrap",
                    selectedType !== 'all'
                      ? "bg-foreground text-background border-foreground data-[state=open]:bg-foreground/90"
                      : "bg-background text-foreground border-border hover:border-foreground/50 data-[state=open]:bg-accent data-[state=open]:border-foreground/50"
                  )}
                >
                  {typeLabel}
                  <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="start">
                {promptTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id as typeof selectedType);
                      setTypeOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors",
                      "hover:bg-accent",
                      selectedType === type.id && "bg-accent"
                    )}
                  >
                    {type.label}
                    {selectedType === type.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Category Filter */}
            <FilterSelect
              options={categoryOptions}
              value={selectedCategory || ""}
              onChange={(v) => setSelectedCategory(v as string || null)}
              placeholder="Category"
              title="Category"
              icon={<Layers className="h-3 w-3" />}
              searchPlaceholder="Search categories..."
            />

            {/* Tags Filter */}
            <FilterSelect
              options={tagOptions}
              value={selectedTags}
              onChange={(v) => setSelectedTags(v as string[])}
              placeholder="Tag"
              title="Tags"
              icon={<Tag className="h-3 w-3" />}
              multiple
              searchPlaceholder="Search tags..."
            />

            {/* Clear all filters */}
            {(selectedType !== 'all' || selectedCategory || selectedTags.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="h-8 px-3 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Right: Sort Toggle */}
          <div className="flex items-center bg-muted rounded-full p-0.5">
            {sortOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={cn(
                  "h-7 px-3 text-xs font-medium rounded-full transition-all flex items-center gap-1.5",
                  sortBy === option.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <option.icon className="h-3 w-3" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
