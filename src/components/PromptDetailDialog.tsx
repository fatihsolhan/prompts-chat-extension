import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCopy } from "@/hooks/useCopy";
import { analytics } from "@/lib/analytics";
import { Prompt, Tag, TemplateVariable } from "@/lib/types";
import { cn } from "@/lib/utils";
import { applyTemplateVariables, hasTemplateVariables, parseTemplateVariables } from "@/lib/utils/prompts";
import { Check, Copy, ExternalLink, Variable } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { HighlightedContent } from "./HighlightedContent";
import { RunPromptButton } from "./RunPromptButton";
import { TypeBadge } from "./TypeBadge";

const MAX_VISIBLE_TAGS = 3;
const EMPTY_TAGS: Tag[] = [];

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TagBadgeProps {
  tag: Tag;
}

function TagBadge({ tag }: TagBadgeProps): React.ReactElement {
  return (
    <Badge
      variant="outline"
      className="font-normal text-[10px] px-1.5 py-0"
      style={{
        backgroundColor: `${tag.color}15`,
        color: tag.color,
        borderColor: `${tag.color}40`,
      }}
    >
      {tag.name}
    </Badge>
  );
}

interface MediaThumbnailProps {
  prompt: Prompt;
}

function MediaThumbnail({ prompt }: MediaThumbnailProps): React.ReactElement {
  const thumbnailContent = (
    <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted cursor-zoom-in">
      {prompt.type === "IMAGE" ? (
        <img src={prompt.mediaUrl} alt={prompt.title} className="w-full h-full object-cover" />
      ) : (
        <video src={prompt.mediaUrl} className="w-full h-full object-cover" preload="metadata" muted />
      )}
    </div>
  );

  if (prompt.type === "IMAGE") {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>{thumbnailContent}</HoverCardTrigger>
        <HoverCardContent side="right" align="start" sideOffset={8} className="w-auto max-w-[400px] p-2">
          <img
            src={prompt.mediaUrl}
            alt={prompt.title}
            className="w-full h-auto max-h-[300px] object-contain rounded-md"
          />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return thumbnailContent;
}

interface TagsDisplayProps {
  tags: Tag[];
}

function TagsDisplay({ tags }: TagsDisplayProps): React.ReactElement | null {
  if (tags.length === 0) return null;

  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = tags.slice(MAX_VISIBLE_TAGS);

  return (
    <>
      <Separator orientation="vertical" className="h-3" />
      <div className="flex items-center gap-1">
        {visibleTags.map((tag) => (
          <TagBadge key={tag.name} tag={tag} />
        ))}
        {hiddenTags.length > 0 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-muted-foreground cursor-default">+{hiddenTags.length}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {hiddenTags.map((tag) => (
                    <TagBadge key={tag.name} tag={tag} />
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </>
  );
}

interface VariableIndicatorProps {
  filledCount: number;
  totalCount: number;
}

function VariableIndicator({ filledCount, totalCount }: VariableIndicatorProps): React.ReactElement {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-md">
            <Variable className="h-3 w-3" />
            <span>
              {filledCount}/{totalCount}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">Click highlighted variables in content to edit</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DialogFooterActionsProps {
  prompt: Prompt;
  finalContent: string;
  isCopied: boolean;
  hasVariables: boolean;
  filledVariablesCount: number;
  totalVariablesCount: number;
  onCopy: () => void;
  onClose: () => void;
}

function DialogFooterActions({
  prompt,
  finalContent,
  isCopied,
  hasVariables,
  filledVariablesCount,
  totalVariablesCount,
  onCopy,
  onClose,
}: DialogFooterActionsProps): React.ReactElement {
  return (
    <div className="px-4 py-3 flex items-center justify-between bg-muted/50 border-t border-border">
      <div className="flex items-center gap-2">
        <RunPromptButton promptId={prompt.id} promptContent={finalContent} onRun={onClose} />
        {hasVariables && totalVariablesCount > 0 && (
          <VariableIndicator filledCount={filledVariablesCount} totalCount={totalVariablesCount} />
        )}
      </div>

      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopy}
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  isCopied ? "text-green-500 scale-110" : "text-muted-foreground hover:text-foreground",
                )}
                data-testid="copy-button"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{isCopied ? "Copied!" : "Copy prompt"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={`https://prompts.chat/prompts/${prompt.id}_${prompt.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">View on prompts.chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function PromptDetailDialog({ prompt, open, onOpenChange }: PromptDetailDialogProps): React.ReactElement | null {
  const { copy } = useCopy();
  const [isCopied, setIsCopied] = useState(false);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const hasVars = prompt ? hasTemplateVariables(prompt.content) : false;

  const finalContent = hasVars && prompt ? applyTemplateVariables(prompt.content, variables) : (prompt?.content ?? "");

  const handleCopy = useCallback((): void => {
    if (!prompt) return;
    copy(finalContent).then(() => {
      setIsCopied(true);
      analytics.promptCopied(prompt.id, prompt.category);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [prompt, finalContent, copy]);

  const updateVariable = useCallback((name: string, value: string): void => {
    setVariables((prev) => prev.map((v) => (v.name === name ? { ...v, value } : v)));
  }, []);

  const handleClose = useCallback((): void => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (prompt && hasVars) {
      setVariables(parseTemplateVariables(prompt.content));
    } else {
      setVariables([]);
    }
  }, [prompt, hasVars]);

  useEffect(() => {
    if (!open) {
      setIsCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && prompt) {
      analytics.promptViewed(prompt.id, prompt.type);
    }
  }, [open, prompt]);

  if (!prompt) return null;

  const filledVariablesCount = variables.filter((v) => v.value?.trim()).length;
  const hasMediaThumbnail = prompt.mediaUrl && (prompt.type === "IMAGE" || prompt.type === "VIDEO");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 grid grid-rows-[auto_1fr_auto] gap-0 overflow-y-auto">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex gap-3">
            {hasMediaThumbnail && <MediaThumbnail prompt={prompt} />}

            <div className="flex-1 min-w-0">
              <DialogHeader className="text-left mb-1.5">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <DialogTitle className="leading-snug flex-1 text-base">{prompt.title}</DialogTitle>
                  <TypeBadge type={prompt.type} />
                </div>
                {prompt.description ? (
                  <DialogDescription className="mt-1 text-xs line-clamp-2">{prompt.description}</DialogDescription>
                ) : null}
              </DialogHeader>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <a
                  href={`https://prompts.chat/@${prompt.author}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  @{prompt.author}
                </a>

                {prompt.category ? (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0">
                      {prompt.category}
                    </Badge>
                  </>
                ) : null}

                <TagsDisplay tags={prompt.tags ?? EMPTY_TAGS} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3 grid grid-rows-[auto_1fr] min-h-0 h-full">
          {prompt.mediaUrl && prompt.type === "VIDEO" && (
            <video
              src={prompt.mediaUrl}
              controls
              className="w-full max-h-[200px] rounded-lg bg-black"
              preload="metadata"
            >
              Your browser does not support video playback.
            </video>
          )}

          {prompt.mediaUrl && prompt.type === "AUDIO" && <AudioPlayer src={prompt.mediaUrl} />}

          <HighlightedContent
            content={prompt.content}
            variables={variables}
            structuredFormat={prompt.structuredFormat}
            editable={hasVars}
            onVariableChange={updateVariable}
          />
        </div>

        <DialogFooterActions
          prompt={prompt}
          finalContent={finalContent}
          isCopied={isCopied}
          hasVariables={hasVars}
          filledVariablesCount={filledVariablesCount}
          totalVariablesCount={variables.length}
          onCopy={handleCopy}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
