import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Outlet, useMatches, type Params } from 'react-router';
import { IconButton } from '../components/common/IconButton';
import { MobileNav } from './MobileNav';
import { SidebarContent } from './SidebarContent';
import { useNavCounts } from './useNavCounts';

/** Um trecho da trilha: texto fixo ou um componente que descobre o texto pelos parâmetros da rota. */
export type Crumb = string | ComponentType<{ params: Params }>;

/** Cada rota pode declarar o caminho de navegação em `handle: { crumbs: [...] }`. */
export interface RouteHandle {
  crumbs?: Crumb[];
}

const SIDEBAR_STORAGE_KEY = 'passe:sidebar-aberta';

// O navegador pode bloquear o armazenamento (janela anônima, por exemplo): nesse caso, vale o padrão.
function readSidebarPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveSidebarPreference(open: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  } catch {
    // Sem armazenamento, a escolha vale só até recarregar a página.
  }
}

function Breadcrumb() {
  const crumbs = useMatches().flatMap((match) =>
    ((match.handle as RouteHandle | undefined)?.crumbs ?? []).map((crumb) => ({
      crumb,
      params: match.params,
    })),
  );

  return (
    <nav aria-label="Você está em" className="flex items-center gap-1.5 text-sm">
      {crumbs.map(({ crumb: Crumb, params }, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && (
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
          )}
          <span
            aria-current={index === crumbs.length - 1 ? 'page' : undefined}
            className={index === crumbs.length - 1 ? 'font-medium' : 'text-muted-foreground'}
          >
            {typeof Crumb === 'string' ? Crumb : <Crumb params={params} />}
          </span>
        </span>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const counts = useNavCounts();
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarPreference);

  function toggleSidebar() {
    setSidebarOpen((current) => {
      saveSidebarPreference(!current);
      return !current;
    });
  }

  return (
    <div className="min-h-svh bg-muted/40 lg:flex">
      {sidebarOpen && (
        <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-background p-4 lg:sticky lg:top-0 lg:flex lg:h-svh">
          <SidebarContent counts={counts} />
        </aside>
      )}

      {/* No celular, a barra do topo abre o mesmo menu num painel lateral. */}
      <MobileNav counts={counts} />

      <main className="flex min-w-0 flex-1 flex-col p-4 lg:h-svh lg:p-6">
        <div className="mb-4 hidden shrink-0 items-center gap-2 lg:flex">
          <IconButton
            label={sidebarOpen ? 'Ocultar menu' : 'Mostrar menu'}
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
          >
            {sidebarOpen ? (
              <PanelLeftClose aria-hidden="true" />
            ) : (
              <PanelLeftOpen aria-hidden="true" />
            )}
          </IconButton>
          <Breadcrumb />
        </div>
        <div className="min-h-0 flex-1 lg:overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
