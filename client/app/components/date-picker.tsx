import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }
  return date.toLocaleDateString('en-SG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DatePicker({
  fieldName,
  label,
  required = true,
  value,
  onValueChange,
  onChange,
}: {
  fieldName: string;
  label?: string;
  required?: boolean;
  value?: string | null;
  onValueChange?: (val: string) => void;
  onChange?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [internalValue, setInternalValue] = useState<string>('');
  const controlled = value !== undefined;
  const inputValue = controlled ? value : internalValue;
  const inputOnChange = (val: string | null) => {
    setInternalValue(val ?? '');
    if (onChange) onChange(val ?? '');
  };

  const handleChange = (val: string) => {
    if (controlled) {
      inputOnChange(val);
    } else {
      setInternalValue(val);
      if (!val) {
        setDate(null);
        setMonth(null);
        if (onChange) onChange('');
      } else if (isValidDate(new Date(val))) {
        setDate(new Date(val));
        setMonth(new Date(val));
        if (onChange) onChange(val);
      }
    }
  };

  return (
    <div className='flex flex-col'>
      <Label htmlFor={fieldName} className='px-1'>
        {label ?? 'Date'}
      </Label>
      <div className='relative flex gap-2 items-center'>
        <Input
          id={fieldName}
          name={fieldName}
          value={
            inputValue && isValidDate(new Date(inputValue))
              ? new Date(inputValue).toLocaleDateString('en-SG', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : ''
          }
          placeholder='Select a Date'
          className='bg-background pr-10 border-primary/50'
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          required={required}
        />
        {inputValue && (
          <Button
            variant='ghost'
            type='button'
            className='absolute top-1/2 right-8 size-6 -translate-y-1/2'
            onClick={() => {
              if (controlled) {
                onValueChange && onValueChange('');
              } else {
                setInternalValue('');
                setDate(null);
                setMonth(null);
                if (onChange) onChange('');
              }
            }}
            tabIndex={0}
            aria-label='Clear date'
          >
            {/* Simple X icon for clear */}
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <path
                d='M4 4L12 12M12 4L4 12'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </Button>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id='date-picker'
              variant='ghost'
              className='absolute top-1/2 right-2 size-6 -translate-y-1/2'
            >
              <CalendarIcon className='size-3.5' />
              <span className='sr-only'>Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='w-auto overflow-hidden p-0'
            align='end'
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode='single'
              selected={date ?? undefined}
              captionLayout='dropdown'
              month={month ?? undefined}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date ?? null);
                const formatted = formatDate(date ?? undefined);
                if (controlled) {
                  onValueChange && onValueChange(formatted);
                } else {
                  setInternalValue(formatted);
                  if (onChange) onChange(formatted);
                }
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
