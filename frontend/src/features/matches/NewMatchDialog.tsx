import { CircleAlert, Info, Loader2, Swords } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { SelectField } from '../../components/forms/fields';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useClubs } from '../../hooks/clubs';
import { usePlayMatch } from '../../hooks/matches';
import { getErrorMessage } from '../../lib/errors';
import type { Match } from '../../services/types';

interface NewMatchDialogProps {
  onClose: () => void;
  /** Chamado com a partida jogada, para a tela abrir os detalhes dela. */
  onPlayed: (match: Match) => void;
}

interface Errors {
  home?: string;
  away?: string;
}

export function NewMatchDialog({ onClose, onPlayed }: NewMatchDialogProps) {
  const clubs = useClubs();
  const play = usePlayMatch();

  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const apiError = play.error ? getErrorMessage(play.error) : null;

  // O clube escolhido de um lado não pode ser escolhido do outro.
  const optionsFor = (other: string) =>
    (clubs.data ?? []).map((club) => ({
      value: String(club.id),
      label: `${club.name} (${club.acronym})`,
      disabled: String(club.id) === other,
    }));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const next: Errors = {};
    if (!home) next.home = 'Escolha o mandante.';
    if (!away) next.away = 'Escolha o visitante.';
    else if (away === home) next.away = 'Escolha dois clubes diferentes.';
    setErrors(next);
    if (next.home || next.away) return;

    play.mutate(
      { home_club_id: Number(home), away_club_id: Number(away) },
      {
        onSuccess: (match) => {
          toast.success('Partida jogada', {
            description: `${match.home.club_name} ${match.home.goals} × ${match.away.goals} ${match.away.club_name}. Placar e duelos devolvidos pela API.`,
          });
          onPlayed(match);
        },
      },
    );
  }

  // Enquanto o pedido está no ar, o diálogo não fecha: a partida ainda vai ser registrada.
  const close = () => {
    if (!play.isPending) onClose();
  };

  return (
    <Modal
      open
      onClose={close}
      size="md"
      title="Nova partida"
      description="Escolha o mandante e o visitante."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {apiError && (
          <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Não foi possível jogar a partida</AlertTitle>
            <AlertDescription className="text-destructive/90">{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Mandante"
            placeholder={clubs.isPending ? 'Carregando clubes…' : 'Escolha o mandante'}
            options={optionsFor(away)}
            value={home}
            error={errors.home}
            onValueChange={(next) => {
              setHome(next);
              setErrors((current) => ({ ...current, home: undefined }));
            }}
          />
          <SelectField
            label="Visitante"
            placeholder={clubs.isPending ? 'Carregando clubes…' : 'Escolha o visitante'}
            options={optionsFor(home)}
            value={away}
            error={errors.away}
            onValueChange={(next) => {
              setAway(next);
              setErrors((current) => ({ ...current, away: undefined }));
            }}
          />
        </div>

        <section
          aria-label="Como o resultado é calculado"
          className="flex flex-col gap-2 rounded-xl border bg-muted/40 px-3 py-3 text-xs text-muted-foreground"
        >
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Info aria-hidden="true" className="size-4" />
            Como o resultado é calculado
          </h3>
          <p>
            Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais
            recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º
            enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible
            (ZAG e LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal
            condicionado joga com 15% a menos.
          </p>
        </section>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={play.isPending} onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={play.isPending}>
            {play.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="animate-spin" />
                Jogando…
              </>
            ) : (
              <>
                <Swords aria-hidden="true" />
                Jogar partida
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
