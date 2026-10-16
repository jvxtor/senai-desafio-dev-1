import {
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useMatches } from 'react-router';
import { IconButton } from '../components/common/IconButton';
import { ClubsNav } from './ClubsNav';

interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Sem rota, o item aparece desativado até a tela existir. */
  to?: string;
}

/** Cada rota pode declarar o caminho de navegação em `handle: { crumbs: [...] }`. */
export interface RouteHandle {
  crumbs?: string[];
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Mercado',
    items: [{ label: 'Jogadores', icon: Users, to: '/jogadores' }],
  },
  {
    title: 'Liga',
    items: [
      { label: 'Partidas', icon: Swords },
      { label: 'Classificação', icon: Trophy },
    ],
  },
];

// No celular não há barra lateral com a lista de clubes: o menu do topo leva à tela de clubes.
const CLUBS_ITEM: NavItem = { label: 'Clubes', icon: Shield, to: '/clubes' };
const MOBILE_ITEMS: NavItem[] = [
  ...SECTIONS[0].items,
  CLUBS_ITEM,
  ...SECTIONS.slice(1).flatMap((section) => section.items),
];

const SIDEBAR_STORAGE_KEY = 'passe:sidebar-aberta';
const ITEM_CLASS = 'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap';

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

function NavEntry({ item }: { item: NavItem }) {
  const Icon = item.icon;

  if (!item.to) {
    return (
      <span
        aria-disabled="true"
        title="Disponível em breve"
        className={`${ITEM_CLASS} cursor-not-allowed text-muted-foreground/50`}
      >
        <Icon aria-hidden="true" className="size-4" />
        {item.label}
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        `${ITEM_CLASS} outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
          isActive
            ? 'bg-muted font-medium text-foreground'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`
      }
    >
      <Icon aria-hidden="true" className="size-4" />
      {item.label}
    </NavLink>
  );
}

function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-primary text-base font-bold text-primary-foreground"
      >
        P
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Passe</span>
        <span className="block text-xs text-muted-foreground">Gestão da liga</span>
      </span>
    </Link>
  );
}

function Breadcrumb() {
  const crumbs = useMatches().flatMap(
    (match) => (match.handle as RouteHandle | undefined)?.crumbs ?? [],
  );

  return (
    <nav aria-label="Você está em" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => (
        <span key={crumb} className="flex items-center gap-1.5">
          {index > 0 && (
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
          )}
          <span
            aria-current={index === crumbs.length - 1 ? 'page' : undefined}
            className={index === crumbs.length - 1 ? 'font-medium' : 'text-muted-foreground'}
          >
            {crumb}
          </span>
        </span>
      ))}
    </nav>
  );
}

export function AppLayout() {
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
          <Brand />
          <nav aria-label="Principal" className="flex flex-col gap-5">
            {SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col gap-1">
                <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <NavEntry key={item.label} item={item} />
                ))}
              </div>
            ))}
          </nav>
          <ClubsNav />
          <p className="mt-auto flex shrink-0 items-center gap-2 px-2.5 text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5" />
            Horário de Brasília (UTC−3)
          </p>
        </aside>
      )}

      <header className="flex flex-col gap-2 border-b bg-background px-4 py-3 lg:hidden">
        <Brand />
        <nav aria-label="Principal" className="flex gap-1 overflow-x-auto">
          {MOBILE_ITEMS.map((item) => (
            <NavEntry key={item.label} item={item} />
          ))}
        </nav>
      </header>

      <main className="flex min-w-0 flex-1 flex-col p-4 lg:h-svh lg:p-6">
        {/* No celular o menu já fica no topo; o botão só existe onde há barra lateral. */}
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
