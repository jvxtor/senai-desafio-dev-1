import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { cn } from '../../lib/utils';
import type { Formation } from '../../services/types';
import { FORMATION_OPTIONS, SECTORS_TOP_DOWN, countInSector, describeFormation } from './lineup';

interface FormationPickerProps {
  value: Formation | '';
  onChange: (formation: Formation) => void;
}

// Um mini campo com os pontos de cada setor, para reconhecer a formação de relance.
function FormationIcon({ formation }: { formation: Formation }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-10 shrink-0 flex-col justify-between rounded-md bg-emerald-800 px-1 py-1.5"
    >
      {SECTORS_TOP_DOWN.filter((sector) => countInSector(formation, sector) > 0).map((sector) => (
        <span key={sector} className="flex justify-evenly">
          {Array.from({ length: countInSector(formation, sector) }, (_, index) => (
            <span key={index} className="size-1.5 rounded-full bg-white" />
          ))}
        </span>
      ))}
    </span>
  );
}

export function FormationPicker({ value, onChange }: FormationPickerProps) {
  return (
    <RadioGroup
      aria-label="Formação"
      value={value}
      onValueChange={(next) => onChange(next as Formation)}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {FORMATION_OPTIONS.map(({ value: formation }) => (
        <label
          key={formation}
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40',
            'has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5 has-[[data-checked]]:ring-1 has-[[data-checked]]:ring-primary',
          )}
        >
          <FormationIcon formation={formation} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <RadioGroupItem value={formation} />
              <span className="text-sm font-semibold">{formation}</span>
            </span>
            <span className="text-xs text-muted-foreground">{describeFormation(formation)}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
