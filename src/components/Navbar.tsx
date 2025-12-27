import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { cn } from "@/lib/utils";
import { ArrowDownAZ, Clock, Github, Heart, Info, Moon, Sparkles, Sun, ThumbsUp } from "lucide-react";
import { AboutDialog } from "./AboutDialog";
import { CategorySelect } from "./CategorySelect";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { TagsCombobox } from "./TagsCombobox";

const sortOptions = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'votes', label: 'Most Voted', icon: ThumbsUp },
  { id: 'alphabetical', label: 'A-Z', icon: ArrowDownAZ },
] as const;

const promptTypes = [
  { id: 'all', label: 'All Types' },
  { id: 'TEXT', label: 'Text' },
  { id: 'STRUCTURED', label: 'JSON' },
  { id: 'IMAGE', label: 'Image' },
  { id: 'VIDEO', label: 'Video' },
  { id: 'AUDIO', label: 'Audio' },
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
    favorites,
    activeTab,
    setActiveTab,
  } = usePrompts();

  const currentSort = sortOptions.find(o => o.id === sortBy) || sortOptions[0];
  const showingFavorites = activeTab === 'favorites';

  return (
    <div className="bg-background sticky top-0 z-10 py-3 drop-shadow">
      <Container>
        <nav className="flex items-center justify-between mb-4">
          <a
            href="https://prompts.chat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Logo />
          </a>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab(showingFavorites ? 'all' : 'favorites')}
              className={cn(
                "h-8 w-8 relative",
                showingFavorites && "text-red-500"
              )}
              title={showingFavorites ? "Show all prompts" : "Show favorites"}
            >
              <Heart className={cn("h-4 w-4", showingFavorites && "fill-current")} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-medium bg-red-500 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-8 w-8"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <a
              href="https://github.com/fatihsolhan/prompts-chat-extension"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent"
            >
              <Github className="h-4 w-4" />
            </a>
            <AboutDialog
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </nav>

        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search prompts by title, content, tags..."
            className="pl-9 pr-20 h-11 rounded-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Type
            </label>
            <Select
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as typeof selectedType)}
            >
              <SelectTrigger className="h-9 w-[110px] text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[9999]">
                {promptTypes.map(type => (
                  <SelectItem key={type.id} value={type.id} className="text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <CategorySelect />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Tags
            </label>
            <div>
              <TagsCombobox />
            </div>
          </div>

          <div className="space-y-1 ml-auto">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Sort
            </label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-9 text-xs">
                <div className="flex items-center gap-2">
                  <currentSort.icon className="h-3.5 w-3.5" />
                  {currentSort.label}
                </div>
              </SelectTrigger>
              <SelectContent position="popper" className="z-[9999]">
                {sortOptions.map(option => (
                  <SelectItem key={option.id} value={option.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <option.icon className="h-3.5 w-3.5" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Container>
    </div>
  );
}
