import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Github } from "lucide-react";
import { Logo } from "./Logo";

interface AboutDialogProps {
  trigger: React.ReactNode;
}

export function AboutDialog({ trigger }: AboutDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="rounded-lg max-w-[90dvw] grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90dvh] pb-0 px-0">
        <DialogHeader className="px-4">
          <DialogTitle>
            <Logo size="md" />
          </DialogTitle>
          <DialogDescription className="text-sm text-left">
            A Chrome extension for prompts.chat that lets you browse, filter, and run prompts directly in your favorite AI tools.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4 overflow-y-auto px-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Developers</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg bg-card border p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://github.com/fatihsolhan.png" />
                    <AvatarFallback>FS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">Fatih Solhan</div>
                    <div className="text-sm text-muted-foreground">Extension Creator</div>
                  </div>
                </div>
                <a
                  href="https://github.com/fatihsolhan/prompts-chat-extension"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors-disabled p-2 hover:bg-accent rounded-md"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-card border p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://github.com/f.png" />
                    <AvatarFallback>FKA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">Fatih Kadir Akın</div>
                    <div className="text-sm text-muted-foreground">prompts.chat Creator</div>
                  </div>
                </div>
                <a
                  href="https://github.com/f/awesome-chatgpt-prompts"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors-disabled p-2 hover:bg-accent rounded-md"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Add Your Prompt</h3>
            <div className="rounded-lg border p-4 bg-card">
              <p className="text-sm text-muted-foreground mb-4">
                Have a great prompt to share? Submit it to prompts.chat to make it available for everyone.
              </p>
              <a
                href="https://prompts.chat/prompts/new"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  Submit a new prompt
                </Button>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
