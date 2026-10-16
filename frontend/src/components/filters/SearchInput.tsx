import { Search } from 'lucide-react';
import { useId, type ComponentProps } from 'react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type SearchInputProps = Omit<ComponentProps<'input'>, 'id' | 'type'> & {
  /** Nome do campo para leitores de tela, como "Buscar por nome". */
  label: string;
};

export function SearchInput({ label, className, ...input }: SearchInputProps) {
  const id = useId();

  return (
    <div className={cn('relative', className)}>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input id={id} type="search" placeholder={label} className="h-9 pl-9" {...input} />
    </div>
  );
}
