import { Prompt } from "@/lib/types";
import { ChevronUp, Play } from "lucide-react";
import { memo } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { HighlightedContent } from "./HighlightedContent";
import { TypeBadge } from "./TypeBadge";

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export const PromptCard = memo(function PromptCard({ prompt, onClick }: PromptCardProps) {
  const hasImage = prompt.mediaUrl && prompt.type === "IMAGE";
  const hasVideo = prompt.mediaUrl && prompt.type === "VIDEO";
  const hasAudio = prompt.mediaUrl && prompt.type === "AUDIO";
  const isTextPrompt = !hasImage && !hasVideo && !hasAudio;

  return (
    <article
      onClick={onClick}
      className="group flex gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:shadow-md transition-shadow"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto 100px",
      }}
      data-testid="prompt-card"
    >
      {/* Thumbnail (for image prompts) */}
      {hasImage && (
        <div className="relative size-24 shrink-0 rounded-md overflow-hidden bg-muted">
          <img src={prompt.mediaUrl} alt={prompt.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      {/* Video thumbnail with play overlay */}
      {hasVideo && (
        <div className="relative size-24 shrink-0 rounded-md overflow-hidden bg-muted">
          <video src={prompt.mediaUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title + Type */}
        <div className="flex items-start gap-2 mb-1">
          <h3 className="flex-1 min-w-0 text-sm font-semibold leading-snug line-clamp-1 group-hover:underline">
            {prompt.title}
          </h3>
          <TypeBadge type={prompt.type} className="text-[10px] shrink-0" />
        </div>

        {/* Description */}
        {prompt.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed mb-1.5">{prompt.description}</p>
        )}

        {/* Audio Player - for audio prompts */}
        {hasAudio && (
          <div className="mb-1.5">
            <AudioPlayer src={prompt.mediaUrl!} />
          </div>
        )}

        {/* Content Preview - only for text prompts */}
        {isTextPrompt && (
          <div className="mb-1.5">
            <HighlightedContent content={prompt.content} structuredFormat={prompt.structuredFormat} maxLines={2} />
          </div>
        )}

        {/* Bottom row: Tags + Author + Votes */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Tags */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            {prompt.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag.name}
                className="px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Author */}
          <span className="text-xs text-muted-foreground shrink-0">@{prompt.author}</span>

          {/* Votes */}
          {prompt.votes > 0 ? (
            <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-500 shrink-0">
              <ChevronUp className="h-3 w-3" />
              {prompt.votes}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
});
