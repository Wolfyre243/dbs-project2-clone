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
import api from '~/services/api';

export function LanguageSelect({
  className,
  placeholder,
  label,
  fieldName,
  required = false,
  value,
  onValueChange,
  onChange,
  disabledLanguageCodes = [],
}: {
  className?: string;
  placeholder?: string;
  label?: string;
  fieldName: string;
  required?: boolean;
  value?: string;
  onChange?: any;
  onValueChange?: (val: string) => void;
  disabledLanguageCodes?: string[];
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
        const { data: responseData } = await api.get('/language/name');
        setLanguages(responseData.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

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
                <SelectItem
                  key={i}
                  value={lang.languageCode}
                  disabled={disabledLanguageCodes.includes(lang.languageCode)}
                >
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
        onChange={onChange}
      />
    </>
  );
}
