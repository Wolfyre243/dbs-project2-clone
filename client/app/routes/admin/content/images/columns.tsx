import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
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

export type Image = {
  imageId: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  statusId: number;
  fileLink: string;
  fileName: string;
};

export const columns: ColumnDef<Image>[] = [
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
    accessorKey: 'imageId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image ID' />
    ),
    cell: ({ row }) => {
      const value = row.original.imageId;
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
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status ID' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const image = row.original;

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
                onClick={() =>
                  navigator.clipboard.writeText(image.imageId.toString())
                }
              >
                Copy Image ID
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem>View image</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <div className='max-h-96 overflow-y-auto p-4 border-2 rounded-lg'>
              <img
                src={image.fileLink}
                alt={image.fileName}
                className='max-w-full h-auto object-contain'
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
