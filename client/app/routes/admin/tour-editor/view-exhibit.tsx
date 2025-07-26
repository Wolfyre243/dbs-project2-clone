import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '~/components/ui/card';
import {
  Loader2,
  Image as ImageIcon,
  AudioLines,
  QrCode,
  FileQuestion,
  RefreshCcw,
  UploadCloud,
  AlertCircle,
  Save,
  X,
  Pencil,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { apiPrivate } from '~/services/api';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Link } from 'react-router';
import useApiPrivate from '~/hooks/useApiPrivate';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

interface Subtitle {
  subtitleId: string;
  subtitleText: string;
  languageCode: string;
  createdBy: string;
  modifiedBy: string;
  audioId?: string;
  createdAt: string;
  modifiedAt: string;
  statusId: number;
  audio?: {
    audioId: string;
    description: string;
    createdBy: string;
    createdAt: string;
    statusId: number;
    fileLink: string;
    fileName: string;
    languageCode: string;
  };
}

interface Exhibit {
  exhibitId: string;
  title: string;
  description: string;
  imageLink?: string;
  imageId?: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
  supportedLanguages: string[];
  subtitles?: Subtitle[];
  qrCode: {
    qrCodeId: string;
    image: {
      fileLink: string;
    };
  };
  statusId: number;
}

