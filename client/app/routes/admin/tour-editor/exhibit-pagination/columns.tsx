import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Link } from 'react-router';
import { toast } from 'sonner';

export type Exhibit = {
  exhibitId: string;
  title: string;
  description: string;
  createdAt: string;
  image: string | null;
  status: string;
  exhibitCreatedBy: string;
  supportedLanguages: string[];
};

export const columns: ColumnDef<Exhibit>[] = [
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
    accessorKey: 'exhibitId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Exhibit ID' />
    ),
    cell: ({ row }) => {
      const value = row.original.exhibitId;
      return value.length > 8 ? value.slice(0, 8) + '...' : value;
    },
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const value = row.original.title;
      return value.length > 20 ? value.slice(0, 20) + '...' : value;
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const value = row.original.description;
      return value?.length > 30 ? value.slice(0, 30) + '...' : value;
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
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const value = row.original.status;
      return (
        <span
          className={value === 'Active' ? 'text-green-600' : 'text-red-600'}
        >
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: 'exhibitCreatedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created By' />
    ),
    cell: ({ row }) => {
      const value = row.original.exhibitCreatedBy;
      return value.length > 12 ? value.slice(0, 12) + '...' : value;
    },
  },
  {
    accessorKey: 'supportedLanguages',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Languages' />
    ),
    cell: ({ row }) => {
      const value = row.original.supportedLanguages;
      return Array.isArray(value) ? (
        <div className='flex flex-wrap gap-1'>
          {value.map((lang: string) => (
            <Badge key={lang} variant='secondary'>
              {lang}
            </Badge>
          ))}
        </div>
      ) : (
        ''
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const exhibit = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => {
                toast.success('Copied to clipboard', {
                  duration: 2000,
                });
                navigator.clipboard.writeText(exhibit.exhibitId.toString());
              }}
            >
              Copy Exhibit ID
            </DropdownMenuItem>
            {/* TODO Turn into redirect buttons */}
            <DropdownMenuItem>
              <Link to={`/admin/tour-editor/view-exhibit/${exhibit.exhibitId}`}>
                View Exhibit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
