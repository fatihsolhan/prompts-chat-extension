import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePromptsContext } from "@/lib/contexts/PromptsContext";
import { cn } from "@/lib/utils";
import { Code2, Sparkles } from "lucide-react";

export function SearchPrompts() {
  const { query, setQuery, devMode, setDevMode } = usePromptsContext();

  return (
    <header className="flex flex-col gap-2">
      <div className="space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search prompts..."
              className="pl-9 pr-20 h-11 rounded-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 gap-2">
              <TooltipProvider >
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      data-testid="dev-mode-toggle"
                      variant="outline"
                      size="icon"
                      className={cn('h-7 w-7 rounded-full', 'hover:bg-primary/10 hover:border-primary hover:text-primary', devMode && 'bg-primary/10 border-primary text-primary')}
                      onClick={() => setDevMode(!devMode)}
                    >
                      <Code2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-foreground text-background rounded-full text-xs">
                    <p>Click to {devMode ? 'disable' : 'enable'} Dev Prompts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
