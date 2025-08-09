import React, { useState, useEffect, useRef } from 'react';

// Define TypeScript interfaces
interface Subtitle {
  subtitleId: string;
  subtitleText: string;
  startTime?: number;
  endTime?: number;
}

const AudioPlayer: React.FC = () => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitleId, setCurrentSubtitleId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSpokenId = useRef<string | null>(null);

  // Hardcoded audio data with new file link
  // Add API call or route to fetch audioData dynamically (e.g., from a server endpoint)
  const audioData = {
    fileLink:
      'https://pygnekejfoydmllojohm.supabase.co/storage/v1/object/public/uploads/audio/1753374366112-3446f88c-output.wav', // New hardcoded audio file
    languageCode: 'en', // Added language code for subtitles track
  };

  // Hardcoded subtitles synchronized with the new audio, split into 8-word segments
  // Add API call or route to fetch subtitles dynamically (e.g., /api/subtitles)
  useEffect(() => {
    const fullText =
      'Gear up with your family and friends for an adrenaline rush and heart-stopping adventure as many surprises await you in the most immersive laser tag arena in Singapore';
    const words = fullText.split(' ');
    const mockSubtitles: Subtitle[] = [];
    for (let i = 0; i < words.length; i += 8) {
      const segment = words.slice(i, i + 8).join(' ');
      mockSubtitles.push({
        subtitleId: `${i / 8 + 1}`, // Unique ID for each 8-word segment
        subtitleText: segment,
      });
    }
    setSubtitles(mockSubtitles);
  }, []);

  // Estimate subtitle timings based on hardcoded audio duration
  // Adjust timing logic if audio duration is fetched dynamically
  useEffect(() => {
    if (audioRef.current && subtitles.length > 0) {
      const handleMetadata = () => {
        if (audioRef.current) {
          const duration = audioRef.current.duration;
          if (!isFinite(duration)) {
            setError('Failed to load audio duration.');
            return;
          }
          const segmentDuration = duration / subtitles.length; // Divide duration by number of 8-word segments
          const estimatedSubtitles = subtitles.map((subtitle, index) => ({
            ...subtitle,
            startTime: index * segmentDuration, // Start time for each segment
            endTime: (index + 1) * segmentDuration, // End time for each segment
          }));
          setSubtitles(estimatedSubtitles);
        }
      };

      audioRef.current.onloadedmetadata = handleMetadata;
    }
  }, [subtitles]);

  // Highlight subtitles during playback (speech synthesis removed)
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const active = subtitles.find(
        (sub) =>
          sub.startTime !== undefined &&
          sub.endTime !== undefined &&
          sub.startTime <= currentTime &&
          sub.endTime > currentTime,
      );

      if (active && active.subtitleId !== lastSpokenId.current) {
        setCurrentSubtitleId(active.subtitleId);
        lastSpokenId.current = active.subtitleId;
      } else if (!active && lastSpokenId.current) {
        setCurrentSubtitleId(null);
        lastSpokenId.current = null;
      }
    }
  };

  // Stop highlighting when audio pauses or ends
  const handlePauseOrEnd = () => {
    if (audioRef.current) {
      setCurrentSubtitleId(null);
      lastSpokenId.current = null;
    }
  };

  // Handle audio errors with hardcoded fallback
  // Remove hardcoded fallback and add route to fetch fallback URL if needed
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (audioRef.current) {
      const errorMessage = audioRef.current.error?.message || 'Unknown error';
      console.error('Audio error details:', errorMessage, e);
      setError(`Audio playback error: ${errorMessage}`);
    }
  };

  // Generate WebVTT for subtitles
  const generateVTT = () => {
    let vttContent = 'WEBVTT\n\n';
    subtitles.forEach((subtitle, index) => {
      if (subtitle.startTime !== undefined && subtitle.endTime !== undefined) {
        const start = formatTime(subtitle.startTime);
        const end = formatTime(subtitle.endTime);
        vttContent += `${index + 1}\n${start} --> ${end}\n${subtitle.subtitleText}\n\n`;
      }
    });
    return URL.createObjectURL(new Blob([vttContent], { type: 'text/vtt' }));
  };

  // Format time for WebVTT (hh:mm:ss.sss)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.padStart(6, '0')}`;
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#e0e0e0',
        }}
      >
        Audio Player with Subtitles
      </h2>
      {error && (
        <p style={{ color: '#ff4444', marginBottom: '16px' }}>{error}</p>
      )}
      <audio
        ref={audioRef}
        controls
        style={{
          width: '100%',
          marginBottom: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        }}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePauseOrEnd}
        onEnded={handlePauseOrEnd}
        onError={handleAudioError}
      >
        <source src={audioData.fileLink} type='audio/wav' />
        {subtitles.length > 0 && (
          <track
            kind='subtitles'
            src={generateVTT()}
            srcLang={audioData.languageCode}
            default
          />
        )}
        Your browser does not support the audio element.
      </audio>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#a0dfff',
        }}
      >
        Welcome to SDC!
      </h3>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '15px',
          backgroundColor: '#000000', // Black background
          borderRadius: '10px',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)', // Subtle shadow for depth
        }}
      >
        {subtitles.length > 0 ? (
          subtitles.map((sub) => (
            <p
              key={sub.subtitleId}
              style={{
                padding: '12px',
                margin: '7px 0',
                borderRadius: '8px',
                background:
                  sub.subtitleId === currentSubtitleId
                    ? 'linear-gradient(90deg, #ffeb3b, #ffca28)' // Gradient from yellow to orange
                    : 'transparent',
                fontWeight:
                  sub.subtitleId === currentSubtitleId ? '500' : '300',
                whiteSpace: 'pre-wrap', // Allows text to wrap and display fully
                transition: 'all 0.3s ease', // Smooth transition for appealing effect
                boxShadow:
                  sub.subtitleId === currentSubtitleId
                    ? '0 2px 6px rgba(255, 215, 0, 0.4)'
                    : 'none', // Shadow on highlight
                color:
                  sub.subtitleId === currentSubtitleId ? '#1a1a1a' : '#ffffff', // Darker text on highlight for contrast
              }}
            >
              {sub.subtitleText}
            </p>
          ))
        ) : (
          <p>No subtitles available</p>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
