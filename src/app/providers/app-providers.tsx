import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode } from 'react';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { queryClient } from '@/shared/api/query-client';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
