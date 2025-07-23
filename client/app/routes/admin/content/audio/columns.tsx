import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

export type Audio = {
  audioId: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  statusId: number;
  fileLink: string;
  fileName: string;
  languageCode: string;
};

export const columns: ColumnDef<Audio>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'audioId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Audio ID' />
    ),
    cell: ({ row }) => {
      const value = row.original.audioId;
      return value.length > 8 ? value.slice(0, 8) + '...' : value;
    },
  },
  {
    accessorKey: 'fileName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='File Name' />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created By' />
    ),
    cell: ({ row }) => {
      const value = row.original.createdBy;
      return value.length > 8 ? value.slice(0, 8) + '...' : value;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const value = row.original.createdAt;
      if (!value) return '';
      const date = typeof value === 'string' ? new Date(value) : value;
      return date.toLocaleString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    accessorKey: 'languageCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Language Code' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const audio = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(audio.audioId.toString())
              }
            >
              Copy Audio ID
            </DropdownMenuItem>
            {/* TODO Turn into redirect buttons */}
            <DropdownMenuItem>View audio</DropdownMenuItem>
            <DropdownMenuItem>View activity</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
