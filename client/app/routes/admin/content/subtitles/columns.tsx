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

export type Subtitle = {
  subtitleId: string;
  subtitleText: string;
  languageCode: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: Date;
  modifiedAt: Date;
  statusId: number;
};

export const columns: ColumnDef<Subtitle>[] = [
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
    accessorKey: 'subtitleId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subtitle ID' />
    ),
    cell: ({ row }) => {
      const value = row.original.subtitleId;
      return value.length > 8 ? value.slice(0, 8) + '...' : value;
    },
  },
  {
    accessorKey: 'subtitleText',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subtitle Text' />
    ),
  },
  {
    accessorKey: 'languageCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Language Code' />
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
    accessorKey: 'modifiedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Modified By' />
    ),
    cell: ({ row }) => {
      const value = row.original.modifiedBy;
      return value?.length > 8 ? value.slice(0, 8) + '...' : value;
    },
  },
  {
    accessorKey: 'modifiedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Modified At' />
    ),
    cell: ({ row }) => {
      const value = row.original.modifiedAt;
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
    id: 'actions',
    cell: ({ row }) => {
      const subtitle = row.original;

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
                navigator.clipboard.writeText(subtitle.subtitleId.toString())
              }
            >
              Copy Subtitle ID
            </DropdownMenuItem>
            {/* TODO Turn into redirect buttons */}
            <DropdownMenuItem>View subtitle</DropdownMenuItem>
            <DropdownMenuItem>View activity</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
