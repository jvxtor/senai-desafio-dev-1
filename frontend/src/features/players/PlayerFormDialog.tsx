import { useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { FormError, SelectField, TextField } from '../../components/forms/fields';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useCreatePlayer, useUpdatePlayer } from '../../hooks/players';
import { formatMoney } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import type { Player } from '../../services/types';
import { AttributePreview } from './AttributePreview';
import { POSITION_OPTIONS } from './labels';
import {
  EMPTY_PLAYER_FORM,
  toCreateInput,
  toUpdateInput,
  validatePlayerForm,
  type PlayerFormErrors,
  type PlayerFormValues,
} from './validation';

interface PlayerFormDialogProps {
  /** Com um jogador, o formulário edita. Sem ele, cadastra. */
  player?: Player;
  onClose: () => void;
}

type Field = keyof PlayerFormValues;

const ATTRIBUTES: { field: Field; label: string }[] = [
  { field: 'pace', label: 'Velocidade' },
  { field: 'shooting', label: 'Finalização' },
  { field: 'passing', label: 'Passe' },
  { field: 'dribbling', label: 'Drible' },
  { field: 'defending', label: 'Defesa' },
  { field: 'physical', label: 'Físico' },
  { field: 'potential', label: 'Potencial' },
];

// O título fica dentro do cartão, alinhado ao da prévia; a legenda é só para leitores de tela.
function BlockTitle({ children }: { children: string }) {
  return (
    <>
      <legend className="sr-only">{children}</legend>
      <p aria-hidden="true" className="text-sm font-medium text-muted-foreground">
        {children}
      </p>
    </>
  );
}

function toFormValues(player?: Player): PlayerFormValues {
  if (!player) return EMPTY_PLAYER_FORM;

  return {
    ...EMPTY_PLAYER_FORM,
    name: player.name,
    position: player.position,
    agility: String(player.agility),
    age: String(player.age),
  };
}

export function PlayerFormDialog({ player, onClose }: PlayerFormDialogProps) {
  const isEdit = player !== undefined;
  const create = useCreatePlayer();
  const update = useUpdatePlayer();
  const mutation = isEdit ? update : create;

  const [values, setValues] = useState(() => toFormValues(player));
  const [errors, setErrors] = useState<PlayerFormErrors>({});

  const hasClub = player?.club_id != null;
  const apiError = mutation.error ? getErrorMessage(mutation.error) : null;

  function setField(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  const handleChange = (field: Field) => (event: ChangeEvent<HTMLInputElement>) =>
    setField(field, event.target.value);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = validatePlayerForm(values, isEdit ? 'edit' : 'create');
    setErrors(result.errors);
    if (!result.isValid) return;

    if (player) {
      update.mutate(
        { id: player.id, input: toUpdateInput(values) },
        {
          onSuccess: () => {
            toast.success('Jogador atualizado.');
            onClose();
          },
        },
      );
      return;
    }

    create.mutate(toCreateInput(values), {
      onSuccess: (created) => {
        toast.success(
          `Jogador cadastrado. Overall ${created.overall} e valor base ${formatMoney(created.base_value)}.`,
        );
        onClose();
      },
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      size={isEdit ? 'md' : 'xl'}
      title={isEdit ? 'Editar jogador' : 'Novo jogador'}
      description={
        isEdit
          ? 'Muda o nome, a posição, a agilidade e a idade. Os indicadores ficam como no cadastro.'
          : 'O valor base e o overall são calculados depois de salvar.'
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          className={
            isEdit
              ? 'contents'
              : 'grid gap-4 md:grid-cols-2 lg:grid-cols-[15rem_minmax(0,1fr)_17rem]'
          }
        >
          <fieldset
            className={
              isEdit ? 'grid gap-4 sm:grid-cols-2' : 'flex flex-col gap-4 rounded-xl border p-4'
            }
          >
            {!isEdit && <BlockTitle>Dados do jogador</BlockTitle>}
            <TextField
              label="Nome"
              className="sm:col-span-2"
              autoFocus
              value={values.name}
              error={errors.name}
              onChange={handleChange('name')}
            />
            <SelectField
              label="Posição"
              placeholder="Escolha"
              options={POSITION_OPTIONS}
              disabled={hasClub}
              hint={hasClub ? 'Jogador com clube não muda de posição.' : undefined}
              value={values.position}
              error={errors.position}
              onValueChange={(next) => setField('position', next)}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Agilidade"
                inputMode="numeric"
                value={values.agility}
                error={errors.agility}
                onChange={handleChange('agility')}
              />
              <TextField
                label="Idade"
                inputMode="numeric"
                value={values.age}
                error={errors.age}
                onChange={handleChange('age')}
              />
            </div>
          </fieldset>

          {!isEdit && (
            <>
              <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
                <BlockTitle>Indicadores, de 1 a 99</BlockTitle>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {ATTRIBUTES.map(({ field, label }) => (
                    <TextField
                      key={field}
                      label={label}
                      inputMode="numeric"
                      value={values[field]}
                      error={errors[field]}
                      onChange={handleChange(field)}
                    />
                  ))}
                  <p className="col-span-2 self-end text-xs text-muted-foreground">
                    O potencial não pode ser menor que o maior indicador, e a soma dos seis
                    indicadores não passa de 480.
                  </p>
                </div>
              </fieldset>
              <div className="md:col-span-2 lg:col-span-1">
                <AttributePreview values={values} />
              </div>
            </>
          )}
        </div>

        {apiError && <FormError message={apiError} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {isEdit ? 'Salvar alterações' : 'Cadastrar jogador'}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
