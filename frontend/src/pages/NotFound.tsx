import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';

function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <span
        aria-hidden="true"
        className="pointer-events-none select-none text-[10rem] leading-none font-black tracking-tighter text-primary/10 sm:text-[16rem]"
      >
        404
      </span>
      <div className="-mt-16 flex flex-col items-center gap-4 sm:-mt-24">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Página não encontrada
        </h1>
        <p className="max-w-md text-muted-foreground">
          O endereço que você tentou abrir não existe ou foi movido. Confira o link ou volte para a
          página inicial.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft />
            Voltar
          </Button>
          <Button render={<Link to="/" />}>
            <Home />
            Ir para o início
          </Button>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
