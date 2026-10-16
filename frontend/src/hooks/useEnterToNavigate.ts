import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const INTERACTIVE = 'a, button, input, textarea, select, [contenteditable]';

/** Atalho de teclado: Enter leva para a rota, a menos que o foco já esteja num controle. */
export function useEnterToNavigate(path: string) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' || event.defaultPrevented) return;

      const { target } = event;
      if (target instanceof HTMLElement && target.closest(INTERACTIVE)) return;

      void navigate(path);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, path]);
}
