import { createBrowserRouter } from 'react-router';
import App from './App';
import { AppLayout } from './layouts/AppLayout';
import NotFound from './pages/NotFound';
import PlayersPage from './pages/PlayersPage';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    element: <AppLayout />,
    children: [{ path: '/jogadores', element: <PlayersPage /> }],
  },
  { path: '*', element: <NotFound /> },
]);
