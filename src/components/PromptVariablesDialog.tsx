import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { updatePromptPreview, PromptVariable, loadStoredVariables, saveVariableValues } from "@/lib/utils/prompt-variables";
import { slugify } from '@/lib/utils/string';
import { Check, Loader2 } from "lucide-react";

export interface PromptVariablesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  act: string;
  variables: PromptVariable[];
}

export function PromptVariablesDialog({
  isOpen,
  onClose,
  prompt,
  act,
  variables,
}: PromptVariablesDialogProps) {
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simplified useEffect
  useEffect(() => {
    if (isOpen) {
      const stored = loadStoredVariables();
      const key = slugify(act);
      const storedData = stored[key];
      setEditedValues(storedData?.values || {});
    }
  }, [isOpen, prompt, act]);

  const handleInputChange = (name: string, value: string) => {
    setEditedValues(prevValues => {
      const newValues = { ...prevValues, [name]: value };
      //onUpdate(processedPrompt);
      return newValues;
    });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      saveVariableValues(act, editedValues, variables);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save variable values:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    // Create default values object with empty strings for non-default fields
    const defaultValues = Object.fromEntries(
      variables.map(v => [v.name, ''])
    );
    
    // Reset all inputs and values
    const inputs = document.querySelectorAll('.variable-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.value = '';
      const variable = variables.find(v => v.name === input.id);
      if (variable?.default) {
        input.placeholder = variable.default;
      }
    });

    setEditedValues(defaultValues);
    setSaveSuccess(false);
  };

  const hasChangesToRestore = () => {
    return Object.entries(editedValues).some(([_, value]) => {
      return value !== '';  // If any value is non-empty, there's something to restore
    });
  };

  const hasChangesToSave = () => {
    const stored = loadStoredVariables();
    const key = slugify(act);
    const storedData = stored[key]?.values || {};
    
    return Object.entries(editedValues).some(([name, value]) => {
      return value !== (storedData[name] || '');  // Compare with stored values
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Edit Variables</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 flex-1 overflow-y-auto pb-4">
          <div className="grid gap-6 px-1">
            {variables.map((variable) => (
              <div key={variable.name} className="flex flex-col gap-2">
                <Label htmlFor={variable.name} className="text-left font-medium">
                  {variable.name}
                </Label>
                <div className="">
                  <Input
                    id={variable.name}
                    value={editedValues[variable.name] ?? ''}
                    onChange={(e) => handleInputChange(variable.name, e.currentTarget.value)}
                    placeholder={variable.default || `Enter ${variable.name}`}
                    className="col-span-3 variable-input ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div 
              className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ 
                __html: updatePromptPreview(prompt, editedValues) 
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleRestoreDefaults}
            disabled={!hasChangesToRestore()}
            className="w-full"
          >
            Restore Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChangesToSave()}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
