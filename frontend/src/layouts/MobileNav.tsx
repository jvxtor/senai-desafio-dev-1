import { Menu } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../components/ui/sheet';
import { Brand, SidebarContent } from './SidebarContent';
import type { NavCounts } from './useNavCounts';

// A barra do topo do celular: botão de menu, marca e o painel lateral com o mesmo conteúdo da
// barra do computador. Tocar num link fecha o painel.
export function MobileNav({ counts }: { counts: NavCounts }) {
  const [open, setOpen] = useState(false);

  function closeOnNavigate(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background px-3 py-2 lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <Brand />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="data-[side=left]:w-72 data-[side=left]:max-w-[85vw] data-[side=left]:sm:max-w-72"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Telas do sistema e a lista de clubes.
          </SheetDescription>
          <div
            onClick={closeOnNavigate}
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4"
          >
            <SidebarContent counts={counts} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
