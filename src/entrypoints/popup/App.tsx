import { Container } from '@/components/Container';
import { EmptyPrompts } from '@/components/EmptyPrompts';
import { LoadingPrompts } from '@/components/LoadingPrompts';
import { Navbar } from '@/components/Navbar';
import { PromptsList } from '@/components/PromptsList';
import { ScrollToTop } from '@/components/ScrollToTop';
import { PromptsProvider, usePromptsContext } from '@/lib/contexts/PromptsContext';

function AppContent() {
  const { filteredPrompts, isLoading } = usePromptsContext();
  return (
    <>
      <div className="min-h-screen bg-muted dark:bg-muted/30 min-w-[300px]">
        <Navbar />
        <Container>
          <main className="mx-auto py-6">
            <div className="mx-auto w-full max-w-2xl">
              {filteredPrompts.length === 0 ? (
                isLoading ? (
                  <LoadingPrompts />
                ) : (
                  <>
                    <EmptyPrompts />
                  </>
                )
              ) : (
                <PromptsList />
              )}
            </div>
          </main>
        </Container>
        <ScrollToTop />
      </div>
    </>
  );
}

function App() {
  return (
    <PromptsProvider>
      <AppContent />
    </PromptsProvider>
  );
}

export default App;
