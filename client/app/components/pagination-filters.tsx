import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
export function PaginationFilterDropdown({
  filterTitle,
  filterOptionList,
  valueAccessor,
  nameAccessor,
  selectedValue,
  setSelectedValue,
  placeholder,
}: {
  filterTitle: String;
  filterOptionList: { [key: string]: string }[];
  valueAccessor: string;
  nameAccessor: string;
  selectedValue: string;
  setSelectedValue: any;
  placeholder?: string;
}) {
  return (
    <Select value={selectedValue} onValueChange={setSelectedValue}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder={placeholder ?? 'Filter'} />
      </SelectTrigger>
      <SelectContent className='max-h-[200px] overflow-y-auto'>
        <SelectGroup>
          <SelectLabel>{filterTitle}</SelectLabel>
          {filterOptionList?.map((option, i) => {
            return (
              <SelectItem value={option[valueAccessor] ?? option} key={i}>
                {option[nameAccessor] ?? option}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
