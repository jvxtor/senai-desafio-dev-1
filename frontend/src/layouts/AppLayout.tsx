import {
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  ListOrdered,
  Shield,
  Swords,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Link, NavLink, Outlet, useMatches, type Params } from 'react-router';
import { IconButton } from '../components/common/IconButton';
import { ClubsNav } from './ClubsNav';
import { useNavCounts, type NavCounts } from './useNavCounts';

interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Sem rota, o item aparece desativado até a tela existir. */
  to?: string;
  /** Qual contador mostrar ao lado do nome. */
  count?: keyof NavCounts;
  /** O item continua ativo nas telas de dentro dele (a partida aberta, por exemplo). */
  nested?: boolean;
}

/** Cada rota pode declarar o caminho de navegação em `handle: { crumbs: [...] }`. */
/** Um trecho da trilha: texto fixo ou um componente que descobre o texto pelos parâmetros da rota. */
export type Crumb = string | ComponentType<{ params: Params }>;

export interface RouteHandle {
  crumbs?: Crumb[];
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Mercado',
    items: [
      { label: 'Jogadores', icon: Users, to: '/jogadores', count: 'players' },
      { label: 'Clubes', icon: Shield, to: '/clubes', count: 'clubs' },
    ],
  },
  {
    title: 'Liga',
    items: [
      { label: 'Partidas', icon: Swords, to: '/partidas', count: 'matches', nested: true },
      { label: 'Classificação', icon: ListOrdered },
    ],
  },
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

// O número ao lado do nome, quando já chegou.
function Count({ value }: { value: number | undefined }) {
  if (value === undefined) return null;
  return <span className="ml-auto pl-2 text-xs text-muted-foreground tabular-nums">{value}</span>;
}

function NavEntry({ item, counts }: { item: NavItem; counts: NavCounts }) {
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
      end={!item.nested}
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
      <Count value={item.count ? counts[item.count] : undefined} />
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
          <Brand />
          <nav aria-label="Principal" className="flex flex-col gap-5">
            {SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col gap-1">
                <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <NavEntry key={item.label} item={item} counts={counts} />
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
          {SECTIONS.flatMap((section) => section.items).map((item) => (
            <NavEntry key={item.label} item={item} counts={counts} />
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
