import * as React from 'react';
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Delete, Trash2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationControls: any;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  onBulkDelete?: (selectedRows: TData[]) => void;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  paginationControls,
  sorting,
  setSorting,
  onBulkDelete,
  rowSelection: controlledRowSelection,
  setRowSelection: setControlledRowSelection,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const setRowSelection = setControlledRowSelection ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className='w-full'>
      <div className='flex flex-row gap-3 w-full justify-start mb-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className=''>
              Select Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        {onBulkDelete && selectedRows.length > 0 && (
          <div className=''>
            <Button
              variant='destructive'
              onClick={() =>
                onBulkDelete(selectedRows.map((row) => row.original))
              }
            >
              <Trash2 />
              Delete Selected ({selectedRows.length})
            </Button>
          </div>
        )}
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className='dark:bg-neutral-900 bg-stone-50 px-4'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='px-4'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-col md:flex-row w-full my-4'>
        <div className='text-muted-foreground flex flex-row w-full text-sm mb-4'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Pagination className=''>
          <PaginationContent className='flex flex-row md:w-full w-fit md:justify-end'>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => paginationControls.handlePrevious()}
              />
            </PaginationItem>

            {paginationControls.currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => paginationControls.handlePrevious()}
                >
                  {paginationControls.currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink>{paginationControls.currentPage}</PaginationLink>
            </PaginationItem>

            {paginationControls.currentPage < paginationControls.pageCount && (
              <PaginationItem>
                <PaginationLink onClick={() => paginationControls.handleNext()}>
                  {paginationControls.currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {paginationControls.currentPage <
              paginationControls.pageCount - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {paginationControls.pageCount > 3 &&
              paginationControls.currentPage <
                paginationControls.pageCount - 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      paginationControls.handleShowPage(
                        paginationControls.pageCount,
                      )
                    }
                  >
                    {paginationControls.pageCount}
                  </PaginationLink>
                </PaginationItem>
              )}

            <PaginationItem>
              <Input
                id='pageSizeInput'
                type='number'
                placeholder='10'
                min={'1'}
                onChange={(e) => {
                  const newPageSize = parseInt(e.target.value);
                  if (!isNaN(newPageSize) && newPageSize > 0) {
                    paginationControls.handlePageSizeChange(newPageSize);
                  } else {
                    paginationControls.handlePageSizeChange(10);
                  }
                }}
                className='w-20'
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationNext onClick={() => paginationControls.handleNext()} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
