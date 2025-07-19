import { cn } from '~/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

export function LanguageSelect({
  className,
  placeholder,
  label,
  fieldName,
}: {
  className?: string;
  placeholder?: string;
  label?: string;
  fieldName: string;
}) {
  // TODO: Fetch language options from backend

  return (
    <Select name={fieldName}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder ?? 'Select a Language'} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label ?? 'Language'}</SelectLabel>
          <SelectItem value='eng'>English</SelectItem>
          <SelectItem value='zho'>Chinese</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
