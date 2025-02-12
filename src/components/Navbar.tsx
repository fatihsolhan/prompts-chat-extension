import { Button } from "@/components/ui/button";
import { isDarkModeStorage, useStorage } from "@/lib/utils/storage";
import { Github, Info, Moon, Sun } from "lucide-react";
import { AboutDialog } from "./AboutDialog";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { SearchPrompts } from "./SearchPrompts";

export function Navbar() {
  const { value: isDarkMode, setValue: setIsDarkMode } = useStorage({
    storageItem: isDarkModeStorage,
    defaultValue: false
  });

  const toggleTheme = async () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="bg-background sticky top-0 z-10 py-3 drop-shadow">
      <Container>
        <nav className="w-full">
          <div className="container flex h-14 items-center">
            <div className="flex flex-1 items-center justify-between">
              <a href="/" className="flex items-center space-x-2">
                <Logo />
              </a>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:text-foreground/80"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <a
                  href="https://github.com/fatihsolhan/prompts-chat-extension"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground/80"
                >
                  <Github className="h-5 w-5" />
                </a>
                <AboutDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="hover:text-foreground/80">
                      <Info className="h-5 w-5" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </nav>
        <SearchPrompts />
      </Container>
    </div>
  );
}
