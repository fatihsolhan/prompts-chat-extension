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
    <div className={cn("flex items-center gap-2", className)}>
      <img src="/logos/logo-light.svg" alt="prompts.chat logo" className={cn(SIZES[size].container, "dark:hidden")} />
      <img
        src="/logos/logo-dark.svg"
        alt="prompts.chat logo"
        className={cn(SIZES[size].container, "hidden dark:block")}
      />
      {showText && (
        <h1 className={cn(SIZES[size].text, "font-semibold text-lg inline-block text-foreground")}>prompts.chat</h1>
      )}
    </div>
  );
}
