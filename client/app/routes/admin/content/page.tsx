import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import AdminAudioPagination from './audio/page';
import AdminImagePagination from './images/page';
import { Card } from '~/components/ui/card';
import AdminSubtitlePagination from './subtitles/page';

export default function AdminContentPage() {
  return (
    <div className='space-y-6 px-4 py-6'>
      <h1 className='text-3xl font-bold'>Manage Content</h1>
      <Tabs defaultValue='subtitles'>
        <TabsList>
          <TabsTrigger value='subtitles'>Subtitles</TabsTrigger>
          <TabsTrigger value='audio'>Audio</TabsTrigger>
          <TabsTrigger value='images'>Images</TabsTrigger>
        </TabsList>
        <TabsContent value='subtitles'>
          <AdminSubtitlePagination />
        </TabsContent>
        <TabsContent value='audio'>
          <AdminAudioPagination />
        </TabsContent>
        <TabsContent value='images'>
          <AdminImagePagination />
        </TabsContent>
      </Tabs>
    </div>
  );
}
