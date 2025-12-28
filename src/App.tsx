import { Container } from '@/components/Container';
import { EmptyPrompts } from '@/components/EmptyPrompts';
import { LoadingPrompts } from '@/components/LoadingPrompts';
import { Navbar } from '@/components/Navbar';
import { PromptsList } from '@/components/PromptsList';
import { ScrollToTop } from '@/components/ScrollToTop';
import { analytics } from '@/lib/analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { PromptsProvider, usePrompts } from './lib/contexts/PromptsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { filteredPrompts, isLoading } = usePrompts();

  useEffect(() => {
    analytics.extensionOpened();
  }, []);

  return (
    <div className="min-h-screen min-w-[600px] bg-muted dark:bg-muted/30">
      <Navbar />
      <Container>
        <main className="mx-auto">
          <div className="mx-auto w-full">
            {isLoading ? (
              <LoadingPrompts />
            ) : filteredPrompts.length === 0 ? (
              <EmptyPrompts />
            ) : (
              <PromptsList className="py-6" />
            )}
          </div>
        </main>
      </Container>
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PromptsProvider>
        <AppContent />
      </PromptsProvider>
    </QueryClientProvider>
  );
}

export default App;
