import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';

export type AuditLog = {
  auditLogId: string;
  entityName: string;
  logText: string;
  timestamp: Date;
  user: { username: string; userId: string };
  auditAction: { actionType: string; description: string };
  actionTypeId: number;
};

export const columns: ColumnDef<AuditLog>[] = [
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
  //   accessorKey: 'auditLogId',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Log ID' />
  //   ),
  //   cell: ({ row }) => {
  //     const value = row.original.auditLogId;
  //     return value.length > 8 ? value.slice(0, 8) + '...' : value;
  //   },
  // },
  {
    accessorKey: 'auditAction.actionType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action Type' />
    ),
    cell: ({ row }) => {
      const actionType =
        row.original.auditAction.actionType?.toUpperCase?.() || '';
      let colorClass = '';
      let label = actionType;
      switch (actionType) {
        case 'CREATE':
          colorClass = 'bg-green-500/30 border-green-500';
          label = 'CREATE';
          break;
        case 'READ':
          colorClass = 'bg-blue-500 border-blue-500';
          label = 'READ';
          break;
        case 'UPDATE':
          colorClass = 'border-yellow-500 bg-yellow-500/50';
          label = 'UPDATE';
          break;
        case 'DELETE':
          colorClass = 'border-red-500 bg-red-500/30';
          label = 'DELETE';
          break;
        default:
          colorClass = 'bg-gray-400 text-white';
          label = actionType || 'OTHER';
      }
      return (
        <Badge className={colorClass} variant={'outline'}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'entityName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Entity Name' />
    ),
  },
  {
    accessorKey: 'logText',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Log Text' />
    ),
    cell: ({ row }) => {
      const value = row.original.logText;
      return (
        <Tooltip>
          <TooltipTrigger>
            {value.length > 50 ? value.slice(0, 50) + '...' : value}
          </TooltipTrigger>
          <TooltipContent className='max-w-xs break-words'>
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: 'user.username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const value = row.original.user.username;
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
      const auditLog = row.original;
      const [auditData, setAuditData] = useState<any>(null);
      const [isOpen, setIsOpen] = useState<boolean>(false);
      const apiPrivate = useApiPrivate();

      useEffect(() => {
        const fetchAuditData = async () => {
          try {
            const { data: responseData } = await apiPrivate.get(
              `/admin-audit/${auditLog.auditLogId}`,
            );
            setAuditData(responseData.data);
          } catch (error: any) {
            console.log(error.response?.data?.message);
            setAuditData(null);
          }
        };
        fetchAuditData();
      }, [apiPrivate, isOpen]);

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  navigator.clipboard.writeText(auditLog.auditLogId.toString());
                }}
              >
                Copy Log ID
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem>View Details</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
            </DialogHeader>
            <div className='max-h-72 overflow-y-scroll space-y-4'>
              {auditData ? (
                <>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Action Type:</strong>{' '}
                    {auditData.auditAction.actionType}
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Description:</strong>{' '}
                    {auditData.auditAction.description}
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>User:</strong> {auditData.user.username}
                  </div>
                  <div className='p-4 border-2 rounded-lg'>
                    <strong>Log Text:</strong>
                    <div className='whitespace-pre-wrap'>
                      {auditData.logText}
                    </div>
                  </div>
                </>
              ) : (
                <div className='p-4 border-2 rounded-lg'>
                  Loading audit log details...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
