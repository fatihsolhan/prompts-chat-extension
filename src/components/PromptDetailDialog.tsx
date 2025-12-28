import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCopy } from '@/hooks/useCopy';
import { analytics } from '@/lib/analytics';
import { usePrompts } from '@/lib/contexts/PromptsContext';
import { Prompt, TemplateVariable } from '@/lib/types';
import {
  applyTemplateVariables,
  hasTemplateVariables,
  parseTemplateVariables,
} from '@/lib/utils/prompts';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { HighlightedContent } from './HighlightedContent';
import { RunPromptButton } from './RunPromptButton';
import { TypeBadge } from './TypeBadge';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function PromptDetailDialog({ prompt, open, onOpenChange }: PromptDetailDialogProps) {
  const { toggleFavorite, isFavorite } = usePrompts();
  const { copy } = useCopy();
  const [isCopied, setIsCopied] = useState(false);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [showVariables, setShowVariables] = useState(true);


  const favorite = prompt ? isFavorite(prompt.id) : false;
  const hasVars = prompt ? hasTemplateVariables(prompt.content) : false;

  useEffect(() => {
    if (prompt && hasVars) {
      const parsed = parseTemplateVariables(prompt.content);
      setVariables(parsed);
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

  const finalContent = hasVars
    ? applyTemplateVariables(prompt.content, variables)
    : prompt.content;

  const onCopy = () => {
    copy(finalContent).then(() => {
      setIsCopied(true);
      analytics.promptCopied(prompt.id, prompt.category);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const updateVariable = (name: string, value: string) => {
    setVariables(prev => prev.map(v => (v.name === name ? { ...v, value } : v)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-0 max-h-[90vh] grid grid-rows-[auto_auto_auto_1fr] min-h-0 gap-0 overflow-hidden overscroll-contain">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader className="text-left mb-1.5">
            <DialogTitle className="pr-4 leading-snug">
              {prompt.title}&nbsp;&nbsp;<TypeBadge type={prompt.type} />
            </DialogTitle>
            {prompt.description && (
              <DialogDescription className="">
                {prompt.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex items-center gap-2 flex-wrap text-sm">
            <a
              href={`https://prompts.chat/@${prompt.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium underline"
            >
              @{prompt.author}
            </a>
            {prompt.category && (
              <Badge variant="secondary" className="font-normal">
                {prompt.category}
              </Badge>
            )}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {prompt.tags.slice(0, 4).map(tag => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    className="font-normal text-[11px] px-2 py-0"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {prompt.tags.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{prompt.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="px-6 py-3 flex items-center justify-between bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" asChild>
                <a
                  href={`https://prompts.chat/prompts/${prompt.id}_${prompt.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  View
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${favorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
                onClick={() => toggleFavorite(prompt.id)}
              >
                <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <RunPromptButton
              promptId={prompt.id}
              promptContent={finalContent}
              onRun={() => onOpenChange(false)}
            />
          </div>

          {hasVars && variables.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
              <button
                onClick={() => setShowVariables(!showVariables)}
                className="w-full px-6 py-2.5 flex items-center justify-between text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Customize Variables ({variables.length})
                </span>
                {showVariables ? (
                  <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
              </button>

              {showVariables && (
                <div className="px-6 pb-4 grid grid-cols-2 gap-3 items-end">
                  {variables.map(variable => (
                    <div key={variable.name} className="space-y-1.5">
                      <label className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {variable.name}
                      </label>
                      <Input
                        value={variable.value || ''}
                        onChange={e => updateVariable(variable.name, e.target.value)}
                        placeholder={variable.defaultValue || `Enter ${variable.name}`}
                        className="h-8 text-sm bg-white dark:bg-background"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-5 w-full h-full min-h-0">
          <HighlightedContent
            content={prompt.content}
            variables={variables}
            structuredFormat={prompt.structuredFormat}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
