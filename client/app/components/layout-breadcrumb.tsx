import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { useLocation } from 'react-router';
import { Link } from 'react-router';

const LayoutBreadcrumb = (props: { href: any }) => {
  const location = useLocation();
  const { pathname } = location;
  const segments = pathname.split('/');

  const uppercaseFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatHeader = (str: string) => {
    const words = str.split('-');
    let formatted = words
      .map((word) => {
        return uppercaseFirstLetter(word);
      })
      .join(' ');
    if (formatted.length > 15) {
      formatted = formatted.slice(0, 15) + '...';
    }
    return formatted;
  };

  let url = '';
  const breadcrumbLinks = segments.map((segment, i) => {
    if (segment === '') return;
    url += `/${segment}`;
    return (
      <>
        {i == segments.length - 1 ? (
          <BreadcrumbItem key={i}>
            <BreadcrumbPage>{formatHeader(segment)}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem key={i}>
              <Link
                to={url}
                className='hover:text-neutral-300 transition-all duration-150'
              >
                {formatHeader(segment)}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
      </>
    );
  });

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>{...breadcrumbLinks}</BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default LayoutBreadcrumb;
