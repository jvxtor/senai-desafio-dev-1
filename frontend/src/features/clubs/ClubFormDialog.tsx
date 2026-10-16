import { CircleAlert, Shield, Wallet } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { TextField } from '../../components/forms/fields';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useCreateClub } from '../../hooks/clubs';
import { getErrorMessage } from '../../lib/errors';
import { formatMoney } from '../../lib/format';
import type { Club } from '../../services/types';
import { suggestAcronym } from './acronym';
import { INITIAL_CASH } from './labels';
import {
  EMPTY_CLUB_FORM,
  fieldsOfApiConflict,
  toAcronymInput,
  toCreateInput,
  validateClubForm,
  type ClubConflict,
  type ClubField,
  type ClubFormErrors,
  type ClubFormValues,
} from './validation';

interface ClubFormDialogProps {
  /** Clubes já cadastrados, para avisar de nome ou sigla repetidos antes de enviar. */
  clubs: Club[];
  onClose: () => void;
}

export function ClubFormDialog({ clubs, onClose }: ClubFormDialogProps) {
  const create = useCreateClub();
  const [values, setValues] = useState<ClubFormValues>(EMPTY_CLUB_FORM);
  const [errors, setErrors] = useState<ClubFormErrors>({});
  const [conflict, setConflict] = useState<ClubConflict | null>(null);
  // Enquanto a sigla não for escrita à mão, ela acompanha o nome.
  const [acronymManual, setAcronymManual] = useState(false);

  const taken = clubs.map((club) => club.acronym);
  const suggestion = suggestAcronym(values.name, taken);

  // A recusa da API (por exemplo, quando a lista estava desatualizada) usa o mesmo alerta.
  const apiMessage = create.error ? getErrorMessage(create.error) : null;
  const shown: ClubConflict | null =
    conflict ??
    (apiMessage ? { messages: [apiMessage], fields: fieldsOfApiConflict(apiMessage) } : null);

  // Mexer no campo apontado pelo alerta tira o alerta.
  function dismissConflictOn(...fields: ClubField[]) {
    if (shown?.fields.some((field) => fields.includes(field))) {
      setConflict(null);
      create.reset();
    }
  }

  function setAcronym(value: string) {
    setValues((current) => ({ ...current, acronym: value }));
    setErrors((current) => ({ ...current, acronym: undefined }));
    dismissConflictOn('acronym');
  }

  function handleName(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;
    setValues((current) => ({
      ...current,
      name,
      acronym: acronymManual ? current.acronym : suggestAcronym(name, taken),
    }));
    setErrors((current) => ({
      ...current,
      name: undefined,
      acronym: acronymManual ? current.acronym : undefined,
    }));
    dismissConflictOn('name', ...(acronymManual ? [] : (['acronym'] as ClubField[])));
  }

  // Escrever na sigla desliga a sugestão; esvaziar o campo liga de novo.
  function handleAcronym(event: ChangeEvent<HTMLInputElement>) {
    const acronym = toAcronymInput(event.target.value);
    const manual = acronym !== '';
    setAcronymManual(manual);
    setAcronym(manual ? acronym : suggestion);
  }

  function applySuggestion() {
    setAcronymManual(false);
    setAcronym(suggestion);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = validateClubForm(values, clubs);
    setErrors(result.errors);
    setConflict(result.conflict ?? null);
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
      description="Informe o nome e a sigla do clube."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {shown && (
          <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Não foi possível criar o clube</AlertTitle>
            <AlertDescription className="text-destructive/90">
              {shown.messages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <TextField
          label="Nome"
          icon={Shield}
          autoFocus
          autoComplete="off"
          hint="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
          value={values.name}
          error={errors.name}
          invalid={shown?.fields.includes('name')}
          onChange={handleName}
        />
        <TextField
          label="Sigla"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={3}
          hint={
            acronymManual
              ? 'Escrita por você. 3 letras de A a Z que aparecem no nome nessa ordem; a primeira é a primeira letra do nome.'
              : 'Sugerida pelo nome, e você pode editar. 3 letras de A a Z que aparecem no nome nessa ordem; a primeira é a primeira letra do nome.'
          }
          value={values.acronym}
          error={errors.acronym}
          invalid={shown?.fields.includes('acronym')}
          onChange={handleAcronym}
        />

        {acronymManual && suggestion !== '' && suggestion !== values.acronym && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="-mt-2 h-auto self-start p-0"
            onClick={applySuggestion}
          >
            Usar sugestão: {suggestion}
          </Button>
        )}

        <p className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
          <Wallet aria-hidden="true" className="size-4 shrink-0" />O clube começa com{' '}
          {formatMoney(INITIAL_CASH)} em caixa e sem jogadores.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={create.isPending}>
            Criar clube
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