interface ExhibitMetadata {
  title: string;
  description: string;
  imageId?: string;
  imageLink?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ExhibitMetadata({ exhibit, isEditing, setIsEditing, onUpdate }: { 
  exhibit: Exhibit, 
  isEditing: boolean, 
  setIsEditing: (editing: boolean) => void,
  onUpdate: (metadata: ExhibitMetadata) => Promise<void>
}) {
  const [editMetadata, setEditMetadata] = useState<ExhibitMetadata>({
    title: exhibit.title,
    description: exhibit.description,
    imageId: exhibit.imageId,
    imageLink: exhibit.imageLink,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const VALIDATION_LIMITS = {
    EXHIBIT_NAME_MIN: 3,
    EXHIBIT_NAME_MAX: 100,
    EXHIBIT_DESCRIPTION_MIN: 10,
    EXHIBIT_DESCRIPTION_MAX: 500,
  };

  const validateExhibitMetadata = (): boolean => {
    const errors: ValidationErrors = {};

    if (!editMetadata.title.trim()) {
      errors.exhibitName = 'Exhibit name is required';
    } else if (editMetadata.title.trim().length < VALIDATION_LIMITS.EXHIBIT_NAME_MIN) {
      errors.exhibitName = `Exhibit name must be at least ${VALIDATION_LIMITS.EXHIBIT_NAME_MIN} characters`;
    } else if (editMetadata.title.trim().length > VALIDATION_LIMITS.EXHIBIT_NAME_MAX) {
      errors.exhibitName = `Exhibit name must not exceed ${VALIDATION_LIMITS.EXHIBIT_NAME_MAX} characters`;
    }

    if (!editMetadata.description.trim()) {
      errors.exhibitDescription = 'Exhibit description is required';
    } else if (editMetadata.description.trim().length < VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MIN) {
      errors.exhibitDescription = `Description must be at least ${VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MIN} characters`;
    } else if (editMetadata.description.trim().length > VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX) {
      errors.exhibitDescription = `Description must not exceed ${VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX} characters`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files (PNG, JPEG, JPG) are accepted.');
      return;
    }
    setImageError(null);
    const { imageId, imageLink } = (await uploadImage(file)) ?? {};
    setEditMetadata((prev) => ({
      ...prev,
      imageId,
      imageLink,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files (PNG, JPEG, JPG) are accepted.');
      return;
    }
    setImageError(null);
    const { imageId, imageLink } = (await uploadImage(file)) ?? {};
    setEditMetadata((prev) => ({
      ...prev,
      imageId,
      imageLink,
    }));
  };

  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data: responseData } = await apiPrivate.post(
        '/image/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return {
        imageId: responseData.data.imageId,
        imageLink: responseData.data.fileLink,
      };
    } catch (err) {
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (editMetadata.imageId) {
        await apiPrivate.delete(`/image/hard-delete/${editMetadata.imageId}`);
      }
      setEditMetadata({
        ...editMetadata,
        imageId: undefined,
        imageLink: undefined,
      });
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleUpdate = async () => {
    if (!validateExhibitMetadata()) {
      toast.error('Please fix the validation errors');
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdate(editMetadata);
      setIsEditing(false);
      toast.success('Exhibit updated successfully!');
    } catch (err) {
      toast.error('Failed to update exhibit');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateExhibitMetadata = (field: keyof ExhibitMetadata, value: string) => {
    setEditMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isEditing) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex justify-between items-center'>
            Edit Exhibit
            <Button
              variant='outline'
              size='icon'
              onClick={() => setIsEditing(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </CardTitle>
          <CardDescription>Update exhibit details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='exhibit-name'>Exhibit Name *</Label>
            <Input
              id='exhibit-name'
              placeholder='Enter exhibit name...'
              value={editMetadata.title}
              onChange={(e) => updateExhibitMetadata('title', e.target.value)}
            />
            <div className='text-xs text-muted-foreground'>
              {editMetadata.title.length}/{VALIDATION_LIMITS.EXHIBIT_NAME_MAX} characters
            </div>
            {validationErrors.exhibitName && (
              <div className='flex items-center gap-2 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4' />
                {validationErrors.exhibitName}
              </div>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='exhibit-description'>Description *</Label>
            <Textarea
              id='exhibit-description'
              placeholder='Enter exhibit description...'
              value={editMetadata.description}
              onChange={(e) => updateExhibitMetadata('description', e.target.value)}
              className='min-h-[100px]'
            />
            <div className='text-xs text-muted-foreground'>
              {editMetadata.description.length}/{VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX} characters
            </div>
            {validationErrors.exhibitDescription && (
              <div className='flex items-center gap-2 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4' />
                {validationErrors.exhibitDescription}
              </div>
            )}
          </div>
          <div className='space-y-2'>
            <Label>Exhibit Image</Label>
            {editMetadata.imageLink ? (
              <div className='flex flex-col items-center'>
                <img
                  src={editMetadata.imageLink}
                  alt='Exhibit'
                  className='max-h-80 object-contain mb-2 rounded'
                />
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={handleDeleteImage}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`flex min-h-[150px] border-2 border-dashed rounded-md p-4 flex-col items-center justify-center cursor-pointer transition-colors ${isUploadingImage ? 'opacity-50' : 'hover:border-primary'}`}
                onClick={() => document.getElementById('exhibit-image-input')?.click()}
              >
                <UploadCloud className='h-6 w-6 mb-2' />
                <span className='text-muted-foreground'>Drag & drop or click to upload an image</span>
                <input
                  id='exhibit-image-input'
                  type='file'
                  accept='image/png, image/jpeg'
                  className='hidden'
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                />
                {imageError && (
                  <span className='text-xs text-red-600 mt-2'>{imageError}</span>
                )}
                {isUploadingImage && (
                  <span className='text-xs text-muted-foreground mt-2'>Uploading...</span>
                )}
              </div>
            )}
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Update Exhibit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-3xl font-bold'>
          {exhibit.title || (
            <span className='text-muted-foreground'>No Name</span>
          )}
        </h1>
        <Button
          onClick={() => setIsEditing(true)}
          variant='outline'
        >
          <Pencil className='h-4 w-4 mr-2' />
          Edit Exhibit
        </Button>
      </div>
      <p className='mb-4 text-lg'>
        {exhibit.description || (
          <span className='text-muted-foreground'>No Description</span>
        )}
      </p>
      <div className='flex flex-wrap gap-4 text-sm text-muted-foreground mb-4'>
        <span>
          <span className='font-semibold'>Created by:</span> {exhibit.createdBy}
        </span>
        <span>
          <span className='font-semibold'>Created at:</span>{' '}
          {formatDate(exhibit.createdAt)}
        </span>
        <span>
          <span className='font-semibold'>Last modified:</span>{' '}
          {formatDate(exhibit.modifiedAt)}
        </span>
      </div>
      <div className='font-semibold mb-2 flex items-center gap-2'>
        <ImageIcon className='h-5 w-5' /> Exhibit Image
      </div>
      {exhibit.imageLink ? (
        <img
          src={exhibit.imageLink}
          alt='Exhibit'
          className='max-h-64 rounded border object-contain'
        />
      ) : (
        <div className='flex items-center justify-center h-40 w-full bg-muted rounded border text-muted-foreground'>
          <ImageIcon className='h-10 w-10' />
          <span className='ml-2'>No Image</span>
        </div>
      )}
    </div>
  );
}

function ExhibitQrCard({
  qrCodeId,
  qrImageLink,
  exhibitId,
}: {
  qrCodeId: string;
  qrImageLink: string;
  exhibitId: string;
}) {
  const apiPrivate = useApiPrivate();

  const handleRefreshQR = async () => {
    try {
      const { data: responseData } = await apiPrivate.post(
        `/qrcode/regenerate/${qrCodeId}`,
      );
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(
          'Failed to regenerate QR Code: ' + error.response?.data.message,
        );
        return;
      }
      console.log(error);
      toast.error('Failed to regenerate QR Code');
    }
  };

  return (
    <div className='flex flex-row w-full justify-end'>
      <Card className='gap-0 w-fit'>
        <CardHeader>
          <CardTitle className='flex flex-row justify-between items-center'>
            <h1>Exhibit QR Code</h1>
            <Button
              onClick={handleRefreshQR}
              variant={'secondary'}
              size={'icon'}
            >
              <RefreshCcw />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 w-full h-fit'>
          {qrImageLink ? (
            <img
              src={qrImageLink}
              alt='QR Code'
              className='h-60 w-60 rounded-lg object-contain'
            />
          ) : (
            <div className='flex items-center justify-center w-60 h-60 bg-muted rounded border text-muted-foreground'>
              <QrCode className='h-10 w-10' />
              <span className='ml-2'>QR Code Placeholder</span>
            </div>
          )}
          <Button asChild>
            <Link
              className='px-4 py-1 w-fit rounded-md'
              to={`/home/exhibits/${exhibitId}`}
            >
              View Live
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SubtitleAudioPreview({ subtitles }: { subtitles: Subtitle[] }) {
  const available = subtitles.filter(
    (s) => s.languageCode && s.subtitleText && s.audio && s.audio.fileLink,
  );
  const [selectedLang, setSelectedLang] = useState(
    available.length > 0 ? available[0].languageCode : '',
  );
  const [current, setCurrent] = useState(
    available.length > 0 ? available[0] : undefined,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentWordIndices, setCurrentWordIndices] = useState<
    Record<string, number | null>
  >({});

  useEffect(() => {
    setCurrent(available.find((s) => s.languageCode === selectedLang));
  }, [selectedLang, available]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current && current) {
        const duration = audioRef.current.duration;
        if (isFinite(duration) && duration > 0) {
          const isSpaceSeparated = [
            'en-GB',
            'es-ES',
            'fr-FR',
            'de-DE',
            'ru-RU',
            'it-IT',
            'ms-MY',
            'ta-IN',
            'hi-IN',
          ].includes(current.languageCode);
          const units = isSpaceSeparated
            ? current.subtitleText.split(' ')
            : current.subtitleText.split('');
          const segmentSize = 8;
          const segmentDuration =
            duration / Math.ceil(units.length / segmentSize);
          const currentTime = audioRef.current.currentTime;
          const index = Math.floor(currentTime / segmentDuration);
          setCurrentWordIndices((prev) => ({
            ...prev,
            [current.subtitleId]:
              index >= 0 && index * segmentSize < units.length ? index : null,
          }));
        }
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('pause', handleTimeUpdate);
      audioElement.addEventListener('ended', handleTimeUpdate);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('pause', handleTimeUpdate);
        audioElement.removeEventListener('ended', handleTimeUpdate);
      }
    };
  }, [current]);

  if (available.length === 0) {
    return (
      <div className='flex items-center gap-2 text-muted-foreground'>
        <AudioLines className='h-5 w-5' />
        No subtitles with audio available
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full'>
      <div className='mb-4 flex items-center gap-2'>
        <span className='font-medium'>Language:</span>
        <Select value={selectedLang} onValueChange={setSelectedLang}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Select language' />
          </SelectTrigger>
          <SelectContent>
            {available.map((s) => (
              <SelectItem key={s.languageCode} value={s.languageCode}>
                {s.languageCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col md:flex-row w-full items-start gap-5'>
        <div className='p-4 border rounded-lg space-y-2 w-full md:w-2/3'>
          <div className='text-xs text-muted-foreground'>
            Language: {current?.languageCode}
          </div>
          <div className='font-medium'>
            {(() => {
              const isSpaceSeparated =
                current?.languageCode &&
                [
                  'en-GB',
                  'es-ES',
                  'fr-FR',
                  'de-DE',
                  'ru-RU',
                  'it-IT',
                  'ms-MY',
                  'ta-IN',
                  'hi-IN',
                ].includes(current.languageCode);
              const units = current?.subtitleText
                ? current.subtitleText.split(isSpaceSeparated ? ' ' : '')
                : [];
              return units
                .reduce((acc, unit, index) => {
                  const segmentIndex = Math.floor(index / 8);
                  if (index % 8 === 0) acc.push([]);
                  acc[acc.length - 1].push(unit);
                  return acc;
                }, [] as string[][])
                .map((group, groupIndex) => (
                  <span
                    key={groupIndex}
                    className={`${groupIndex === currentWordIndices[current?.subtitleId || ''] ? 'text-black' : ''} px-1 py-0.5`}
                    style={{
                      borderRadius: '4px',
                      background:
                        groupIndex ===
                        currentWordIndices[current?.subtitleId || '']
                          ? 'linear-gradient(90deg, #ffeb3b, #ffca28)'
                          : 'transparent',
                      fontWeight:
                        groupIndex ===
                        currentWordIndices[current?.subtitleId || '']
                          ? '500'
                          : '300',
                      transition: 'all 0.3s ease',
                      boxShadow:
                        groupIndex ===
                        currentWordIndices[current?.subtitleId || '']
                          ? '0 2px 6px rgba(255, 215, 0, 0.4)'
                          : 'none',
                    }}
                  >
                    {group.join(isSpaceSeparated ? ' ' : '') + ''}
                  </span>
                ));
            })()}
          </div>
        </div>
        <div className='flex flex-row w-full md:w-1/3'>
          {current?.audio?.fileLink ? (
            <audio
              ref={audioRef}
              key={current.audio.fileLink}
              controls
              className='w-full'
            >
              <source src={current.audio.fileLink} type='audio/wav' />
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
    </div>
  );
}

export default function AdminViewExhibitPage() {
  const { exhibitId } = useParams();
  const [exhibit, setExhibit] = useState<Exhibit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

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

  const handleUpdateExhibit = async (metadata: ExhibitMetadata) => {
    if (!exhibit) return;
    try {
      const { data: responseData } = await apiPrivate.put(`/exhibit`, {
        exhibitId: exhibit.exhibitId,
        title: metadata.title,
        description: metadata.description,
        imageId: metadata.imageId,
        statusId: exhibit.statusId,
        createdBy: exhibit.createdBy,
      });
      setExhibit(responseData.data.exhibit);
    } catch (error: any) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data.message || 'Failed to update exhibit');
      }
      throw error;
    }
  };

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
    <div className='w-full p-6'>
      <div className='flex flex-col gap-8'>
        <div className='w-full items-start flex flex-col md:flex-row gap-6'>
          <ExhibitMetadata 
            exhibit={exhibit} 
            isEditing={isEditing} 
            setIsEditing={setIsEditing}
            onUpdate={handleUpdateExhibit}
          />
          <ExhibitQrCard
            qrCodeId={exhibit.qrCode?.qrCodeId}
            qrImageLink={exhibit.qrCode?.image.fileLink}
            exhibitId={exhibit.exhibitId}
          />
        </div>
        <div className='w-full flex flex-col gap-8'>
          <div>
            <h3 className='text-xl font-semibold mb-4'>
              Subtitles & Audio Preview
            </h3>
            <SubtitleAudioPreview subtitles={exhibit.subtitles || []} />
          </div>
        </div>
      </div>
    </div>
  );
}