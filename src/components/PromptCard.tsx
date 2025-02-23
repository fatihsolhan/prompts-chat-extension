import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useCopy } from "@/hooks/useCopy";
import { AI_MODELS } from "@/lib/constants";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { AIModel } from "@/lib/types";
import { usePromptInAI } from "@/lib/utils/ai-interactions";
import { Check, ChevronDown, ChevronUp, Copy, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PromptVariablesDialog } from "@/components/PromptVariablesDialog";
import { extractVariables, updatePromptPreview, loadStoredVariables } from "@/lib/utils/prompt-variables";
import { slugify } from '@/lib/utils/string';

interface PromptCardProps {
  act: string;
  prompt: string;
  contributor: string;
  searchQuery?: string;
}

export function PromptCard({
  act,
  prompt,
  contributor,
}: PromptCardProps) {
  const { selectedModel, setSelectedModel, query: searchQuery } = usePrompts();
  const [isOpen, setIsOpen] = useState(!!searchQuery);
  const { copy } = useCopy();
  const [isCopied, setIsCopied] = useState(false);
  const [updatedPrompt, setUpdatedPrompt] = useState(updatePromptPreview(prompt));
  const onCopy = () => {
    // Copy the processed prompt instead of the original
    copy(updatedPrompt.replace(/<[^>]*>/g, '')).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingVariables, setIsEditingVariables] = useState(false);

  const variables = extractVariables(prompt);
  const hasVariables = variables.length > 0;

  useEffect(() => {
    setIsOpen(!!searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const initialVariables = extractVariables(prompt);
    if (initialVariables.length > 0) {
      const stored = loadStoredVariables();
        const key = slugify(act);
        const storedData = stored[key];
        const initialValues = Object.fromEntries(
          initialVariables.map(v => [v.name, storedData?.values[v.name] || v.default || ''])
        );
        const initialPreview = updatePromptPreview(prompt, initialValues);
        setUpdatedPrompt(initialPreview);
     
    }
  }, [prompt, act]);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) as unknown as AIModel;
  if (!currentModel) return null;

  const handleUsePrompt = async () => {
    setIsLoading(true);
    try {
      // Use the processed prompt instead of the original
      await usePromptInAI(updatedPrompt.replace(/<[^>]*>/g, ''), currentModel);
    } finally {
      setIsLoading(false);
    }
  };

  const displayPrompt = updatePromptPreview(prompt, undefined, hasVariables ? act : undefined);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-primary">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{act}</h3>
        </div>

        <div className="flex flex-col gap-2">
          <p className={`text-sm text-muted-foreground ${!isOpen && 'line-clamp-3'}`}
             dangerouslySetInnerHTML={{ __html: displayPrompt }}
          />
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            size="sm"
            className="mt-1 h-6 px-2 text-xs hover:bg-transparent text-muted-foreground hover:text-foreground ml-auto gap-1"
          >
            {isOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
            <span>{isOpen ? 'Show less' : 'Show more'}</span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t">
          <a
            href={`https://github.com/${contributor}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            @{contributor}
          </a>

          <div className="flex items-center gap-2">
            {hasVariables && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingVariables(true)}
                className="h-8 text-xs hover:bg-primary/10 hover:border-primary hover:text-primary gap-1"
              >
                <Edit2 className="h-3 w-3" />
                <span className="hidden sm:block">Edit Variables</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              className="h-8 text-xs hover:bg-primary/10 hover:border-primary hover:text-primary gap-1"
            >
              {isCopied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="hidden sm:block">Copy</span>
            </Button>

            <div className="inline-flex -space-x-px rounded-lg shadow-sm group">
              <Button
                onClick={handleUsePrompt}
                size="sm"
                variant="outline"
                className="h-8 text-xs rounded-none shadow-none first:rounded-s-lg focus-visible:z-10 transition-colors-disabled
                hover:bg-primary/10
                hover:text-primary group-hover:border-primary
                "
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <img
                    src={currentModel.icon}
                    alt={currentModel.name}
                    className={`size-4 ${['github-copilot', 'chatgpt'].includes(currentModel.id) ? 'dark:invert' : ''}`}
                  />
                )}
                Use in {currentModel.name}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-none shadow-none last:rounded-e-lg focus-visible:z-10
                    hover:bg-primary/10
                    hover:text-primary group-hover:border-primary
                    !ring-0
                    data-[state=open]:bg-primary/10 data-[state=open]:text-primary data-[state=open]:border-primary
                    "
                    disabled={isLoading}
                  >
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {AI_MODELS.map((model) => (
                    <DropdownMenuItem key={model.id} onSelect={() => setSelectedModel(model.id)}>
                      <div className="flex items-center gap-2">
                        {model.id === selectedModel ? <Check className="size-4" /> : <img
                          src={model.icon}
                          alt={model.name}
                          className={`size-4 ${['github-copilot', 'chatgpt'].includes(model.id) ? 'dark:invert' : ''}`}
                        />}
                        <span className="text-sm">{model.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <PromptVariablesDialog
        isOpen={isEditingVariables}
        onClose={() => setIsEditingVariables(false)}
        prompt={prompt}
        act={act}
        variables={variables}
      />
    </div>
  );
}
