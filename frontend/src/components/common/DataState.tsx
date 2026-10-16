import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { getErrorMessage } from '../../lib/errors';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface DataStateProps {
  isPending: boolean;
  error: unknown;
  isEmpty: boolean;
  onRetry: () => void;
  loadingLabel: string;
  /** O que mostrar quando a consulta deu certo, mas não há nada para listar. */
  empty: ReactNode;
  children: ReactNode;
}

const SKELETON_ROWS = 6;

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {children}
    </div>
  );
}

// Os três estados de toda tela de lista: carregando, erro e vazio.
export function DataState(props: DataStateProps) {
  const { isPending, error, isEmpty, onRetry, loadingLabel, empty, children } =
    props;

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p role="status" className="text-sm text-muted-foreground">
          {loadingLabel}
        </p>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
        <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
        <div>
          <p className="text-sm font-medium">Não foi possível carregar a lista</p>
          <p role="alert" className="mt-1 text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      </Panel>
    );
  }

  if (isEmpty) return <Panel>{empty}</Panel>;

  return children;
}
