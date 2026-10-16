import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { FormError, SelectField } from '../../components/forms/fields';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useSetLineup } from '../../hooks/lineup';
import { getErrorMessage } from '../../lib/errors';
import type { Formation, Lineup, SquadPlayer } from '../../services/types';
import { FORMATION_OPTIONS, SECTOR_POSITIONS, prefillPicks, slotsOf } from './lineup';

interface LineupDialogProps {
  clubId: number;
  squad: SquadPlayer[];
  /** A escalação de hoje: a formação e os titulares já vêm escolhidos. */
  lineup: Lineup | undefined;
  onClose: () => void;
}

export function LineupDialog({ clubId, squad, lineup, onClose }: LineupDialogProps) {
  const save = useSetLineup();
  const starters = lineup?.players ?? [];

  const [formation, setFormation] = useState<Formation | ''>(lineup?.formation ?? '');
  const [picks, setPicks] = useState<string[]>(() =>
    lineup?.formation ? prefillPicks(lineup.formation, starters) : [],
  );
  const [errors, setErrors] = useState<{ formation?: string; picks: boolean[] }>({ picks: [] });

  const slots = formation ? slotsOf(formation) : [];
  const apiError = save.error ? getErrorMessage(save.error) : null;

  function changeFormation(next: string) {
    const value = next as Formation | '';
    setFormation(value);
    setPicks(value ? prefillPicks(value, starters) : []);
    setErrors({ picks: [] });
  }

  function changePick(index: number, value: string) {
    setPicks((current) => current.map((pick, position) => (position === index ? value : pick)));
    setErrors((current) => ({
      ...current,
      picks: current.picks.map((missing, position) => (position === index ? false : missing)),
    }));
  }

  // Doente não joga, e o mesmo jogador não ocupa duas vagas.
  function optionsFor(index: number) {
    const allowed = SECTOR_POSITIONS[slots[index].sector];
    const takenElsewhere = new Set(picks.filter((_, position) => position !== index));

    return squad
      .filter(
        (player) =>
          allowed.includes(player.position) &&
          player.condition !== 'DOENTE' &&
          !takenElsewhere.has(String(player.id)),
      )
      .map((player) => ({
        value: String(player.id),
        label: `${player.name} · ${player.position} · overall ${player.overall}`,
      }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const missing = slots.map((_, index) => !picks[index]);
    setErrors({
      formation: formation ? undefined : 'Escolha a formação.',
      picks: missing,
    });
    if (!formation || missing.some(Boolean)) return;

    save.mutate(
      { clubId, input: { formation, player_ids: picks.map(Number) } },
      {
        onSuccess: () => {
          toast.success('Escalação salva.');
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Escalação"
      description="Escolha a formação e um titular para cada uma das 5 vagas."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          label="Formação"
          placeholder="Escolha a formação"
          hint="Defesa, meio-campo e ataque: 2-1-1 tem 2 defensores, 1 meia e 1 atacante."
          options={FORMATION_OPTIONS}
          value={formation}
          error={errors.formation}
          onValueChange={changeFormation}
        />

        {formation && (
          <fieldset className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <legend className="px-1 text-sm font-medium">Titulares</legend>
            {slots.map((slot, index) => (
              <SelectField
                key={`${formation}-${index}`}
                label={slot.label}
                placeholder="Escolha o titular"
                options={optionsFor(index)}
                value={picks[index] ?? ''}
                error={errors.picks[index] ? 'Escolha o titular desta vaga.' : undefined}
                onValueChange={(next) => changePick(index, next)}
              />
            ))}
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Jogadores doentes não podem ser escalados, e a defesa aceita zagueiros e laterais.
            </p>
          </fieldset>
        )}

        {apiError && <FormError message={apiError} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={save.isPending}>
            Salvar escalação
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
