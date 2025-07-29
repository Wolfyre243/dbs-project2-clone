import { useEffect, useState } from 'react';

// Simple deep equality check for arrays of objects
function deepEqualArray(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every(
    (item, idx) => JSON.stringify(item) === JSON.stringify(b[idx]),
  );
}
import { columns, type User } from './columns';
import { type SortingState } from '@tanstack/react-table';
import { DataTable } from '~/components/ui/data-table';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import { useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { PaginationFilterDropdown } from '~/components/pagination-filters';
import Roles from '~/rolesConfig';
import { LoaderCircle } from 'lucide-react';

export default function AdminUserPagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [languageData, setLanguageData] = useState<any[]>([]);
  const [languageFilterValue, setLanguageFilterValue] = useState('');
  const [roleFilterValue, setRoleFilterValue] = useState(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    // Update searchParams when languageFilterValue changes
    if (roleFilterValue !== undefined) {
      setSearchParams({
        ...Object.fromEntries(searchParams),
        roleFilter: roleFilterValue || '',
        page: '1',
      });
    }
  }, [roleFilterValue]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      // setIsLoading(true);
      try {
        const { data: responseData } = await apiPrivate.get('/user', {
          params: {
            page: searchParams.get('page') || null,
            pageSize: searchParams.get('pageSize') || null,
            sortBy: searchParams.get('sortBy') || null,
            order: searchParams.get('order') || null,
            search: searchParams.get('search') || null,
            languageCodeFilter: searchParams.get('languageCode') || null,
            roleFilter: searchParams.get('roleFilter') || null,
          },
        });
        // Only update if data has changed to prevent table flashing
        if (!deepEqualArray(responseData.data, data)) {
          setData(responseData.data);
        }
        setPageCount(responseData.pageCount);
        setCurrentPage(Number(searchParams.get('page')));
      } catch (error: any) {
        setData([]);
        console.log(error.response?.data?.message);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 3000); // Update every 3s

    return () => {
      clearInterval(intervalId);
    };
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
    <div className='flex flex-col p-6'>
      <h1 className='text-3xl font-bold mb-4'>User Management</h1>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col md:flex-row w-full gap-3 h-fit'>
          <input
            type='text'
            placeholder='Search users...'
            className='p-2 border rounded-md md:w-1/4 text-sm'
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {/* <div className='flex flex-row items-center gap-3'>
            <PaginationFilterDropdown
              filterTitle={'Role'}
              filterOptionList={Object.entries(Roles).map(([key, value]) => ({
                [key]: value.toString(),
              }))}
              valueAccessor='roleValue'
              nameAccessor='roleName'
              selectedValue={roleFilterValue ?? ''}
              setSelectedValue={setRoleFilterValue}
              placeholder='Filter Role'
            />
          </div> */}
        </div>
        {isLoading ? (
          <div className='flex flex-row gap-2 w-full justify-center items-center'>
            <LoaderCircle className='animate-spin' />
            Loading Data...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data}
              paginationControls={paginationControls}
              sorting={sorting}
              setSorting={setSorting}
            />
          </>
        )}
      </div>
    </div>
  );
}
