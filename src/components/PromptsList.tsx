import { usePromptsContext } from "@/lib/contexts/PromptsContext";
import { useMemo } from "react";
import { PromptCard } from "./PromptCard";


export function PromptsList() {
  const { devMode, filteredPrompts, prompts, query: searchQuery } = usePromptsContext();
  const totalCount = prompts.length;
  const filterDescription = useMemo(() => {
    const filteredCount = filteredPrompts.length;

    if (filteredCount === totalCount) {
      return `${filteredCount} prompts`;
    }
    return `Showing ${filteredCount} of ${totalCount} prompts${devMode ? ' (Developer Mode)' : ''}`;
  }, [filteredPrompts.length, totalCount, searchQuery, devMode]);

  return (
    <div className="space-y-4">
      <div className="px-1">
        <span className="text-sm text-muted-foreground">
          {filterDescription}
        </span>
      </div>

      <div className="space-y-3">
        {filteredPrompts.map((prompt, index) => (
          <PromptCard
            key={`${prompt.act}-${index}`}
            act={prompt.act}
            prompt={prompt.prompt}
            contributor={prompt.contributor || '@f'}
          />
        ))}
      </div>
    </div>
  );
}
