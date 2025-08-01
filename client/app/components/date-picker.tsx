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
  return date.toLocaleDateString('en-US', {
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
  onChange,
}: {
  fieldName: string;
  label?: string;
  required?: boolean;
  onChange?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date('2025-06-01'));
  const [month, setMonth] = useState<Date | undefined>(date);
  const [value, setValue] = useState(formatDate(date));

  const handleChange = (val: string) => {
    setValue(val);
    if (isValidDate(new Date(val))) {
      setDate(new Date(val));
      setMonth(new Date(val));
      if (onChange) onChange(val);
    }
  };

  return (
    <div className='flex flex-col gap-3'>
      <Label htmlFor={fieldName} className='px-1'>
        {label ?? 'Date'}
      </Label>
      <div className='relative flex gap-2'>
        <Input
          id={fieldName}
          name={fieldName}
          value={value}
          placeholder='June 01, 2025'
          className='bg-background pr-10'
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          required={required}
        />
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
              selected={date}
              captionLayout='dropdown'
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date);
                const formatted = formatDate(date);
                setValue(formatted);
                setOpen(false);
                if (onChange) onChange(formatted);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
