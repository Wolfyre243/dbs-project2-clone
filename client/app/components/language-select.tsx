import { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import useApiPrivate from '~/hooks/useApiPrivate';
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
  const [internalValue, setInternalValue] = useState<string>('');
  const [languages, setLanguages] = useState<
    { languageCode: string; languageName: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: responseData } = await apiPrivate.get('/language/name');
        setLanguages(responseData.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiPrivate]);

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
          <SelectGroup className='max-h-60 overflow-y-scroll'>
            <SelectLabel>{label ?? 'Language'}</SelectLabel>
            {loading ? (
              <SelectLabel>Loading</SelectLabel>
            ) : (
              languages.map((lang, i) => (
                <SelectItem key={i} value={lang.languageCode}>
                  {lang.languageName}
                </SelectItem>
              ))
            )}
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
