import { type ColumnDef } from '@tanstack/react-table';
import {
  Archive,
  Clipboard,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
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
import StatusCodes from '~/statusConfig';

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
  statusId: number;
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
            backgroundColor:
              value === 'Active'
                ? '#16a34a'
                : value === 'ARCHIVED'
                  ? '#6b7280'
                  : '#dc2626',
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
      const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
      const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
      const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
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
        setShowDeleteConfirm(false);
      };

      const handleArchive = async () => {
        try {
          const response = await apiPrivate.post(
            `/exhibit/${exhibit.exhibitId}/archive`,
          );
          if (response.status === 200) {
            toast.success('Exhibit archived successfully!', {
              duration: 2000,
            });
            // Trigger table data refresh
            (table.options.meta as TableMeta)?.onDelete?.(exhibit.exhibitId);
          }
        } catch (error) {
          if (isAxiosError(error)) {
            toast.error(
              error.response?.data.message || 'Failed to archive exhibit',
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
        setShowArchiveConfirm(false);
      };

      const handleUnarchive = async () => {
        if (exhibit.statusId !== StatusCodes.ARCHIVED) {
          toast.error('Exhibit is not archived.', { duration: 2000 });
          setShowUnarchiveConfirm(false);
          return;
        }
        try {
          const response = await apiPrivate.put(
            `/exhibit/${exhibit.exhibitId}/unarchive`,
          );
          if (response.status === 200) {
            toast.success('Exhibit unarchived successfully!', {
              duration: 2000,
            });
            // Trigger table data refresh
            (table.options.meta as TableMeta)?.onDelete?.(exhibit.exhibitId);
          }
        } catch (error) {
          if (isAxiosError(error)) {
            toast.error(
              error.response?.data.message || 'Failed to unarchive exhibit',
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
        setShowUnarchiveConfirm(false);
      };

      return (
        <>
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
                <Clipboard />
                <span>Copy Exhibit ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className='flex flex-row gap-2'
                  to={`/admin/tour-editor/view-exhibit/${exhibit.exhibitId}`}
                >
                  <ExternalLink />
                  <span>View Exhibit</span>
                </Link>
              </DropdownMenuItem>
              {exhibit.statusId === StatusCodes.ARCHIVED ? (
                <DropdownMenuItem onClick={() => setShowUnarchiveConfirm(true)}>
                  <Archive />
                  <span className='text-green-400'>Unarchive Exhibit</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setShowArchiveConfirm(true)}>
                  <Archive />
                  <span className='text-yellow-400'>Archive Exhibit</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 />
                <span className='text-red-400'>Delete Exhibit</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            open={showArchiveConfirm}
            onOpenChange={setShowArchiveConfirm}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive Exhibit</DialogTitle>
                <DialogDescription>
                  Are you sure you want to archive this exhibit? This will set
                  its status to ARCHIVED.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='flex gap-2 justify-end'>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button variant='default' onClick={handleArchive}>
                  Archive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hold Up!</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this exhibit? This action
                  cannot be undone.
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
          <Dialog
            open={showUnarchiveConfirm}
            onOpenChange={setShowUnarchiveConfirm}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unarchive Exhibit</DialogTitle>
                <DialogDescription>
                  Are you sure you want to unarchive this exhibit? This will set
                  its status to ACTIVE.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='flex gap-2 justify-end'>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button variant='default' onClick={handleUnarchive}>
                  Unarchive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
