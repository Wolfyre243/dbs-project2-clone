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
  value,
  onValueChange,
}: {
  className?: string;
  placeholder?: string;
  label?: string;
  fieldName: string;
  required?: boolean;
  value?: string;
  onValueChange?: (val: string) => void;
}) {
  // TODO: Fetch language options from backend
  const [internalValue, setInternalValue] = useState<string>('');

  const controlled = value !== undefined && onValueChange !== undefined;
  const selectValue = controlled ? value : internalValue;
  const selectOnChange = controlled ? onValueChange : setInternalValue;

  return (
    <>
      <Select value={selectValue} onValueChange={selectOnChange}>
        <SelectTrigger className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder ?? 'Select a Language'} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label ?? 'Language'}</SelectLabel>
            <SelectItem value='en-GB'>English</SelectItem>
            <SelectItem value='cmn-CN'>Chinese</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <input
        type='hidden'
        name={fieldName}
        value={selectValue}
        required={required}
      />
    </>
  );
}
