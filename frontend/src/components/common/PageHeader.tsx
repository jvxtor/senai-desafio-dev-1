import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Ação principal da página, como o botão de cadastro. */
  action?: ReactNode;
  /** Conteúdo ao lado do título, antes da ação (por exemplo, números do cabeçalho). */
  aside?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, action, aside }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 flex-wrap gap-x-4 gap-y-3',
        aside ? 'items-center' : 'items-start',
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl border bg-background text-primary"
        >
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground short:hidden">{description}</p>
        </div>
      </div>
      {aside && <div className="w-full lg:ml-auto lg:w-auto">{aside}</div>}
      {action && <div className={aside ? undefined : 'ml-auto'}>{action}</div>}
    </header>
  );
}
