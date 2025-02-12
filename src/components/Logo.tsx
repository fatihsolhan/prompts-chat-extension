import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: {
    container: "h-6 w-6",
    text: "text-base",
  },
  md: {
    container: "h-8 w-8",
    text: "text-xl",
  },
  lg: {
    container: "h-12 w-12",
    text: "text-2xl",
  },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <img
        src="/logo/prompts-chat-logo-48.png"
        alt="prompts.chat logo"
        className={SIZES[size].container}
      />
      {showText && (
        <h1
          className={cn(
            SIZES[size].text,
            "font-semibold text-lg inline-block text-foreground"
          )}
        >
          prompts.chat
        </h1>
      )}
    </div>
  );
}
