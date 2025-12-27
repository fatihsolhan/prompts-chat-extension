import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePrompts } from '@/lib/contexts/PromptsContext';

export function CategorySelect() {
  const { categories, selectedCategory, setSelectedCategory } = usePrompts();

  return (
    <Select
      value={selectedCategory || 'all'}
      onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
    >
      <SelectTrigger className="h-8 w-[160px] text-xs">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-80">
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map(category => (
          <SelectItem key={category.name} value={category.name} className="text-xs">
            {category.icon && <span className="mr-1.5">{category.icon}</span>}
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
