import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card } from '~/components/ui/card';

export default function AdminContentPage() {
  return (
    <div className='space-y-6 px-4 py-6'>
      <h1 className='text-3xl font-bold'>View Logs</h1>
      <Tabs defaultValue='audit'>
        <TabsList>
          <TabsTrigger value='audit'>Audit Logs</TabsTrigger>
          <TabsTrigger value='event'>Event Logs</TabsTrigger>
        </TabsList>
        <TabsContent value='audit'>
          <h1>Audit Log pagination here</h1>
        </TabsContent>
        <TabsContent value='event'>
          <h1>Event Log pagination here</h1>
        </TabsContent>
      </Tabs>
    </div>
  );
}
