import { QueryClient } from '@tanstack/react-query';

// Cliente único do React Query, compartilhado por toda a aplicação.
// É passado para o QueryClientProvider no main.tsx.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por 1 minuto os dados são considerados "frescos",
      // então não refaz a busca à toa ao remontar um componente
      staleTime: 60_000,

      // Se a requisição falhar, tenta só mais 1 vez (o padrão são 3)
      retry: 1,

      // Não refaz a busca toda vez que eu volto para a aba do navegador
      refetchOnWindowFocus: false,
    },
  },
});
