import { highlightCode } from "@/lib/shiki";
import { TemplateVariable } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

interface HighlightedContentProps {
  content: string;
  variables?: TemplateVariable[];
  structuredFormat?: string;
  className?: string;
  maxLines?: number;
  editable?: boolean;
  onVariableChange?: (name: string, value: string) => void;
}

// Hoisted empty array to prevent new reference on every render
const EMPTY_VARIABLES: TemplateVariable[] = [];

function getVariableDisplayValue(variable: TemplateVariable): string {
  const hasValue = variable.value && variable.value.trim() !== "";
  if (hasValue) return variable.value!;
  return variable.defaultValue || variable.name;
}

function hasCustomValue(variable: TemplateVariable): boolean {
  return Boolean(variable.value && variable.value.trim() !== "");
}

interface EditableVariableProps {
  variable: TemplateVariable;
  onChange: (value: string) => void;
}

function EditableVariable({ variable, onChange }: EditableVariableProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(variable.value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLocalValue(variable.value || "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, variable.value]);

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter") {
      onChange(localValue);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-medium transition-all",
            "hover:ring-2 hover:ring-amber-400/50 cursor-pointer",
            hasCustomValue(variable)
              ? "bg-green-500/20 text-green-600 dark:text-green-400"
              : "bg-amber-500/20 text-amber-600 dark:text-amber-400",
          )}
        >
          {getVariableDisplayValue(variable)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 shadow-xl border-0 rounded-xl overflow-hidden"
        side="top"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-b from-muted/50 to-background">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-semibold text-foreground">{variable.name}</p>
            {variable.defaultValue && (
              <p className="text-xs text-muted-foreground mt-0.5">Default: {variable.defaultValue}</p>
            )}
          </div>
          <div className="p-4 space-y-3">
            <Input
              ref={inputRef}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                onChange(localValue);
              }}
              placeholder={`Enter ${variable.name.toLowerCase()}`}
              className="h-10 text-sm rounded-lg border-border focus:border-foreground/30 focus:ring-1 focus:ring-foreground/20"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Press Enter ↵ to save</p>
              <button
                onClick={() => {
                  onChange(localValue);
                  setOpen(false);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface StaticVariableProps {
  variable: TemplateVariable;
}

function StaticVariable({ variable }: StaticVariableProps): React.ReactElement {
  return (
    <span className="inline-block px-1 py-0.5 mx-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
      {getVariableDisplayValue(variable)}
    </span>
  );
}

export function HighlightedContent({
  content,
  variables = EMPTY_VARIABLES,
  structuredFormat,
  className,
  maxLines,
  editable = false,
  onVariableChange,
}: HighlightedContentProps): React.ReactElement {
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const detectedFormat = structuredFormat?.toLowerCase() as "json" | "yaml" | undefined;
  const isStructured = detectedFormat === "json" || detectedFormat === "yaml";

  const processedContent = useMemo(() => {
    // Don't replace variables if editable - we'll render them as interactive components
    if (!isStructured || !variables.length || editable) return content;
    let result = content;
    for (const variable of variables) {
      const value = variable.value || variable.defaultValue || variable.name;
      result = result.replace(new RegExp(`\\$\\{${variable.name}\\}`, "g"), value);
    }
    return result;
  }, [content, variables, isStructured, editable]);

  const displayContent = useMemo(() => {
    if (!maxLines) return processedContent;
    const lines = processedContent.split("\n");
    return lines.slice(0, maxLines).join("\n");
  }, [processedContent, maxLines]);

  const hasMoreLines = maxLines ? processedContent.split("\n").length > maxLines : false;

  useEffect(() => {
    if (!isStructured || !detectedFormat) return;

    let cancelled = false;

    highlightCode(displayContent, detectedFormat).then((html) => {
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
    return parts.map((part, index) => {
      const isVariable = part.match(/^\$\{[^}]+\}$/);
      if (!isVariable) {
        return <span key={index}>{part}</span>;
      }

      const variableName = part.slice(2, -1).split(":")[0];
      const variable = variables.find((v) => v.name === variableName);

      if (!variable) {
        return <span key={index}>{part}</span>;
      }

      if (editable && onVariableChange) {
        return (
          <EditableVariable
            key={`${variableName}-${index}`}
            variable={variable}
            onChange={(value) => onVariableChange(variableName, value)}
          />
        );
      }

      return <StaticVariable key={index} variable={variable} />;
    });
  }, [displayContent, variables, editable, onVariableChange]);

  function getMaxHeight(lines?: number): string | undefined {
    if (!lines) return undefined;
    if (lines <= 2) return "max-h-[52px]";
    if (lines <= 3) return "max-h-[72px]";
    if (lines <= 5) return "max-h-[110px]";
    return "max-h-[160px]";
  }

  const useHighlighting = isStructured && !(editable && variables.length > 0);

  if (useHighlighting) {
    return (
      <div
        className={cn(
          "relative w-full rounded-md h-full text-xs overflow-hidden",
          "[&_pre]:!m-0 [&_pre]:!p-2 [&_pre]:!rounded-md [&_code]:!text-xs",
          getMaxHeight(maxLines),
          className,
        )}
      >
        <ScrollArea className="h-full w-full">
          {highlightedHtml ? (
            <div className="[&>pre]:whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <pre className="p-2 text-muted-foreground whitespace-pre-wrap text-xs">{displayContent}</pre>
          )}
        </ScrollArea>
        {hasMoreLines && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#22272e] to-transparent pointer-events-none" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full rounded-md bg-muted/80 p-2 overflow-hidden", getMaxHeight(maxLines), className)}
    >
      <ScrollArea className="w-full h-full">
        <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
          {renderWithVariables}
        </div>
      </ScrollArea>
      {hasMoreLines && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted to-transparent pointer-events-none" />
      )}
    </div>
  );
}
