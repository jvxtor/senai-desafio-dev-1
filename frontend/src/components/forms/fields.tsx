import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { describedBy } from './field-utils';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  /** Esconde o rótulo na tela, mas mantém para leitores de tela. */
  hideLabel?: boolean;
  className?: string;
}

export interface FrameProps extends FieldProps {
  id: string;
  children: ReactNode;
}

export function FieldFrame({ id, label, error, hint, hideLabel, className, children }: FrameProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-1.5'}>
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type TextFieldProps = FieldProps & Omit<ComponentProps<'input'>, 'className' | 'id'>;

export function TextField(props: TextFieldProps) {
  const { label, error, hint, hideLabel, className, ...input } = props;
  const id = useId();

  return (
    <FieldFrame
      id={id}
      label={label}
      error={error}
      hint={hint}
      hideLabel={hideLabel}
      className={className}
    >
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="h-9"
        {...input}
      />
    </FieldFrame>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends FieldProps {
  options: SelectOption[];
  /** Valor escolhido. Texto vazio quer dizer "nenhum". */
  value: string;
  onValueChange: (value: string) => void;
  /** Texto da opção que limpa a escolha. Sem ele, não há opção vazia. */
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField(props: SelectFieldProps) {
  const { label, error, hint, hideLabel, className, options, placeholder } = props;
  const { value, onValueChange, disabled } = props;
  const id = useId();

  const hasEmptyOption = placeholder !== undefined;
  const items: SelectOption[] = hasEmptyOption
    ? [{ value: '', label: placeholder }, ...options]
    : options;

  return (
    <FieldFrame
      id={id}
      label={label}
      error={error}
      hint={hint}
      hideLabel={hideLabel}
      className={className}
    >
      <Select
        value={value}
        items={items}
        disabled={disabled}
        onValueChange={(next) => onValueChange(next ?? '')}
      >
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn('h-9 w-full', hasEmptyOption && value === '' && 'text-muted-foreground')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldFrame>
  );
}

/** Mensagem de recusa da API, mostrada dentro do formulário ou do diálogo. */
export function FormError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
