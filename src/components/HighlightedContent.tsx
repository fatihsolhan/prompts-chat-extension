import { ScrollArea } from '@/components/ui/scroll-area';
import { highlightCode } from '@/lib/shiki';
import { TemplateVariable } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

interface HighlightedContentProps {
  content: string;
  variables?: TemplateVariable[];
  structuredFormat?: string;
  className?: string;
  maxLines?: number;
}

export function HighlightedContent({
  content,
  variables = [],
  structuredFormat,
  className,
  maxLines,
}: HighlightedContentProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');

  const detectedFormat = structuredFormat?.toLowerCase();
  const isStructured = detectedFormat === 'json' || detectedFormat === 'yaml';

  const processedContent = useMemo(() => {
    if (!isStructured || !variables.length) return content;
    let result = content;
    for (const variable of variables) {
      const value = variable.value || variable.defaultValue || variable.name;
      result = result.replace(
        new RegExp(`\\$\\{${variable.name}\\}`, 'g'),
        value
      );
    }
    return result;
  }, [content, variables, isStructured]);

  const displayContent = useMemo(() => {
    if (!maxLines) return processedContent;
    const lines = processedContent.split('\n');
    return lines.slice(0, maxLines).join('\n');
  }, [processedContent, maxLines]);

  const hasMoreLines = maxLines ? processedContent.split('\n').length > maxLines : false;

  useEffect(() => {
    if (!isStructured) return;

    let cancelled = false;

    highlightCode(displayContent, detectedFormat as 'json' | 'yaml')
      .then(html => {
        if (!cancelled) {
          setHighlightedHtml(html);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [displayContent, isStructured, detectedFormat]);

  const renderWithVariables = useMemo(() => {
    const parts = displayContent.split(/(\$\{[^}]+\})/g);
    return parts.map((part, i) => {
      if (part.match(/^\$\{[^}]+\}$/)) {
        const fullMatch = part.slice(2, -1);
        const varName = fullMatch.split(':')[0];
        const variable = variables.find(v => v.name === varName);
        const value = (variable?.value && variable.value.trim() !== '')
          ? variable.value
          : (variable?.defaultValue || varName);
        return (
          <span
            key={i}
            className="inline-block px-1 py-0.5 mx-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs"
          >
            {value}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }, [displayContent, variables]);

  if (isStructured) {
    return (
      <div
        className={cn(
          "relative w-full rounded-lg overflow-hidden h-full text-xs",
          "[&_pre]:!m-0 [&_pre]:!p-3 [&_pre]:!rounded-lg [&_code]:!text-xs",
          maxLines && "max-h-[160px]",
          className
        )}
      >
        <ScrollArea className="h-full">
          {highlightedHtml ? (
            <div className="h-full [&>pre]:whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <pre className="p-3 text-muted-foreground whitespace-pre-wrap">{displayContent}</pre>
          )}
        </ScrollArea>
        {hasMoreLines && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#22272e] to-transparent pointer-events-none" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-lg overflow-hidden h-full bg-muted p-3",
        maxLines && "max-h-[120px]",
        className
      )}
    >
      <ScrollArea className="h-full">
        <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
          {renderWithVariables}
        </div>
      </ScrollArea>
      {hasMoreLines && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent pointer-events-none" />
      )}
    </div>
  );
}
