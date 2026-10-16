import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TextField } from '../forms/fields';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface RangeFilterProps {
  /** Nome do filtro. Sem faixa o botão mostra só ele; com faixa, "Nome: 18 a 30". */
  label: string;
  /** Texto mais completo, como "Valor de mercado", para a dica do botão. */
  title?: string;
  icon: LucideIcon;
  /** A faixa que está valendo, já escrita ("18 a 30"). Vazio quando não há faixa. */
  summary: string | null;
  error?: string;
  minLabel: string;
  maxLabel: string;
  minValue: string;
  maxValue: string;
  inputMode: 'numeric' | 'decimal';
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onClear: () => void;
}

// Filtro de faixa (mínimo e máximo) que abre num popover; o botão já mostra a faixa aplicada.
export function RangeFilter(props: RangeFilterProps) {
  const { label, title, icon: Icon, summary, error, minLabel, maxLabel } = props;
  const { minValue, maxValue, inputMode, onMinChange, onMaxChange, onClear } = props;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            title={title}
            aria-invalid={error ? true : undefined}
            className={cn(
              'h-9 gap-2 px-3 font-normal',
              !summary && 'text-muted-foreground',
              error && 'border-destructive',
            )}
          />
        }
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {summary ? `${label}: ${summary}` : label}
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="grid grid-cols-2 gap-2">
          <TextField
            label={minLabel}
            hideLabel
            inputMode={inputMode}
            placeholder="Mín."
            value={minValue}
            onChange={(event) => onMinChange(event.target.value)}
          />
          <TextField
            label={maxLabel}
            hideLabel
            inputMode={inputMode}
            placeholder="Máx."
            value={maxValue}
            onChange={(event) => onMaxChange(event.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <Button variant="ghost" size="sm" className="self-end" onClick={onClear}>
          Limpar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
