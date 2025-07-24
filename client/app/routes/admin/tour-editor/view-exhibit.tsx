import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  Loader2,
  Image as ImageIcon,
  AudioLines,
  QrCode,
  FileQuestion,
} from 'lucide-react';
import { apiPrivate } from '~/services/api';

interface Subtitle {
  id: string;
  text: string;
  language: string;
  audioId?: string;
  fileLink?: string;
}

interface Exhibit {
  exhibitId: string;
  title: string;
  description: string;
  imageUrl?: string;
  assetData?: {
    subtitleIds?: string[];
    audioIds?: string[];
  };
  subtitles?: Subtitle[];
}

function ExhibitMetaCard({ exhibit }: { exhibit: Exhibit }) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>
          {exhibit.title || (
            <span className='text-muted-foreground'>No Name</span>
          )}
        </CardTitle>
        <CardDescription>
          {exhibit.description || (
            <span className='text-muted-foreground'>No Description</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='font-semibold mb-2 flex items-center gap-2'>
          <ImageIcon className='h-5 w-5' /> Exhibit Image
        </div>
        {exhibit.imageUrl ? (
          <img
            src={exhibit.imageUrl}
            alt='Exhibit'
            className='max-h-64 rounded border object-contain'
          />
        ) : (
          <div className='flex items-center justify-center h-40 w-full bg-muted rounded border text-muted-foreground'>
            <ImageIcon className='h-10 w-10' />
            <span className='ml-2'>No Image</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExhibitQrCard({ exhibitId }: { exhibitId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exhibit QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder QR code: You can replace this with a real QR code generator */}
        <div className='flex items-center justify-center h-40 w-full bg-muted rounded border text-muted-foreground'>
          <QrCode className='h-10 w-10' />
          <span className='ml-2'>QR Code Placeholder</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminViewExhibitPage() {
  const { exhibitId } = useParams();
  const [exhibit, setExhibit] = useState<Exhibit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExhibit() {
      setLoading(true);
      try {
        const { data: responseData } = await apiPrivate.get(
          `/exhibit/${exhibitId}`,
        );
        setExhibit(responseData.data.exhibit);
      } catch (err) {
        setExhibit(null);
      } finally {
        setLoading(false);
      }
    }
    if (exhibitId) fetchExhibit();
  }, [exhibitId]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh]'>
        <Loader2 className='h-8 w-8 animate-spin mb-2' />
        <div>Loading exhibit...</div>
      </div>
    );
  }

  if (!exhibit) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh]'>
        <FileQuestion className='h-10 w-10 mb-2 text-muted-foreground' />
        <div className='text-lg font-semibold'>Exhibit not found</div>
      </div>
    );
  }

  return (
    <div className='w-full mx-auto p-6'>
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Left: Exhibit Metadata & QR */}
        <div className='md:w-1/3 w-full flex flex-col gap-6'>
          <ExhibitMetaCard exhibit={exhibit} />
          <ExhibitQrCard exhibitId={exhibit.exhibitId} />
        </div>
        {/* Right: Subtitles, Audio */}
        <div className='md:w-2/3 w-full flex flex-col gap-8'>
          <Card>
            <CardHeader>
              <CardTitle>Subtitles & Audio</CardTitle>
            </CardHeader>
            <CardContent>
              {exhibit.subtitles && exhibit.subtitles.length > 0 ? (
                <div className='space-y-6'>
                  {exhibit.subtitles.map((subtitle) => (
                    <div
                      key={subtitle.id}
                      className='p-4 border rounded-lg space-y-2'
                    >
                      <div className='font-medium'>
                        {subtitle.text || (
                          <span className='text-muted-foreground'>
                            No Subtitle Text
                          </span>
                        )}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Language:{' '}
                        {subtitle.language || (
                          <span className='italic'>Unknown</span>
                        )}
                      </div>
                      <div>
                        {subtitle.fileLink ? (
                          <audio controls className='w-full'>
                            <source src={subtitle.fileLink} type='audio/wav' />
                            Your browser does not support the audio element.
                          </audio>
                        ) : (
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <AudioLines className='h-4 w-4' />
                            No Audio
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <AudioLines className='h-5 w-5' />
                  No Subtitles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
