/**
 * Run Prompt Button
 *
 * Reusable dropdown button for running prompts on AI platforms.
 * Supports both Chat and Code platforms with platform-specific icons.
 */

import { useCopy } from '@/hooks/useCopy';
import { CHAT_PLATFORMS, CODE_PLATFORMS, Platform, buildPlatformUrl } from '@/lib/constants';
import { usePrompts } from '@/lib/contexts/PromptsContext';
import { cn } from '@/lib/utils';
import { usePromptInAI } from '@/lib/utils/ai-interactions';
import {
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  MessageSquare,
  Play,
  Zap
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface RunPromptButtonProps {
  /** The prompt content to run */
  promptContent: string;
  /** Custom trigger element - if not provided, uses default button */
  trigger?: ReactNode;
  /** Button size variant */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /** Additional class for the trigger */
  className?: string;
  /** Callback after running */
  onRun?: () => void;
}

export function RunPromptButton({
  promptContent,
  trigger,
  size = 'sm',
  className,
  onRun,
}: RunPromptButtonProps) {
  const { setSelectedModel } = usePrompts();
  const { copy } = useCopy();
  const [isLoading, setIsLoading] = useState(false);
  const [modelTab, setModelTab] = useState<'chat' | 'code'>('chat');
  const [copiedForPlatform, setCopiedForPlatform] = useState<string | null>(null);

  const platforms = modelTab === 'chat' ? CHAT_PLATFORMS : CODE_PLATFORMS;

  const handleRunOnPlatform = async (platform: Platform) => {
    setIsLoading(true);

    try {
      if (platform.id !== 'copy') {
        await setSelectedModel(platform.id);
      }

      const success = await usePromptInAI(promptContent, platform);

      if (success) {
        onRun?.();
        return;
      }

      if (platform.supportsQuerystring) {
        const url = buildPlatformUrl(platform.id, platform.baseUrl, promptContent);
        window.open(url, '_blank');
      } else {
        await copy(promptContent);
        setCopiedForPlatform(platform.id);
        window.open(platform.baseUrl, '_blank');
        setTimeout(() => setCopiedForPlatform(null), 3000);
      }
      onRun?.();
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button
      size={size}
      variant="defaultLighter"
      className={cn("gap-1.5 group", className)}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <Play className="size-3 fill-current" />
      )}
      Run
      <ChevronDown className="size-3 group-aria-expanded:rotate-180 duration-200" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side='bottom' className="w-[280px] p-2">
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-2">
          <button
            onClick={() => setModelTab('chat')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
              modelTab === 'chat'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            onClick={() => setModelTab('code')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
              modelTab === 'code'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto -mx-1 px-1">
          {platforms.map(platform => (
            <DropdownMenuItem
              key={platform.id}
              onSelect={() => handleRunOnPlatform(platform)}
              className="flex items-center gap-3 py-2.5 cursor-pointer focus:bg-accent focus:text-accent-foreground rounded-md mb-0.5"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-muted/50 border border-muted">
                {platform.icon ? (
                  <img src={platform.icon} alt={platform.name} className="h-3.5 w-3.5 object-contain" />
                ) : platform.supportsQuerystring === false ? (
                  <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-green-600" />
                )}
              </div>

              <span className="flex-1 text-sm font-medium leading-none">
                {platform.name}
              </span>

              {copiedForPlatform === platform.id && (
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  Copied
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
