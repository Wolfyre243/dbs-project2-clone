import { useEffect, useState } from 'react';
import { columns, type Image } from './columns';
import { type SortingState } from '@tanstack/react-table';
import { DataTable } from '~/components/ui/data-table';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import { useSearchParams } from 'react-router';
import { Input } from '~/components/ui/input';

export default function AdminImagePagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Image[]>([]);
  const [pageCount, setPageCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
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
  }, [sorting, setSearchParams]);

  useEffect(() => {
    (async () => {
      try {
        const { data: responseData } = await apiPrivate.get('/image', {
          params: {
            page: searchParams.get('page') || null,
            pageSize: searchParams.get('pageSize') || null,
            sortBy: searchParams.get('sortBy') || null,
            order: searchParams.get('order') || null,
            search: searchParams.get('search') || null,
          },
        });
        setData(responseData.data);
        setPageCount(responseData.pageCount);
        setCurrentPage(Number(searchParams.get('page')) || 1);
      } catch (error: any) {
        setData([]);
        console.error('Error fetching images:', error.response?.data?.message);
      }
    })();
  }, [accessToken, searchParams, apiPrivate]);

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

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col md:flex-row w-full gap-3 h-fit'>
        <Input
          type='text'
          placeholder='Search images...'
          className='p-2 border rounded-md md:w-1/4 text-sm'
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        data={data}
        paginationControls={paginationControls}
        sorting={sorting}
        setSorting={setSorting}
      />
    </div>
  );
}