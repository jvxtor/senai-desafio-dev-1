import { useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { FormError, TextField } from '../../components/forms/fields';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useCreateClub } from '../../hooks/clubs';
import { getErrorMessage } from '../../lib/errors';
import {
  EMPTY_CLUB_FORM,
  toAcronymInput,
  toCreateInput,
  validateClubForm,
  type ClubFormErrors,
  type ClubFormValues,
} from './validation';

interface ClubFormDialogProps {
  onClose: () => void;
}

export function ClubFormDialog({ onClose }: ClubFormDialogProps) {
  const create = useCreateClub();
  const [values, setValues] = useState<ClubFormValues>(EMPTY_CLUB_FORM);
  const [errors, setErrors] = useState<ClubFormErrors>({});

  const apiError = create.error ? getErrorMessage(create.error) : null;

  function setField(field: keyof ClubFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  const handleName = (event: ChangeEvent<HTMLInputElement>) => setField('name', event.target.value);
  const handleAcronym = (event: ChangeEvent<HTMLInputElement>) =>
    setField('acronym', toAcronymInput(event.target.value));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = validateClubForm(values);
    setErrors(result.errors);
    if (!result.isValid) return;

    create.mutate(toCreateInput(values), {
      onSuccess: (created) => {
        toast.success(`${created.name} entrou na liga.`);
        onClose();
      },
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Novo clube"
      description="O clube nasce com o caixa inicial e sem jogadores no elenco."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nome"
          autoFocus
          autoComplete="off"
          hint="De 2 a 5 palavras, só com letras, espaços, hífen e ponto."
          value={values.name}
          error={errors.name}
          onChange={handleName}
        />
        <TextField
          label="Sigla"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={3}
          hint="3 letras do nome, na ordem, começando pela primeira. Ex.: AGU para Águias FC."
          value={values.acronym}
          error={errors.acronym}
          onChange={handleAcronym}
        />

        {apiError && <FormError message={apiError} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={create.isPending}>
            Cadastrar clube
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
