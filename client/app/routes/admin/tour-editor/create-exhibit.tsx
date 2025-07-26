import { useState } from 'react';
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
import { Trash2, Plus, Play, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubtitleItem {
  id: string;
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
  imageUrl?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function TourEditorCreateExhibitPage() {
  const [exhibitMetadata, setExhibitMetadata] = useState<ExhibitMetadata>({
    title: '',
    description: '',
    imageUrl: undefined,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Drag and drop handlers
  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Optionally: upload immediately
      // await uploadImage(file);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // await uploadImage(file);
    }
  };

  // const uploadImage = async (file: File) => {
  //   setIsUploadingImage(true);
  //   try {
  //     // Example: upload to /upload/image endpoint (adjust as needed)
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     // You may need to adjust the endpoint to match your backend
  //     const response = await apiPrivate.post('/upload/image', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     const url =
  //       response.data.url || response.data.fileUrl || response.data.fileLink;
  //     setExhibitMetadata((prev) => ({ ...prev, imageUrl: url }));
  //   } catch (err) {
  //     toast.error('Failed to upload image');
  //   } finally {
  //     setIsUploadingImage(false);
  //   }
  // };

  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [isCreatingExhibit, setIsCreatingExhibit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

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
  const addSubtitle = () => {
    setSubtitles((prev) => [
      ...prev,
      { id: `temp-${crypto.randomUUID()}`, text: '', languageCode: '' }, // temp id
    ]);
  };

  // Remove a subtitle item and delete its audio/subtitle if present
  const removeSubtitle = async (id: string) => {
    const subtitle = subtitles.find((s) => s.id === id);
    if (!subtitle) return;

    // Delete subtitle from backend if it has a backend id (assume not a temp id)
    if (subtitle.id && !subtitle.id.startsWith('temp-')) {
      try {
        await apiPrivate.delete(`/subtitle/hard-delete/${subtitle.id}`);
      } catch (err) {
        console.warn('Failed to delete subtitle from backend:', err);
      }
    }
    setSubtitles((prev) => prev.filter((subtitle) => subtitle.id !== id));
  };

  // Update subtitle text
  const updateSubtitleText = (id: string, text: string) => {
    setSubtitles((prev) =>
      prev.map((subtitle) =>
        subtitle.id === id ? { ...subtitle, text } : subtitle,
      ),
    );

    // Validate and update errors
    const error = validateSubtitleText(text);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[`subtitle-${id}`] = error;
      } else {
        delete newErrors[`subtitle-${id}`];
      }
      return newErrors;
    });
  };

  // Update subtitle language
  const updateSubtitleLanguage = (id: string, languageCode: string) => {
    setSubtitles((prev) =>
      prev.map((subtitle) =>
        subtitle.id === id ? { ...subtitle, languageCode } : subtitle,
      ),
    );
  };

  // Generate TTS audio for a subtitle
  const generateAudio = async (subtitleId: string) => {
    let subtitle = subtitles.find((s) => s.id === subtitleId);
    if (!subtitle || !subtitle.text.trim() || !subtitle.languageCode) {
      toast.error('Please enter subtitle text and select a language');
      return;
    }

    // Set loading state
    setSubtitles((prev) =>
      prev.map((s) => (s.id === subtitleId ? { ...s, isGenerating: true } : s)),
    );

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

      const generatedSubtitleId = responseData.data.subtitleId;

      // If subtitle does not have a backend id, create it first
      // if (!subtitle.id || subtitle.id.startsWith('temp-')) {
      // Update the subtitle in state with the backend id
      setSubtitles((prev) =>
        prev.map((s) =>
          s.id === subtitleId ? { ...s, id: generatedSubtitleId } : s,
        ),
      );
      subtitle = { ...subtitle, id: generatedSubtitleId };
      subtitleId = generatedSubtitleId;
      // }

      const { audioId, fileLink } = responseData.data;

      // Update subtitle with audio data
      setSubtitles((prev) =>
        prev.map((s) =>
          s.id === subtitleId
            ? { ...s, audioId, fileLink, isGenerating: false }
            : s,
        ),
      );

      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio');

      // Remove loading state
      setSubtitles((prev) =>
        prev.map((s) =>
          s.id === subtitleId ? { ...s, isGenerating: false } : s,
        ),
      );
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
        subtitleErrors[`subtitle-${subtitle.id}`] = textError;
        hasSubtitleErrors = true;
      }

      if (!subtitle.languageCode) {
        subtitleErrors[`subtitle-${subtitle.id}-language`] =
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
      subtitleIds: subtitles.map((s) => s.id),
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
                  {imagePreview || exhibitMetadata.imageUrl ? (
                    <div className='flex flex-col items-center'>
                      <img
                        src={imagePreview || exhibitMetadata.imageUrl}
                        alt='Exhibit'
                        className='max-h-80 object-contain mb-2 rounded'
                      />
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setExhibitMetadata((prev) => ({
                            ...prev,
                            imageUrl: undefined,
                          }));
                        }}
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
                        accept='image/*'
                        className='hidden'
                        onChange={handleImageChange}
                        disabled={isUploadingImage}
                      />
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
                {/* Turn into component */}
                {subtitles.map((subtitle, index) => (
                  <div
                    key={subtitle.id}
                    className='space-y-4 p-4 border rounded-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='font-medium'>Subtitle {index + 1}</h3>
                      {subtitles.length > 0 && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => removeSubtitle(subtitle.id)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>

                    <div className='space-y-4'>
                      {/* TODO: Add checks to ensure language isnt repeated */}
                      <div className='space-y-2'>
                        <Label>Language *</Label>
                        <LanguageSelect
                          fieldName={`language-${subtitle.id}`}
                          value={subtitle.languageCode}
                          onValueChange={(languageCode) =>
                            updateSubtitleLanguage(subtitle.id, languageCode)
                          }
                          placeholder='Select language'
                        />
                      </div>
                      {/* Subtitle Text */}
                      <div className='space-y-2'>
                        <Label htmlFor={`text-${subtitle.id}`}>
                          Subtitle Text *
                        </Label>
                        <Textarea
                          id={`text-${subtitle.id}`}
                          placeholder='Enter subtitle text...'
                          value={subtitle.text}
                          onChange={(e) =>
                            updateSubtitleText(subtitle.id, e.target.value)
                          }
                        />
                        <div className='text-xs text-muted-foreground'>
                          {subtitle.text.length}/
                          {VALIDATION_LIMITS.SUBTITLE_TEXT_MAX} characters
                        </div>
                        {validationErrors[`subtitle-${subtitle.id}`] && (
                          <div className='flex items-center gap-2 text-sm text-red-600'>
                            <AlertCircle className='h-4 w-4' />
                            {validationErrors[`subtitle-${subtitle.id}`]}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-4'>
                      <Button
                        onClick={() => generateAudio(subtitle.id)}
                        disabled={
                          !subtitle.text.trim() ||
                          !subtitle.languageCode ||
                          subtitle.isGenerating
                        }
                      >
                        {subtitle.isGenerating ? (
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

                      {subtitle.audioId && (
                        <Button
                          variant='destructive'
                          size='icon'
                          title='Delete Audio'
                          onClick={async () => {
                            try {
                              await apiPrivate.delete(
                                `/audio/hard-delete/${subtitle.audioId}`,
                              );
                              setSubtitles((prev) =>
                                prev.map((s) =>
                                  s.id === subtitle.id
                                    ? {
                                        ...s,
                                        audioId: undefined,
                                        fileLink: undefined,
                                      }
                                    : s,
                                ),
                              );
                              toast.success('Audio deleted');
                            } catch (err) {
                              toast.error('Failed to delete audio');
                            }
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>

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
                      <div className='text-sm text-muted-foreground'>
                        Audio ID: {subtitle.audioId}
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  onClick={addSubtitle}
                  variant='outline'
                  className='w-full'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Another Subtitle
                </Button>
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
                !exhibitMetadata.description.trim()
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
