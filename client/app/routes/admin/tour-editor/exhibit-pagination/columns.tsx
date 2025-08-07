import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Checkbox } from '~/components/ui/checkbox';
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header';
import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Link } from 'react-router';
import useApiPrivate from '~/hooks/useApiPrivate';
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';

// Define meta type for TanStack Table
interface TableMeta {
  onDelete?: (exhibitId: string) => void;
}

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

export const columns: ColumnDef<Exhibit, any>[] = [
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
      return value?.length ? value.slice(0, 30) + '...' : value;
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
        <Badge
          style={{
            backgroundColor: value === 'Active' ? '#16a34a' : '#dc2626',
            color: 'white',
          }}
        >
          {value}
        </Badge>
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
    cell: ({ row, table }) => {
      const exhibit = row.original;
      const apiPrivate = useApiPrivate();

      const [showConfirm, setShowConfirm] = useState(false);

      const handleDelete = async () => {
        try {
          const response = await apiPrivate.delete(
            `/exhibit/${exhibit.exhibitId}`,
          );
          if (response.status === 200) {
            toast.success('Exhibit deleted successfully!', {
              duration: 2000,
            });
            // Trigger table data refresh
            (table.options.meta as TableMeta)?.onDelete?.(exhibit.exhibitId);
          }
        } catch (error) {
          if (isAxiosError(error)) {
            toast.error(
              error.response?.data.message || 'Failed to delete exhibit',
              {
                duration: 2000,
              },
            );
          } else {
            toast.error('An unexpected error occurred', {
              duration: 2000,
            });
          }
        }
        setShowConfirm(false);
      };

      return (
        <Dialog>
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
              <DropdownMenuItem>
                <Link
                  to={`/admin/tour-editor/view-exhibit/${exhibit.exhibitId}`}
                >
                  View Exhibit
                </Link>
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <span className='text-red-400'>Delete Exhibit</span>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hold Up!</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this exhibit? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='flex gap-2 justify-end'>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button variant='destructive' onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
