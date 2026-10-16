import { CalendarIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { ptBR } from 'react-day-picker/locale';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { describedBy } from './field-utils';
import { FieldFrame, type FieldProps } from './fields';

interface DateTimeFieldProps extends Omit<FieldProps, 'hideLabel'> {
  /** "AAAA-MM-DDTHH:MM", o mesmo formato do <input type="datetime-local">. Vazio quando não há escolha. */
  value: string;
  onChange: (value: string) => void;
}

const DEFAULT_TIME = '12:00';

function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplay(date: string, time: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
}

export function DateTimeField(props: DateTimeFieldProps) {
  const { label, error, hint, className, value, onChange } = props;
  const id = useId();
  const [open, setOpen] = useState(false);
  // Dias anteriores a hoje ficam desativados: o fim da fidelidade precisa ser no futuro.
  const [today] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const [datePart = '', timePart = ''] = value ? value.split('T') : [];
  const selected = datePart ? fromDateKey(datePart) : undefined;

  return (
    <FieldFrame id={id} label={label} error={error} hint={hint} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(id, error, hint)}
              className={cn(
                'h-9 w-full justify-start px-2.5 font-normal',
                !datePart && 'text-muted-foreground',
              )}
            />
          }
        >
          <CalendarIcon aria-hidden="true" />
          {datePart ? formatDisplay(datePart, timePart) : 'Escolha a data e a hora'}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selected}
            defaultMonth={selected ?? today}
            disabled={{ before: today }}
            onSelect={(date) => {
              if (date) onChange(`${toDateKey(date)}T${timePart || DEFAULT_TIME}`);
            }}
          />
          <div className="flex items-center gap-3 border-t p-3">
            <Label htmlFor={`${id}-time`}>Hora</Label>
            <Input
              id={`${id}-time`}
              type="time"
              className="h-9 w-32"
              disabled={!datePart}
              value={timePart}
              onChange={(event) => {
                if (event.target.value) onChange(`${datePart}T${event.target.value}`);
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </FieldFrame>
  );
}
