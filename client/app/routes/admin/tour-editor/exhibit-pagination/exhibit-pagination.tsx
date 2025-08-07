import { useEffect, useState } from 'react';
import { columns, type Exhibit } from './columns';
import { type SortingState } from '@tanstack/react-table';
import { DataTable } from '~/components/ui/data-table';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import { Link, useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { PaginationFilterDropdown } from '~/components/pagination-filters';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { toast } from 'sonner';
import StatusCodes from '~/statusConfig';

export default function AdminExhibitPagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Exhibit[]>([]);
  const [pageCount, setPageCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  // For supportedLanguages filter
  const [languageData, setLanguageData] = useState<any[]>([]);
  const [languageFilterValue, setLanguageFilterValue] = useState('');
  const [statusFilterValue, setStatusFilterValue] = useState(''); // Exhibit status filter
  const [sorting, setSorting] = useState<SortingState>([]);

  const { accessToken } = useAuth();
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      setSearchParams({
        ...Object.fromEntries(searchParams),
        sortBy: id,
        order: desc ? 'desc' : 'asc',
        page: '1',
      });
    }
  }, [sorting]);

  useEffect(() => {
    // Update searchParams when languageFilterValue changes
    if (languageFilterValue !== undefined) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        languageCode: languageFilterValue || '',
        page: '1',
      });
    }
  }, [languageFilterValue]);

  useEffect(() => {
    // Update searchParams when statusFilterValue changes
    if (statusFilterValue !== undefined) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        statusFilter: statusFilterValue || '',
        page: '1',
      });
    }
  }, [statusFilterValue]);

  useEffect(() => {
    (async () => {
      try {
        const { data: responseData } = await apiPrivate.get('/exhibit', {
          params: {
            page: searchParams.get('page') || null,
            pageSize: searchParams.get('pageSize') || null,
            sortBy: searchParams.get('sortBy') || null,
            order: searchParams.get('order') || null,
            search: searchParams.get('search') || null,
            languageCodeFilter: searchParams.get('languageCode') || null,
            statusFilter: searchParams.get('statusFilter') || null,
          },
        });
        setData(responseData.data);
        setPageCount(responseData.pageCount);
        setCurrentPage(Number(searchParams.get('page')));
      } catch (error: any) {
        setData([]);
        console.log(error.response?.data?.message);
      }
    })();
  }, [accessToken, searchParams]);

  useEffect(() => {
    (async () => {
      try {
        const { data: responseData } = await apiPrivate.get('/language');
        setLanguageData(responseData.data);
      } catch (error: any) {
        setLanguageData([]);
        console.log(error.response?.data?.message);
      }
    })();
  }, [accessToken, searchParams]);

  const handlePrevious = () => {
    const currentPage = Number(searchParams.get('page')) || 1;
    const newPage = Math.max(currentPage - 1, 1);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
  };

  const handleNext = () => {
    const currentPage = Number(searchParams.get('page')) || 1;
    if (!pageCount || currentPage >= pageCount) return;
    const newPage = currentPage + 1;
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
  };

  const handleShowPage = (newPage: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const newSize = Math.max(1, newPageSize);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      pageSize: newSize.toString(),
      page: '1',
    });
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      search: searchTerm,
      page: '1',
    });
  };

  const paginationControls = {
    handlePrevious,
    handleNext,
    handleShowPage,
    handlePageSizeChange,
    pageCount,
    currentPage: currentPage || 1,
  };

  // Dialog state for bulk delete
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [pendingBulkRows, setPendingBulkRows] = useState<Exhibit[]>([]);
  const [rowSelection, setRowSelection] = useState({});

  const handleBulkDelete = (selectedRows: Exhibit[]) => {
    setPendingBulkRows(selectedRows);
    setBulkDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (!pendingBulkRows.length) return;
    try {
      const ids = pendingBulkRows.map((row) => row.exhibitId);

      await apiPrivate.put('/exhibit/bulk', { exhibitIds: ids });
      setData((prev) => prev.filter((ex) => !ids.includes(ex.exhibitId)));
      setRowSelection({});
      toast.success(`Successfully deleted ${ids.length} exhibit(s)`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Bulk delete failed');
    }
    setBulkDialogOpen(false);
    setPendingBulkRows([]);
  };

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col md:flex-row w-full gap-3 h-fit'>
        <div className='flex flex-col md:flex-row w-full h-fit gap-3'>
          <input
            type='text'
            placeholder='Search exhibits...'
            className='p-2 border rounded-md md:w-1/4 text-sm'
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className='flex flex-row items-center gap-3'>
            <PaginationFilterDropdown
              filterTitle={'Status'}
              filterOptionList={[
                { statusCode: 'All', statusName: 'All' },
                {
                  statusCode: StatusCodes.ACTIVE.toString(),
                  statusName: 'Active',
                },
                {
                  statusCode: StatusCodes.ARCHIVED.toString(),
                  statusName: 'Archived',
                },
              ]}
              valueAccessor='statusCode'
              nameAccessor='statusName'
              selectedValue={statusFilterValue}
              setSelectedValue={setStatusFilterValue}
              placeholder='Filter Status'
            />
            {statusFilterValue !== '' ? (
              <Button onClick={() => setStatusFilterValue('')}>
                Reset Status
              </Button>
            ) : (
              ''
            )}
          </div>
        </div>
        <Link
          to={'/admin/tour-editor/create-exhibit'}
          className='flex flex-row items-center gap-2 w-fit h-fit text-nowrap px-3 py-1.5 text-muted bg-primary rounded-lg text-sm'
        >
          <Plus />
          Create New
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={data}
        paginationControls={paginationControls}
        sorting={sorting}
        setSorting={setSorting}
        onBulkDelete={handleBulkDelete}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Exhibits</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {pendingBulkRows.length} selected
              exhibit(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmBulkDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
