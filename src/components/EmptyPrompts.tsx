import { Button } from "@/components/ui/button";
import { usePrompts } from "@/lib/contexts/PromptsContext";
import { FileQuestion, Heart } from "lucide-react";

export function EmptyPrompts() {
  const { setQuery, setSelectedCategory, setSelectedTags, activeTab, setActiveTab } = usePrompts();

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  const isFavoritesEmpty = activeTab === 'favorites';

  return (
    <div className="text-center py-12 space-y-4">
      {isFavoritesEmpty ? (
        <>
          <Heart className="h-8 w-8 mx-auto text-muted-foreground" />
          <div className="text-lg font-semibold text-foreground">
            No favorites yet
          </div>
          <p className="text-sm text-muted-foreground">
            Click the heart icon on any prompt to save it here
          </p>
          <Button
            variant="outline"
            onClick={() => setActiveTab('all')}
            className="mt-2"
          >
            Browse all prompts
          </Button>
        </>
      ) : (
        <>
          <FileQuestion className="h-8 w-8 mx-auto text-muted-foreground" />
          <div className="text-lg font-semibold text-foreground">
            No prompts found
          </div>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="mt-2"
          >
            Clear all filters
          </Button>
        </>
      )}
    </div>
  );
}
