import { useCopy } from "@/hooks/useCopy";
import { analytics } from "@/lib/analytics";
import { CHAT_PLATFORMS, CODE_PLATFORMS, Platform, buildPlatformUrl } from "@/lib/constants";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { cn } from "@/lib/utils";
import { usePromptInAI } from "@/lib/utils/ai-interactions";
import { Check, ChevronDown, Code2, Heart, MessageSquare, Play, Zap } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface RunPromptButtonProps {
  promptId: string;
  promptContent: string;
  trigger?: ReactNode;
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  onRun?: () => void;
}

interface PlatformItemProps {
  platform: Platform;
  onClick: () => void;
  showCopied: boolean;
}

function PlatformItem({ platform, onClick, showCopied }: PlatformItemProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-accent transition-colors text-left"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-muted/80 border border-border flex items-center justify-center">
        {platform.icon ? (
          <img src={platform.icon} alt="" className="h-4 w-4 object-contain" />
        ) : (
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <span className="flex-1 text-sm font-medium">{platform.name}</span>
      {platform.sponsor && <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />}
      {showCopied && (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
          <Check className="h-2.5 w-2.5" />
          Copied
        </span>
      )}
    </button>
  );
}

export function RunPromptButton({
  promptId,
  promptContent,
  trigger,
  size = "sm",
  className,
  onRun,
}: RunPromptButtonProps): React.ReactElement {
  const { setSelectedModel } = usePrompts();
  const { copy } = useCopy();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedForPlatform, setCopiedForPlatform] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "code">("chat");

  const platforms = tab === "chat" ? CHAT_PLATFORMS : CODE_PLATFORMS;

  const handleRunOnPlatform = async (platform: Platform): Promise<void> => {
    setOpen(false);
    setIsLoading(true);
    analytics.promptRun(promptId, platform.id);

    try {
      if (platform.id !== "copy") {
        await setSelectedModel(platform.id);
      }

      const success = await usePromptInAI(promptContent, platform);

      if (success) {
        return;
      }

      if (platform.supportsQuerystring) {
        const url = buildPlatformUrl(platform.id, platform.baseUrl, promptContent);
        window.open(url, "_blank");
      } else {
        await copy(promptContent);
        setCopiedForPlatform(platform.id);
        window.open(platform.baseUrl, "_blank");
        setTimeout(() => setCopiedForPlatform(null), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size={size} variant="defaultLighter" className={cn("gap-1.5 group", className)} disabled={isLoading}>
      {isLoading ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Play className="size-3 fill-current" />
      )}
      Run
      <ChevronDown className="size-3 opacity-60 group-data-[state=open]:rotate-180 transition-transform duration-200" />
    </Button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-[240px] p-2">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-2">
          <button
            onClick={() => setTab("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
              tab === "chat"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare className="h-3 w-3" />
            Chat
          </button>
          <button
            onClick={() => setTab("code")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
              tab === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Code2 className="h-3 w-3" />
            Code
          </button>
        </div>

        {/* Platform List */}
        <div className="max-h-[280px] overflow-y-auto -mx-1 px-1 space-y-0.5">
          {platforms.map((platform) => (
            <PlatformItem
              key={platform.id}
              platform={platform}
              onClick={() => handleRunOnPlatform(platform)}
              showCopied={copiedForPlatform === platform.id}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
