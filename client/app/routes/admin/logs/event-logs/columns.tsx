import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import useApiPrivate from '~/hooks/useApiPrivate';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';

export type EventLog = {
  eventId: string;
  entityName: string;
  details: string;
  timestamp: Date;
  users: { username: string; userId: string };
  eventType: { eventType: string; description: string };
  eventTypeId: number;
};

export const columns: ColumnDef<EventLog>[] = [
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
  // {
  //   accessorKey: 'eventId',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Event ID' />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.original.eventId;
  //     return value.length > 8 ? value.slice(0, 8) + '...' : value;
  //   },
  // },
  {
    accessorKey: 'eventType.eventType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Event Type' />
    ),
    cell: ({ row }) => (
      <Badge className='bg-neutral-700/30' variant={'outline'}>
        {row.original.eventType.eventType}
      </Badge>
    ),
  },
  {
    accessorKey: 'entityName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Entity Name' />
    ),
  },
  {
    accessorKey: 'details',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Details' />
    ),
    cell: ({ row }) => {
      const value = row.original.details;
      return value.length > 50 ? value.slice(0, 50) + '...' : value;
    },
  },
  {
    accessorKey: 'users.username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const value = row.original.users.username;
      return value.length > 8 ? value.slice(0, 8) + '...' : value;
    },
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Timestamp' />
    ),
    cell: ({ row }) => {
      const value = row.original.timestamp;
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
      const eventLog = row.original;
      const [eventData, setEventData] = useState<any>(null);
      const apiPrivate = useApiPrivate();

      useEffect(() => {
        const fetchEventData = async () => {
          try {
            const { data: responseData } = await apiPrivate.get(
              `/event-log/${eventLog.eventId}`,
            );
            setEventData(responseData.data);
          } catch (error: any) {
            console.log(error.response?.data?.message);
            setEventData(null);
          }
        };
        if (eventData === null) {
          fetchEventData();
        }
      }, [apiPrivate, eventLog.eventId, eventData]);

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
                  navigator.clipboard.writeText(eventLog.eventId.toString());
                }}
              >
                Copy Event ID
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem>View Details</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            <div className='max-h-72 overflow-y-scroll space-y-4'>
              {eventData ? (
                <>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Event Type:</strong> {eventData.eventType.eventType}
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Description:</strong>{' '}
                    {eventData.eventType.description}
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>User:</strong> {eventData.users.username}
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Details:</strong>
                    <div className='whitespace-pre-wrap'>
                      {eventData.details}
                    </div>
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Metadata:</strong>
                    <pre className='text-sm'>
                      {JSON.stringify(eventData.metadata ?? {}, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className='p-4 border-2 rounded-lg'>
                  Loading event details...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
