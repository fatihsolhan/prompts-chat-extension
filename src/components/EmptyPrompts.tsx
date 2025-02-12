import { Button } from "@/components/ui/button";
import { usePromptsContext } from "@/lib/contexts/PromptsContext";
import { FileQuestion } from "lucide-react";



export function EmptyPrompts() {
  const { setQuery, setDevMode } = usePromptsContext();

  const handleClearFilters = () => {
    setQuery('');
    setDevMode(false);
  };

  return (
    <div className="text-center py-12 space-y-4">
      <FileQuestion className="h-8 w-8 mx-auto text-muted-foreground" />
      <div className="text-lg font-semibold text-foreground">
        No prompts found
      </div>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search term
      </p>
      <Button
        variant="outline"
        onClick={handleClearFilters}
        className="mt-2"
      >
        Clear all filters
      </Button>
    </div>
  );
}
