import { useState } from 'react';
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
  required = false,
}: {
  className?: string;
  placeholder?: string;
  label?: string;
  fieldName: string;
  required?: boolean;
}) {
  // TODO: Fetch language options from backend
  const [value, setValue] = useState<string>('');

  return (
    <>
      <Select value={value} onValueChange={setValue}>
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
      <input type='hidden' name={fieldName} value={value} required={required} />
    </>
  );
}
