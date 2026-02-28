import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CHAT_PLATFORMS, CODE_PLATFORMS, Platform } from "@/lib/constants";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { cn } from "@/lib/utils";
import { Code2, MessageSquare, Zap } from "lucide-react";
import { useState } from "react";

interface AISettingsDialogProps {
  trigger: React.ReactNode;
}

function PlatformToggle({
  platform,
  enabled,
  onToggle,
}: {
  platform: Platform;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-colors text-left",
        enabled
          ? "bg-card border border-border hover:bg-accent"
          : "bg-muted/50 border border-transparent opacity-60 hover:opacity-80"
      )}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-muted/80 border border-border flex items-center justify-center">
        {platform.icon ? (
          <img src={platform.icon} alt="" className="h-4 w-4 object-contain" />
        ) : (
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <span className="flex-1 text-sm font-medium">{platform.name}</span>
      <div
        className={cn(
          "w-9 h-5 rounded-full transition-colors relative",
          enabled ? "bg-foreground" : "bg-border"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform",
            enabled ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </div>
    </button>
  );
}

export function AISettingsDialog({ trigger }: AISettingsDialogProps) {
  const { isPlatformEnabled, setPlatformEnabled } = usePrompts();
  const [tab, setTab] = useState<"chat" | "code">("chat");

  const platforms = tab === "chat" ? CHAT_PLATFORMS : CODE_PLATFORMS;

  const enabledCount = platforms.filter((p) => isPlatformEnabled(p.id)).length;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-lg grid-rows-[auto_minmax(0,1fr)] pb-0 px-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="text-base">AI Settings</DialogTitle>
          <DialogDescription className="text-sm text-left">
            Enable or disable AI models shown in the Run menu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mx-4 mt-3">
            <button
              onClick={() => setTab("chat")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
                tab === "chat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 className="h-3 w-3" />
              Code
            </button>
          </div>

          {/* Count */}
          <div className="px-4 pt-2 pb-1">
            <span className="text-xs text-muted-foreground">
              {enabledCount} of {platforms.length} enabled
            </span>
          </div>

          {/* Platform List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
            {platforms.map((platform) => (
              <PlatformToggle
                key={platform.id}
                platform={platform}
                enabled={isPlatformEnabled(platform.id)}
                onToggle={() =>
                  setPlatformEnabled(platform.id, !isPlatformEnabled(platform.id))
                }
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
