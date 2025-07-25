import AdminExhibitPagination from './exhibit-pagination/exhibit-pagination';

export default function TourEditorHomePage() {
  return (
    <div className='space-y-6 px-4 py-6'>
      <h1 className='text-3xl font-bold'>View All Exhibits</h1>
      <AdminExhibitPagination />
    </div>
  );
}
