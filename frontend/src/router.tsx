import { createBrowserRouter } from 'react-router';
import App from './App';
import { MatchCrumb } from './features/matches/MatchCrumb';
import { AppLayout, type RouteHandle } from './layouts/AppLayout';
import ClubPage from './pages/ClubPage';
import ClubsPage from './pages/ClubsPage';
import MatchPage from './pages/MatchPage';
import MatchesPage from './pages/MatchesPage';
import NotFound from './pages/NotFound';
import PlayersPage from './pages/PlayersPage';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/jogadores',
        element: <PlayersPage />,
        handle: { crumbs: ['Mercado', 'Jogadores'] } satisfies RouteHandle,
      },
      {
        path: '/clubes',
        element: <ClubsPage />,
        handle: { crumbs: ['Mercado', 'Clubes'] } satisfies RouteHandle,
      },
      {
        path: '/clubes/:id',
        element: <ClubPage />,
        handle: { crumbs: ['Mercado', 'Clubes', 'Detalhes'] } satisfies RouteHandle,
      },
      {
        path: '/partidas',
        element: <MatchesPage />,
        handle: { crumbs: ['Liga', 'Partidas'] } satisfies RouteHandle,
      },
      {
        path: '/partidas/:id',
        element: <MatchPage />,
        handle: { crumbs: ['Liga', 'Partidas', MatchCrumb] } satisfies RouteHandle,
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
