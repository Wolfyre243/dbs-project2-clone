import { useState, useRef } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { LanguageSelect } from '~/components/language-select';
import { apiPrivate } from '~/services/api';
import {
  Trash2,
  Plus,
  Play,
  Loader2,
  AlertCircle,
  Upload,
  UploadCloud,
  LoaderCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SubtitleItem {
  text: string;
  languageCode: string;
  subtitleId: string;
  audioId: string;
  fileLink: string;
}

interface SubtitleFormData {
  text: string;
  languageCode: string;
  audioId?: string;
  fileLink?: string;
  isGenerating?: boolean;
}

interface AssetData {
  subtitleIds: string[];
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

function SubtitlePreviewCard({
  key,
  subtitle,
  removeCb,
}: {
  key: number;
  subtitle: SubtitleItem;
  removeCb: (subtitleId: string) => void;
}) {
  return (
    <div key={subtitle.subtitleId} className='space-y-4 p-4 border rounded-lg'>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium'>{subtitle.languageCode}</h3>
        <Button
          variant='outline'
          size='sm'
          onClick={() => removeCb(subtitle.subtitleId)}
          className='text-red-600 hover:text-red-700'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <div className='space-y-2'>
        {/* Subtitle Text */}
        <div className='space-y-2'>
          <p>{subtitle.text}</p>
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        {subtitle.fileLink && (
          <div className='flex-1 flex items-center gap-2'>
            <audio
              key={subtitle.audioId || subtitle.fileLink}
              controls
              className='w-full'
            >
              <source
                src={`${subtitle.fileLink}?t=${subtitle.audioId}`}
                type='audio/wav'
              />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {subtitle.audioId && (
          <div className='text-xs text-muted-foreground'>
            Audio ID: {subtitle.audioId}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TourEditorCreateExhibitPage() {
  const [exhibitMetadata, setExhibitMetadata] = useState<ExhibitMetadata>({
    title: '',
    description: '',
  });
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCreatingSubtitle, setIsCreatingSubtitle] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Drag and drop handlers
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
    setExhibitMetadata((prev) => ({
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
    setExhibitMetadata((prev) => ({
      ...prev,
      imageId,
      imageLink,
    }));
  };

  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);

    try {
      // Example: upload to /upload/image endpoint (adjust as needed)
      const formData = new FormData();
      formData.append('image', file);
      // You may need to adjust the endpoint to match your backend
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
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      await apiPrivate.delete(`/image/hard-delete/${exhibitMetadata.imageId}`);
      setExhibitMetadata({
        ...exhibitMetadata,
        imageId: undefined,
        imageLink: undefined,
      });

      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete audio');
    }
  };

  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [subtitleFormData, setSubtitleFormData] = useState<SubtitleFormData>({
    text: '',
    languageCode: '',
    isGenerating: false,
  });
  const [isCreatingExhibit, setIsCreatingExhibit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  // Ref for audio file input
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Handle audio file upload
  const handleAudioFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'audio/wav' && !file.name.endsWith('.wav')) {
      toast.error('Please upload a .wav audio file');
      return;
    }
    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('languageCode', subtitleFormData.languageCode);

      // Remove Content-Type header to let browser set it (fixes many upload issues)
      const { data: responseData } = await apiPrivate.post(
        '/audio/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const { audioId, fileLink } = responseData.data;
      setSubtitleFormData({
        ...subtitleFormData,
        audioId,
        fileLink,
        isGenerating: false,
      });
      toast.success('Audio uploaded successfully!');
    } catch (err: any) {
      toast.error(
        'Failed to upload audio: ' + (err.response?.data?.message || ''),
      );
    } finally {
      setIsUploadingAudio(false);
      // Reset input value so same file can be re-uploaded if needed
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  // Validation constants
  const VALIDATION_LIMITS = {
    EXHIBIT_NAME_MIN: 3,
    EXHIBIT_NAME_MAX: 100,
    EXHIBIT_DESCRIPTION_MIN: 10,
    EXHIBIT_DESCRIPTION_MAX: 500,
    EXHIBIT_LOCATION_MIN: 3,
    EXHIBIT_LOCATION_MAX: 100,
    SUBTITLE_TEXT_MIN: 5,
    SUBTITLE_TEXT_MAX: 1000,
  };

  // Validation functions
  const validateExhibitMetadata = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate exhibit name
    if (!exhibitMetadata.title.trim()) {
      errors.exhibitName = 'Exhibit name is required';
    } else if (
      exhibitMetadata.title.trim().length < VALIDATION_LIMITS.EXHIBIT_NAME_MIN
    ) {
      errors.exhibitName = `Exhibit name must be at least ${VALIDATION_LIMITS.EXHIBIT_NAME_MIN} characters`;
    } else if (
      exhibitMetadata.title.trim().length > VALIDATION_LIMITS.EXHIBIT_NAME_MAX
    ) {
      errors.exhibitName = `Exhibit name must not exceed ${VALIDATION_LIMITS.EXHIBIT_NAME_MAX} characters`;
    }

    // Validate exhibit description
    if (!exhibitMetadata.description.trim()) {
      errors.exhibitDescription = 'Exhibit description is required';
    } else if (
      exhibitMetadata.description.trim().length <
      VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MIN
    ) {
      errors.exhibitDescription = `Description must be at least ${VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MIN} characters`;
    } else if (
      exhibitMetadata.description.trim().length >
      VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX
    ) {
      errors.exhibitDescription = `Description must not exceed ${VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX} characters`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSubtitleText = (text: string): string | null => {
    if (!text.trim()) {
      return 'Subtitle text is required';
    } else if (text.trim().length < VALIDATION_LIMITS.SUBTITLE_TEXT_MIN) {
      return `Subtitle text must be at least ${VALIDATION_LIMITS.SUBTITLE_TEXT_MIN} characters`;
    } else if (text.trim().length > VALIDATION_LIMITS.SUBTITLE_TEXT_MAX) {
      return `Subtitle text must not exceed ${VALIDATION_LIMITS.SUBTITLE_TEXT_MAX} characters`;
    }
    return null;
  };

  // Add a new subtitle item (local only, not yet created on backend)
  const addSubtitle = async () => {
    // Prevent duplicate language subtitles
    if (
      subtitles.some((s) => s.languageCode === subtitleFormData.languageCode)
    ) {
      toast.error('This language already has a subtitle.');
      return;
    }

    if (!subtitleFormData.audioId && !subtitleFormData.fileLink) {
      // console.log('No audio file selected');
      toast.error('No audio file selected!');
      return;
    }

    setIsCreatingSubtitle(true);
    try {
      const { data: responseData } = await apiPrivate.post('/subtitle', {
        ...subtitleFormData,
      });

      setSubtitles((prev) => [
        ...prev,
        {
          text: subtitleFormData.text,
          languageCode: subtitleFormData.languageCode,
          audioId: subtitleFormData.audioId as string,
          fileLink: subtitleFormData.fileLink as string,
          subtitleId: responseData.data.subtitleId,
        },
      ]);

      // Reset data
      setSubtitleFormData({
        text: '',
        languageCode: '',
        audioId: undefined,
        fileLink: undefined,
        isGenerating: undefined,
      });
    } catch (error) {
      console.error('Error creating subtitle: ', error);
      toast.error('Failed to create subtitle');
    } finally {
      setIsCreatingSubtitle(false);
    }
  };

  // Remove a subtitle item and delete its audio/subtitle if present
  const removeSubtitle = async (id: string) => {
    const subtitle = subtitles.find((s) => s.subtitleId === id);
    if (!subtitle) return;

    // Delete subtitle from backend if it has a backend id (assume not a temp id)
    if (subtitle.subtitleId) {
      try {
        await apiPrivate.delete(`/subtitle/hard-delete/${subtitle.subtitleId}`);
      } catch (err) {
        console.warn('Failed to delete subtitle from backend:', err);
      }
    }
    setSubtitles((prev) =>
      prev.filter((subtitle) => subtitle.subtitleId !== id),
    );
  };

  // Update subtitle text
  // const updateSubtitleText = (id: string, text: string) => {
  //   setSubtitles((prev) =>
  //     prev.map((subtitle) =>
  //       subtitle.subtitleId === id ? { ...subtitle, text } : subtitle,
  //     ),
  //   );

  //   // Validate and update errors
  //   const error = validateSubtitleText(text);
  //   setValidationErrors((prev) => {
  //     const newErrors = { ...prev };
  //     if (error) {
  //       newErrors[`subtitle-${id}`] = error;
  //     } else {
  //       delete newErrors[`subtitle-${id}`];
  //     }
  //     return newErrors;
  //   });
  // };

  // Update subtitle language
  // const updateSubtitleLanguage = (id: string, languageCode: string) => {
  //   setSubtitles((prev) =>
  //     prev.map((subtitle) =>
  //       subtitle.subtitleId === id ? { ...subtitle, languageCode } : subtitle,
  //     ),
  //   );
  // };

  // Generate TTS audio for a subtitle

  const generateAudio = async () => {
    // let subtitle = subtitles.find((s) => s.id === subtitleId);
    const subtitle = subtitleFormData;
    if (!subtitle || !subtitle.text.trim() || !subtitle.languageCode) {
      toast.error('Please enter subtitle text and select a language');
      return;
    }

    // Set loading state
    // setSubtitles((prev) =>
    //   prev.map((s) => (s.id === subtitleId ? { ...s, isGenerating: true } : s)),
    // );
    setSubtitleFormData({ ...subtitleFormData, isGenerating: true });

    try {
      // Delete old audio if exists
      if (subtitle.audioId) {
        try {
          await apiPrivate.delete(`/audio/hard-delete/${subtitle.audioId}`);
        } catch (err) {
          console.warn('Failed to delete old audio:', err);
        }
      }

      const { data: responseData } = await apiPrivate.post('/audio/generate', {
        text: subtitle.text,
        languageCode: subtitle.languageCode,
      });

      // const generatedSubtitleId = responseData.data.subtitleId;

      const { audioId, fileLink } = responseData.data;
      setSubtitleFormData({
        ...subtitleFormData,
        audioId,
        fileLink,
        isGenerating: false,
      });

      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio');
      setSubtitleFormData({ ...subtitleFormData, isGenerating: false });
    }
  };

  const handleDeleteAudio = async () => {
    try {
      await apiPrivate.delete(`/audio/hard-delete/${subtitleFormData.audioId}`);
      setSubtitleFormData({
        ...subtitleFormData,
        audioId: undefined,
        fileLink: undefined,
      });

      toast.success('Audio deleted');
    } catch (err) {
      toast.error('Failed to delete audio');
    }
  };

  // Update exhibit metadata
  const updateExhibitMetadata = (
    field: keyof ExhibitMetadata,
    value: string,
  ) => {
    setExhibitMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create exhibit with all subtitle and audio data
  const createExhibit = async () => {
    // Validate exhibit metadata using validation function
    const isMetadataValid = validateExhibitMetadata();

    if (!isMetadataValid) {
      toast.error('Please fix the validation errors in exhibit information');
      return;
    }

    // Validate subtitles
    let hasSubtitleErrors = false;
    const subtitleErrors: ValidationErrors = {};

    subtitles.forEach((subtitle) => {
      const textError = validateSubtitleText(subtitle.text);
      if (textError) {
        subtitleErrors[`subtitle-${subtitle.subtitleId}`] = textError;
        hasSubtitleErrors = true;
      }

      if (!subtitle.languageCode) {
        subtitleErrors[`subtitle-${subtitle.subtitleId}-language`] =
          'Language is required';
        hasSubtitleErrors = true;
      }
    });

    setValidationErrors((prev) => ({ ...prev, ...subtitleErrors }));

    if (hasSubtitleErrors) {
      toast.error('Please fix the validation errors in subtitles');
      return;
    }

    // Check that all subtitles have generated audio
    const subtitlesWithoutAudio = subtitles.filter((s) => !s.audioId);
    if (subtitlesWithoutAudio.length > 0) {
      toast.error(
        'Please generate audio for all subtitles before creating the exhibit',
      );
      return;
    }

    const assetData: AssetData = {
      subtitleIds: subtitles.map((s) => s.subtitleId),
    };

    const exhibitData = {
      ...exhibitMetadata,
      assetData,
    };

    setIsCreatingExhibit(true);

    try {
      // Actual exhibit creation API call
      const response = await apiPrivate.post('/exhibit', exhibitData);

      toast.success('Exhibit created successfully!');

      // Reset form on success
      setExhibitMetadata({
        title: '',
        description: '',
      });
      setSubtitles([]);
      setValidationErrors({});
    } catch (error: any) {
      console.error('Error creating exhibit:', error);
      toast.error('Failed to create exhibit: ' + error.response?.data.message);
    } finally {
      setIsCreatingExhibit(false);
    }
  };

  return (
    <div className='min-h-full w-full'>
      {/* Header */}
      <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='px-6 py-6'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold'>Create Exhibit</h1>
            <p className='text-muted-foreground'>
              Create subtitles and generate audio for your exhibit
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className='flex flex-col w-full h-fit pb-20'>
        {/* First Row - Exhibit Information */}
        <div className='flex flex-col xl:flex-row w-full h-fit gap-5 p-6'>
          {/* Exhibit Metadata */}
          <div className='flex flex-col w-full min-h-full'>
            <Card className='h-full'>
              <CardHeader>
                <CardTitle>Exhibit Information</CardTitle>
                <CardDescription>
                  Basic information about the exhibit
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 h-full'>
                <div className='space-y-4'>
                  {/* Drag and Drop Image Upload moved to Image Upload Card */}
                  <div className='space-y-2 h-fit'>
                    <Label htmlFor='exhibit-name'>Exhibit Name *</Label>
                    <Input
                      id='exhibit-name'
                      placeholder='Enter exhibit name...'
                      value={exhibitMetadata.title}
                      onChange={(e) =>
                        updateExhibitMetadata('title', e.target.value)
                      }
                    />
                    <div className='text-xs text-muted-foreground'>
                      {exhibitMetadata.title.length}/
                      {VALIDATION_LIMITS.EXHIBIT_NAME_MAX} characters
                    </div>
                    {validationErrors.exhibitName && (
                      <div className='flex items-center gap-2 text-sm text-red-600'>
                        <AlertCircle className='h-4 w-4' />
                        {validationErrors.exhibitName}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2 h-full'>
                    <Label htmlFor='exhibit-description'>Description *</Label>
                    <Textarea
                      id='exhibit-description'
                      placeholder='Enter exhibit description...'
                      value={exhibitMetadata.description}
                      onChange={(e) =>
                        updateExhibitMetadata('description', e.target.value)
                      }
                      className='flex flex-col h-full'
                    />
                    <div className='text-xs text-muted-foreground'>
                      {exhibitMetadata.description.length}/
                      {VALIDATION_LIMITS.EXHIBIT_DESCRIPTION_MAX} characters
                    </div>
                    {validationErrors.exhibitDescription && (
                      <div className='flex items-center gap-2 text-sm text-red-600'>
                        <AlertCircle className='h-4 w-4' />
                        {validationErrors.exhibitDescription}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Exhibit Image Upload */}
          <div className='flex flex-col w-full min-h-full'>
            <Card className='h-full'>
              <CardHeader>
                <CardTitle>Image Upload</CardTitle>
                <CardDescription>
                  Upload an image as the exhibit's featured photo
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 h-full'>
                <div className='space-y-4 h-full'>
                  {/* Show preview and remove button if image is uploaded */}
                  {exhibitMetadata.imageLink ? (
                    <div className='flex flex-col items-center'>
                      <img
                        src={exhibitMetadata.imageLink}
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
                      className={`flex min-h-full border-2 border-dashed rounded-md p-4 flex-col items-center justify-center cursor-pointer transition-colors ${isUploadingImage ? 'opacity-50' : 'hover:border-primary'}`}
                      // style={{ minHeight: 150 }}
                      onClick={() =>
                        document.getElementById('exhibit-image-input')?.click()
                      }
                    >
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row - Subtitle & Audio Management */}
        <div className='flex flex-col w-full h-fit px-6'>
          <div className='w-full'>
            <Card className='h-fit'>
              <CardHeader>
                <CardTitle>Subtitle & Audio Management</CardTitle>
                <CardDescription>
                  Add subtitles in different languages and generate TTS audio
                  previews
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Create Subtitle Form */}
                <div className='flex flex-col gap-4'>
                  <h1 className='text-md font-semibold'>Add Subtitle</h1>

                  {/* Subtitle Text & Language */}
                  <div className='space-y-4'>
                    {/* TODO: Add checks to ensure language isnt repeated */}
                    <div className='space-y-2'>
                      <Label>Language *</Label>
                      <LanguageSelect
                        fieldName={`languageCode`}
                        value={subtitleFormData.languageCode}
                        onValueChange={(languageCode) =>
                          setSubtitleFormData({
                            ...subtitleFormData,
                            languageCode,
                          })
                        }
                        placeholder='Select language'
                        disabledLanguageCodes={subtitles.map(
                          (s) => s.languageCode,
                        )}
                      />
                    </div>
                    {/* Subtitle Text */}
                    <div className='space-y-2'>
                      <Label htmlFor={`subtitle-text`}>Subtitle Text *</Label>
                      <Textarea
                        placeholder='Enter subtitle text...'
                        value={subtitleFormData.text}
                        onChange={(e) =>
                          // updateSubtitleText(subtitle.id, e.target.value)
                          setSubtitleFormData({
                            ...subtitleFormData,
                            text: e.target.value,
                          })
                        }
                      />
                      <div className='text-xs text-muted-foreground'>
                        {subtitleFormData.text.length}/
                        {VALIDATION_LIMITS.SUBTITLE_TEXT_MAX} characters
                      </div>
                      {/* TODO: LOW | Fix validation methods */}
                      {validationErrors[`subtitle-0`] && (
                        <div className='flex items-center gap-2 text-sm text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {validationErrors[`subtitle-0`]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio Buttons */}
                  <div className='flex flex-col gap-1'>
                    <div className='flex flex-row items-start gap-4'>
                      {/* Generate TTS */}
                      <Button
                        onClick={() => generateAudio()}
                        disabled={
                          !subtitleFormData.text.trim() ||
                          !subtitleFormData.languageCode ||
                          subtitleFormData.isGenerating ||
                          isUploadingAudio
                        }
                      >
                        {subtitleFormData.isGenerating ? (
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
                      {/* Upload Custom Audio */}
                      <div>
                        <input
                          type='file'
                          accept='.wav,audio/wav'
                          ref={audioInputRef}
                          className='hidden'
                          onChange={handleAudioFileChange}
                          disabled={
                            Boolean(subtitleFormData.audioId) ||
                            subtitleFormData.isGenerating ||
                            !Boolean(subtitleFormData.languageCode) ||
                            isUploadingAudio
                          }
                        />
                        <Button
                          type='button'
                          onClick={() => audioInputRef.current?.click()}
                          disabled={
                            Boolean(subtitleFormData.audioId) ||
                            subtitleFormData.isGenerating ||
                            !Boolean(subtitleFormData.languageCode) ||
                            isUploadingAudio
                          }
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
                      </div>

                      {/* Delete Audio */}
                      {subtitleFormData.audioId && (
                        <Button
                          variant='destructive'
                          size='icon'
                          title='Delete Audio'
                          onClick={handleDeleteAudio}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    {!subtitleFormData.audioId && (
                      <p className={`text-muted-foreground/60 text-xs`}>
                        Accepted file types: .wav
                      </p>
                    )}
                  </div>

                  {/* Audio Preview */}
                  <div className='flex flex-col gap-1'>
                    {subtitleFormData.fileLink && (
                      <div className='flex-1 flex items-center gap-2'>
                        <audio
                          key={
                            subtitleFormData.audioId ||
                            subtitleFormData.fileLink
                          }
                          controls
                          className='w-full'
                        >
                          <source
                            src={`${subtitleFormData.fileLink}?t=${subtitleFormData.audioId}`}
                            type='audio/wav'
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {subtitleFormData.audioId && (
                      <div className='text-xs text-muted-foreground/60'>
                        Audio ID: {subtitleFormData.audioId}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={addSubtitle}
                    disabled={
                      !subtitleFormData.text.trim() ||
                      !subtitleFormData.languageCode ||
                      subtitleFormData.isGenerating ||
                      !subtitleFormData.audioId ||
                      isCreatingSubtitle
                    }
                  >
                    {isCreatingSubtitle ? (
                      <>
                        <LoaderCircle className='animate-spin' />
                        Creating Subtitle...
                      </>
                    ) : (
                      <>
                        <Plus />
                        Create Subtitle
                      </>
                    )}
                  </Button>
                </div>

                {/* Turn into component */}
                {subtitles.map((subtitle, index) => (
                  <SubtitlePreviewCard
                    key={index + 1}
                    subtitle={subtitle}
                    removeCb={removeSubtitle}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className='fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='px-6 py-4'>
          <div className='flex justify-end'>
            <Button
              onClick={createExhibit}
              disabled={
                isCreatingExhibit ||
                subtitles.every((s) => !s.audioId) ||
                !exhibitMetadata.title.trim() ||
                !exhibitMetadata.description.trim() ||
                !exhibitMetadata.imageLink
              }
              size='lg'
            >
              {isCreatingExhibit ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Creating Exhibit...
                </>
              ) : (
                'Create Exhibit'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
