import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SelectOption } from '../forms/fields';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

interface FilterSelectProps {
  /** Nome do filtro. Sem escolha o botão mostra só ele; com escolha, "Nome: opção". */
  label: string;
  icon: LucideIcon;
  options: SelectOption[];
  /** Valor escolhido. Texto vazio quer dizer "sem filtro". */
  value: string;
  /** Texto do botão sem escolha, no lugar do nome do filtro (ex.: "Jogador: todos"). */
  emptyText?: string;
  /** Texto da opção que remove o filtro, como "Todas as posições". */
  clearLabel: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  /** Estilo extra do botão, para encaixar o filtro em outras telas. */
  className?: string;
  /** Explica por que o filtro está desativado, ao passar o mouse. */
  disabledReason?: string;
}

// Um filtro em forma de botão: o valor escolhido aparece dentro dele, sem precisar abrir a lista.
export function FilterSelect(props: FilterSelectProps) {
  const { label, icon: Icon, options, value, clearLabel, disabled, disabledReason } = props;
  const { className } = props;
  const items: SelectOption[] = [{ value: '', label: clearLabel }, ...options];
  const chosen = options.find((option) => option.value === value);
  const text = chosen ? `${label}: ${chosen.label}` : (props.emptyText ?? label);

  return (
    <Select
      value={value}
      items={items}
      disabled={disabled}
      onValueChange={(next) => props.onValueChange(next ?? '')}
    >
      <SelectTrigger
        aria-label={text}
        title={disabled ? disabledReason : undefined}
        className={cn(
          'w-fit gap-2 px-3 data-[size=default]:h-9',
          !chosen && 'text-muted-foreground',
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span>{text}</span>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" className="min-w-52">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
