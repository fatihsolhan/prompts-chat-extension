import { Button } from "@/components/ui/button";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { FileQuestion } from "lucide-react";

export function EmptyPrompts() {
  const { clearAllFilters } = usePrompts();

  return (
    <div className="text-center py-12 space-y-4">
      <FileQuestion className="h-8 w-8 mx-auto text-muted-foreground" />
      <div className="text-lg font-semibold text-foreground">
        No prompts found
      </div>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search or filters
      </p>
      <Button
        variant="outline"
        onClick={clearAllFilters}
        className="mt-2"
      >
        Clear all filters
      </Button>
    </div>
  );
}
