import { Container } from '@/components/Container';
import { EmptyPrompts } from '@/components/EmptyPrompts';
import { LoadingPrompts } from '@/components/LoadingPrompts';
import { Navbar } from '@/components/Navbar';
import { PromptsList } from '@/components/PromptsList';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SidePanelNotice } from '@/components/SidePanelNotice';
import { analytics } from '@/lib/analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { PromptsProvider, usePrompts } from '@/lib/contexts/PromptsContext';

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
    <div className="h-full w-full flex flex-col bg-muted dark:bg-muted/30 overflow-hidden">
      <SidePanelNotice />
      <Navbar />
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <Container className="h-full">
            <LoadingPrompts />
          </Container>
        ) : filteredPrompts.length === 0 ? (
          <Container className="h-full">
            <EmptyPrompts />
          </Container>
        ) : (
          <PromptsList />
        )}
      </div>
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
