import { useEffect, useState } from 'react';
import { columns, type Subtitle } from './columns';
import { type SortingState } from '@tanstack/react-table';
import { DataTable } from '~/components/ui/data-table';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import { useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { PaginationFilterDropdown } from '~/components/pagination-filters';

export default function AdminSubtitlePagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Subtitle[]>([]);
  const [pageCount, setPageCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [languageData, setLanguageData] = useState<any[]>([]);
  const [languageFilterValue, setLanguageFilterValue] = useState('');
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
    (async () => {
      try {
        const { data: responseData } = await apiPrivate.get('/subtitle', {
          params: {
            page: searchParams.get('page') || null,
            pageSize: searchParams.get('pageSize') || null,
            sortBy: searchParams.get('sortBy') || null,
            order: searchParams.get('order') || null,
            search: searchParams.get('search') || null,
            languageCodeFilter: searchParams.get('languageCode') || null,
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

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col md:flex-row w-full gap-3 h-fit'>
        <input
          type='text'
          placeholder='Search audio...'
          className='p-2 border rounded-md md:w-1/4 text-sm'
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <div className='flex flex-row items-center gap-3'>
          <PaginationFilterDropdown
            filterTitle={'Language'}
            filterOptionList={languageData}
            valueAccessor='languageCode'
            nameAccessor='languageCode'
            selectedValue={languageFilterValue}
            setSelectedValue={setLanguageFilterValue}
            placeholder='Filter Language'
          />
          {languageFilterValue !== '' ? (
            <Button onClick={() => setLanguageFilterValue('')}>
              Reset Filters
            </Button>
          ) : (
            ''
          )}
        </div>
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
