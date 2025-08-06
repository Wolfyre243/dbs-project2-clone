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
  Plus,
  Trash2,
  Play,
  Edit3,
} from 'lucide-react';
import { apiPrivate } from '~/services/api';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { LanguageSelect } from '~/components/language-select';
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
  wordTimings: { word: string; start: number; end: number }[];
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
  statusId: number;
}

interface ExhibitQrCode {
  qrCodeId: string;
  image: {
    fileLink: string;
  };
  url: string;
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

function ExhibitMetadata({
  exhibit,
  isEditing,
  setIsEditing,
  onUpdate,
}: {
  exhibit: Exhibit;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onUpdate: (metadata: ExhibitMetadata) => Promise<void>;
}) {
  const [editMetadata, setEditMetadata] = useState<ExhibitMetadata>({
    title: exhibit.title,
    description: exhibit.description,
    imageId: exhibit.imageId,
    imageLink: exhibit.imageLink,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
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
    } else if (
      editMetadata.title.trim().length < VALIDATION_LIMITS.EXHIBIT_NAME_MIN
    ) {
      errors.exhibitName = `Exhibit name must be at least ${VALIDATION_LIMITS.EXHIBIT_NAME_MIN} characters`;
    } else if (
      editMetadata.title.trim().length > VALIDATION_LIMITS.EXHIBIT_NAME_MAX
    ) {
      errors.exhibitName = `Exhibit name must not exceed ${VALIDATION_LIMITS.EXHIBIT_NAME_MAX} characters`;
    }

    if (!editMetadata.description.trim()) {
      errors.exhibitDescription = 'Exhibit description is required';
    } else if (
      editMetadata.description.trim().length <
      VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MIN
    ) {
      errors.exhibitDescription = `Description must be at least ${VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MIN} characters`;
    } else if (
      editMetadata.description.trim().length >
      VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX
    ) {
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

  const updateExhibitMetadata = (
    field: keyof ExhibitMetadata,
    value: string,
  ) => {
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
              {editMetadata.title.length}/{VALIDATION_LIMITS.EXHIBIT_NAME_MAX}{' '}
              characters
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
              onChange={(e) =>
                updateExhibitMetadata('description', e.target.value)
              }
              className='min-h-[100px]'
            />
            <div className='text-xs text-muted-foreground'>
              {editMetadata.description.length}/
              {VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX} characters
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
                onClick={() =>
                  document.getElementById('exhibit-image-input')?.click()
                }
              >
                <UploadCloud className='h-6 w-6 mb-2' />
                <span className='text-muted-foreground'>
                  Drag & drop or click to upload an image
                </span>
                <input
                  id='exhibit-image-input'
                  type='file'
                  accept='image/png, image/jpeg'
                  className='hidden'
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                />
                {imageError && (
                  <span className='text-xs text-red-600 mt-2'>
                    {imageError}
                  </span>
                )}
                {isUploadingImage && (
                  <span className='text-xs text-muted-foreground mt-2'>
                    Uploading...
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
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
        <Button onClick={() => setIsEditing(true)} variant='outline'>
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
  qrCode,
  exhibitId,
  setQrCode,
}: {
  qrCode: ExhibitQrCode | null;
  exhibitId: string;
  setQrCode: any;
}) {
  const apiPrivate = useApiPrivate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshQR = async () => {
    setIsRefreshing(true);
    try {
      const { data: responseData } = await apiPrivate.post(
        `/qrcode/regenerate/${exhibitId}`,
      );

      await setQrCode((prev: ExhibitQrCode) => ({
        ...prev,
        qrCodeId: responseData.data.qrCodeId,
        image: { fileLink: responseData.data.fileLink },
      }));

      toast.success('Successfully regenerated QR Code');
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(
          'Failed to regenerate QR Code: ' + error.response?.data.message,
        );
        return;
      }
      console.log(error);
      toast.error('Failed to regenerate QR Code');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className='flex flex-row w-full justify-center md:justify-end'>
      <Card className='gap-0 w-fit'>
        <CardHeader>
          <CardTitle className='flex flex-row justify-between items-center'>
            <h1>Exhibit QR Code</h1>
            <Button
              onClick={handleRefreshQR}
              variant={'secondary'}
              size={'icon'}
            >
              <RefreshCcw className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 w-full h-fit'>
          {qrCode?.image.fileLink ? (
            <img
              src={qrCode.image.fileLink}
              alt='QR Code'
              className='h-60 w-60 rounded-lg object-contain'
            />
          ) : (
            <div className='flex items-center justify-center w-60 h-60 bg-muted rounded border text-muted-foreground'>
              <QrCode className='h-10 w-10' />
              <span className='ml-2'>QR Code Placeholder</span>
            </div>
          )}
          <Button
            asChild
            className={isRefreshing ? 'bg-muted text-muted-foreground' : ''}
            disabled={isRefreshing}
          >
            {!isRefreshing ? (
              <Link
                className='px-4 py-1 w-fit rounded-md'
                to={qrCode?.url ?? `/home/exhibits/${exhibitId}`}
              >
                View Live
              </Link>
            ) : (
              <p className='flex flex-row w-fit'>
                <Loader2 className='animate-spin' />
                Loading...
              </p>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface SubtitleFormData {
  text: string;
  languageCode: string;
  audioId?: string;
  fileLink?: string;
  isGenerating?: boolean;
}

function SubtitleManagementSection({
  subtitles,
  onSubtitleUpdate,
  onSubtitleAdd,
  onSubtitleDelete,
}: {
  subtitles: Subtitle[];
  onSubtitleUpdate: (
    subtitleId: string,
    data: Partial<Subtitle>,
  ) => Promise<void>;
  onSubtitleAdd: (data: SubtitleFormData) => Promise<void>;
  onSubtitleDelete: (subtitleId: string) => Promise<void>;
}) {
  const apiPrivate = useApiPrivate();
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Form data
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);
  const [editFormData, setEditFormData] = useState<SubtitleFormData>({
    text: '',
    languageCode: '',
  });
  const [addFormData, setAddFormData] = useState<SubtitleFormData>({
    text: '',
    languageCode: '',
  });

  // Loading states
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Validation
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const VALIDATION_LIMITS = {
    SUBTITLE_TEXT_MIN: 5,
    SUBTITLE_TEXT_MAX: 1000,
  };

  const validateSubtitle = (data: SubtitleFormData): boolean => {
    const errors: ValidationErrors = {};

    if (!data.text.trim()) {
      errors.text = 'Subtitle text is required';
    } else if (data.text.trim().length < VALIDATION_LIMITS.SUBTITLE_TEXT_MIN) {
      errors.text = `Text must be at least ${VALIDATION_LIMITS.SUBTITLE_TEXT_MIN} characters`;
    } else if (data.text.trim().length > VALIDATION_LIMITS.SUBTITLE_TEXT_MAX) {
      errors.text = `Text must not exceed ${VALIDATION_LIMITS.SUBTITLE_TEXT_MAX} characters`;
    }

    if (!data.languageCode) {
      errors.languageCode = 'Language is required';
    }

    if (!data.audioId) {
      errors.audioId = 'Audio ID is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkLanguageUniqueness = (
    languageCode: string,
    excludeId?: string,
  ): boolean => {
    // If subtitle lannguage is not unique, then return false
    return !subtitles.some(
      (s) => s.languageCode === languageCode && s.subtitleId !== excludeId,
    );
  };

  const generateAudio = async (
    formData: SubtitleFormData,
    setFormData: (
      updater: (prev: SubtitleFormData) => SubtitleFormData,
    ) => void,
  ) => {
    if (!formData.text.trim() || !formData.languageCode) {
      toast.error('Please enter subtitle text and select a language');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      if (formData.audioId) {
        await apiPrivate.delete(`/audio/hard-delete/${formData.audioId}`);
      }

      const { data: responseData } = await apiPrivate.post('/audio/generate', {
        text: formData.text,
        languageCode: formData.languageCode,
      });

      setFormData((prev: SubtitleFormData) => {
        const updated = {
          ...prev,
          audioId: responseData.data.audioId,
          fileLink: responseData.data.fileLink,
        };
        return updated;
      });

      toast.success('Audio generated successfully!');
    } catch (error) {
      toast.error('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAudioUpload = async (
    file: File,
    formData: SubtitleFormData,
    setFormData: (data: SubtitleFormData) => void,
  ) => {
    if (file.type !== 'audio/wav' && !file.name.endsWith('.wav')) {
      toast.error('Please upload a .wav audio file');
      return;
    }

    console.log(file);

    setIsUploadingAudio(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('languageCode', formData.languageCode);

      // Do NOT set Content-Type header manually; let Axios handle it
      const { data: responseData } = await apiPrivate.post(
        '/audio/upload',
        uploadFormData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      setFormData({
        ...formData,
        audioId: responseData.data.audioId,
        fileLink: responseData.data.fileLink,
      });

      toast.success('Audio uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload audio');
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleDeleteAudio = async (
    formData: SubtitleFormData,
    setFormData: (data: SubtitleFormData) => void,
  ) => {
    if (!formData.audioId) return;

    try {
      await apiPrivate.delete(`/audio/hard-delete/${formData.audioId}`);
      setFormData({
        ...formData,
        audioId: undefined,
        fileLink: undefined,
      });
      toast.success('Audio deleted');
    } catch (error) {
      toast.error('Failed to delete audio');
    }
  };

  const openEditDialog = (subtitle: Subtitle) => {
    setEditingSubtitle(subtitle);
    setEditFormData({
      text: subtitle.subtitleText,
      languageCode: subtitle.languageCode,
      audioId: subtitle.audioId,
      fileLink: subtitle.audio?.fileLink,
    });
    setEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setAddFormData({
      text: '',
      languageCode: '',
    });
    setAddDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!validateSubtitle(editFormData) || !editingSubtitle) return;

    if (
      !checkLanguageUniqueness(
        editFormData.languageCode,
        editingSubtitle.subtitleId,
      )
    ) {
      toast.error('A subtitle with this language already exists');
      return;
    }

    setIsSaving(true);
    try {
      await onSubtitleUpdate(editingSubtitle.subtitleId, {
        subtitleText: editFormData.text,
        languageCode: editFormData.languageCode,
        audioId: editFormData.audioId,
      });
      setEditDialogOpen(false);
      toast.success('Subtitle updated successfully!');
    } catch (error) {
      toast.error('Failed to update subtitle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtitle = async () => {
    if (!validateSubtitle(addFormData)) return;

    if (!checkLanguageUniqueness(addFormData.languageCode)) {
      toast.error('A subtitle with this language already exists');
      return;
    }

    if (!addFormData.audioId) {
      toast.error('Please generate or upload audio for the subtitle');
      return;
    }

    setIsSaving(true);
    try {
      await onSubtitleAdd(addFormData);
      setAddDialogOpen(false);
      toast.success('Subtitle added successfully!');
    } catch (error) {
      toast.error('Failed to add subtitle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubtitle = async (subtitleId: string) => {
    if (subtitles.length <= 1) {
      toast.error(
        'Cannot delete the last subtitle. An exhibit must have at least one subtitle.',
      );
      return;
    }

    setIsDeleting(true);
    try {
      await onSubtitleDelete(subtitleId);
      setDeleteDialogOpen(false);
      toast.success('Subtitle deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete subtitle');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasLanguageMismatch = (subtitle: Subtitle): boolean => {
    return subtitle.audio?.languageCode !== subtitle.languageCode;
  };

  return (
    <div className='space-y-4'>
      {/* Header with Add Button */}
      <div className='flex justify-between items-center'>
        <span className='font-medium'>Manage Subtitles</span>
        <Button onClick={openAddDialog} size='sm'>
          <Plus className='h-4 w-4 mr-2' />
          Add Subtitle
        </Button>
      </div>

      {/* Subtitle Cards */}
      <div className='space-y-3'>
        {subtitles.length !== 0 ? (
          subtitles.map((subtitle) => (
            <Card key={subtitle.subtitleId} className='p-4'>
              <div className='flex justify-between items-start gap-4'>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm'>
                      {subtitle.languageCode}
                    </span>
                    {hasLanguageMismatch(subtitle) && (
                      <div className='flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded'>
                        <AlertCircle className='h-3 w-3' />
                        Audio language may not match
                      </div>
                    )}
                  </div>
                  <p className='text-sm'>{subtitle.subtitleText}</p>
                  {subtitle.audio?.fileLink && (
                    <audio
                      key={subtitle.audio?.fileLink}
                      controls
                      className='w-full max-w-md'
                    >
                      <source src={subtitle.audio.fileLink} type='audio/wav' />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => openEditDialog(subtitle)}
                  >
                    <Edit3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setEditingSubtitle(subtitle);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={subtitles.length <= 1}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <AudioLines className='h-5 w-5' />
              No subtitles available
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Subtitle</DialogTitle>
            <DialogDescription>
              Update the subtitle text, language, or regenerate audio
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Language *</Label>
              <LanguageSelect
                fieldName='languageCode'
                value={editFormData.languageCode}
                onValueChange={(languageCode) =>
                  setEditFormData({ ...editFormData, languageCode })
                }
                placeholder='Select language'
                disabledLanguageCodes={subtitles
                  .filter((s) => s.subtitleId !== editingSubtitle?.subtitleId)
                  .map((s) => s.languageCode)}
              />
              {validationErrors.languageCode && (
                <div className='flex items-center gap-2 text-sm text-red-600'>
                  <AlertCircle className='h-4 w-4' />
                  {validationErrors.languageCode}
                </div>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Subtitle Text *</Label>
              <Textarea
                placeholder='Enter subtitle text...'
                value={editFormData.text}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, text: e.target.value })
                }
                className='min-h-[100px]'
              />
              <div className='text-xs text-muted-foreground'>
                {editFormData.text.length}/{VALIDATION_LIMITS.SUBTITLE_TEXT_MAX}{' '}
                characters
              </div>
              {validationErrors.text && (
                <div className='flex items-center gap-2 text-sm text-red-600'>
                  <AlertCircle className='h-4 w-4' />
                  {validationErrors.text}
                </div>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Audio</Label>
              <div className='flex gap-2'>
                <Button
                  onClick={() => generateAudio(editFormData, setEditFormData)}
                  disabled={
                    !editFormData.text.trim() ||
                    !editFormData.languageCode ||
                    isGeneratingAudio
                  }
                  size='sm'
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      Generate Audio
                    </>
                  )}
                </Button>
                <input
                  type='file'
                  accept='.wav,audio/wav'
                  ref={audioInputRef}
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleAudioUpload(file, editFormData, setEditFormData);
                  }}
                />
                <Button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={!editFormData.languageCode || isUploadingAudio}
                  size='sm'
                  variant='secondary'
                >
                  {isUploadingAudio ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className='h-4 w-4 mr-2' />
                      Upload Audio
                    </>
                  )}
                </Button>
                {editFormData.audioId && (
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() =>
                      handleDeleteAudio(editFormData, setEditFormData)
                    }
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
              {editFormData.fileLink && (
                <audio key={editFormData.fileLink} controls className='w-full'>
                  <source src={editFormData.fileLink} type='audio/wav' />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                !Boolean(editFormData.text) ||
                !Boolean(editFormData.languageCode) ||
                !Boolean(editFormData.audioId) ||
                isSaving
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add New Subtitle</DialogTitle>
            <DialogDescription>
              Create a new subtitle with text and audio
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Language *</Label>
              <LanguageSelect
                fieldName='languageCode'
                value={addFormData.languageCode}
                onValueChange={(languageCode) =>
                  setAddFormData({ ...addFormData, languageCode })
                }
                placeholder='Select language'
                disabledLanguageCodes={subtitles.map((s) => s.languageCode)}
              />
              {validationErrors.languageCode && (
                <div className='flex items-center gap-2 text-sm text-red-600'>
                  <AlertCircle className='h-4 w-4' />
                  {validationErrors.languageCode}
                </div>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Subtitle Text *</Label>
              <Textarea
                placeholder='Enter subtitle text...'
                value={addFormData.text}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, text: e.target.value })
                }
                className='min-h-[100px]'
              />
              <div className='text-xs text-muted-foreground'>
                {addFormData.text.length}/{VALIDATION_LIMITS.SUBTITLE_TEXT_MAX}{' '}
                characters
              </div>
              {validationErrors.text && (
                <div className='flex items-center gap-2 text-sm text-red-600'>
                  <AlertCircle className='h-4 w-4' />
                  {validationErrors.text}
                </div>
              )}
            </div>
            <div className='space-y-2'>
              <Label>Audio *</Label>
              <div className='flex gap-2'>
                <Button
                  onClick={() => generateAudio(addFormData, setAddFormData)}
                  disabled={
                    !addFormData.text.trim() ||
                    !addFormData.languageCode ||
                    isGeneratingAudio
                  }
                  size='sm'
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      Generate Audio
                    </>
                  )}
                </Button>
                <input
                  type='file'
                  accept='.wav,audio/wav'
                  ref={audioInputRef}
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleAudioUpload(file, addFormData, setAddFormData);
                  }}
                />
                <Button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={!addFormData.languageCode || isUploadingAudio}
                  size='sm'
                  variant='secondary'
                >
                  {isUploadingAudio ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className='h-4 w-4 mr-2' />
                      Upload Audio
                    </>
                  )}
                </Button>
                {addFormData.audioId && (
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() =>
                      handleDeleteAudio(addFormData, setAddFormData)
                    }
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
              {addFormData.fileLink && (
                <audio key={addFormData.fileLink} controls className='w-full'>
                  <source src={addFormData.fileLink} type='audio/wav' />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSubtitle}
              disabled={
                !Boolean(addFormData.text) ||
                !Boolean(addFormData.languageCode) ||
                !Boolean(addFormData.audioId) ||
                isSaving
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Adding...
                </>
              ) : (
                'Add Subtitle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subtitle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subtitle? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {editingSubtitle && (
            <div className='py-4'>
              <div className='p-3 bg-muted rounded border'>
                <div className='font-medium text-sm mb-1'>
                  {editingSubtitle.languageCode}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {editingSubtitle.subtitleText}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() =>
                editingSubtitle &&
                handleDeleteSubtitle(editingSubtitle.subtitleId)
              }
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete Subtitle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminViewExhibitPage() {
  const { exhibitId } = useParams();
  const [exhibit, setExhibit] = useState<Exhibit | null>(null);
  const [qrCode, setQrCode] = useState<ExhibitQrCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    async function fetchExhibit() {
      setLoading(true);
      try {
        const { data: responseData } = await apiPrivate.get(
          `/exhibit/${exhibitId}`,
        );
        console.log(responseData.data.exhibit);
        setExhibit(responseData.data.exhibit);
        setQrCode(responseData.data.exhibit.qrCode);
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
        throw new Error(
          error.response?.data.message || 'Failed to update exhibit',
        );
      }
      throw error;
    }
  };

  const handleSubtitleUpdate = async (
    subtitleId: string,
    data: Partial<Subtitle>,
  ) => {
    // Store the original subtitle for rollback if needed
    const originalSubtitle = exhibit?.subtitles?.find(
      (s) => s.subtitleId === subtitleId,
    );

    try {
      const { data: responseData } = await apiPrivate.put(
        `/subtitle/${subtitleId}`,
        {
          text: data.subtitleText,
          languageCode: data.languageCode,
          audioId: data.audioId,
        },
      );

      // Only update the state after successful API call
      setExhibit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtitles:
            prev.subtitles?.map((s) =>
              s.subtitleId === subtitleId ? { ...s, ...responseData.data } : s,
            ) || [],
        };
      });
    } catch (error) {
      console.error('Subtitle update failed:', error);
      // Log more details for debugging
      if (isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          subtitleId,
          updateData: data,
        });
      }
      throw error;
    }
  };

  const handleSubtitleAdd = async (data: SubtitleFormData) => {
    try {
      const { data: responseData } = await apiPrivate.post('/subtitle', {
        text: data.text,
        languageCode: data.languageCode,
        audioId: data.audioId,
        exhibitId: exhibit?.exhibitId, // Add exhibitId to link subtitle to exhibit
      });

      // Update the exhibit state with the new subtitle
      setExhibit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtitles: [...(prev.subtitles || []), responseData.data],
        };
      });
    } catch (error) {
      console.error('Subtitle add failed:', error);
      // Log more details for debugging
      if (isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          exhibitId: exhibit?.exhibitId,
          addData: data,
        });
      }
      throw error;
    }
  };

  const handleSubtitleDelete = async (subtitleId: string) => {
    try {
      await apiPrivate.delete(`/subtitle/hard-delete/${subtitleId}`);

      // Update the exhibit state by removing the deleted subtitle
      setExhibit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtitles:
            prev.subtitles?.filter((s) => s.subtitleId !== subtitleId) || [],
        };
      });
    } catch (error) {
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
        <div className='w-full items-center justify-center flex flex-col md:flex-row gap-6'>
          <ExhibitMetadata
            exhibit={exhibit}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onUpdate={handleUpdateExhibit}
          />
          <ExhibitQrCard
            qrCode={qrCode}
            exhibitId={exhibit.exhibitId}
            setQrCode={setQrCode}
          />
        </div>
        <div className='w-full flex flex-col gap-8'>
          <div>
            <h3 className='text-xl font-semibold mb-4'>Subtitle Management</h3>
            <SubtitleManagementSection
              subtitles={exhibit.subtitles || []}
              onSubtitleUpdate={handleSubtitleUpdate}
              onSubtitleAdd={handleSubtitleAdd}
              onSubtitleDelete={handleSubtitleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
