import { useCopy } from '@/hooks/useCopy';
import { usePrompts } from '@/lib/contexts/PromptsContext';
import { Prompt } from '@/lib/types';
import { hasTemplateVariables } from '@/lib/utils/prompts';
import {
  ArrowBigUp,
  Check,
  Copy,
  Heart,
  Variable
} from 'lucide-react';
import { memo, useState } from 'react';
import { HighlightedContent } from './HighlightedContent';
import { RunPromptButton } from './RunPromptButton';
import { TypeBadge } from './TypeBadge';
import { Button } from './ui/button';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export const PromptCard = memo(function PromptCard({ prompt, onClick }: PromptCardProps) {
  const { toggleFavorite, isFavorite, setSelectedTags } = usePrompts();
  const { copy } = useCopy();
  const [isCopied, setIsCopied] = useState(false);

  const favorite = isFavorite(prompt.id);
  const hasVars = hasTemplateVariables(prompt.content);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(prompt.content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(prompt.id);
  };

  return (
    <div
      onClick={onClick}
      className="group rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium leading-snug line-clamp-1 group-hover:underline">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {prompt.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <TypeBadge type={prompt.type} className="text-[10px]" />
          {hasVars && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Variable className="h-2.5 w-2.5" />
              Vars
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <HighlightedContent
          content={prompt.content}
          structuredFormat={prompt.structuredFormat}
          maxLines={7}
        />
      </div>

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 3).map(tag => (
            <button
              key={tag.name}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTags([tag.name]);
              }}
              className="px-2 py-0.5 text-[10px] rounded-full hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: `${tag.color}15`,
                color: tag.color,
              }}
            >
              {tag.name}
            </button>
          ))}
          {prompt.tags.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="hover:text-foreground transition-colors">
          @{prompt.author}
        </span>

        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {prompt.votes > 0 && (
            <span className="flex items-center gap-0.5">
              <ArrowBigUp />
              {prompt.votes}
            </span>
          )}
          <RunPromptButton
            promptId={prompt.id}
            promptContent={prompt.content}
            size="sm"
            className="h-7"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
          >
            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`size-6 ${favorite ? '!text-destructive' : ''}`}
            onClick={handleFavorite}
          >
            <Heart className={`size-3 ${favorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
});
