import React, { useState, useEffect, useRef } from 'react';

// Define TypeScript interfaces
interface Subtitle {
  subtitleId: string;
  subtitleText: string;
  languageCode: string;
  startTime?: number;
  endTime?: number;
}

const AudioPlayer: React.FC = () => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitleId, setCurrentSubtitleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSpokenId = useRef<string | null>(null);

  // Hardcoded audio data (replace with dynamic URL from API if needed)
  // TODO: Add API call or route to fetch audioData dynamically (e.g., from a server endpoint)
  const audioData = {
    fileLink: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Using fallback as hardcoded audio
    languageCode: 'en-US',
  };

  // Hardcoded subtitles with longer text
  // TODO: Add API call or route to fetch subtitles dynamically (e.g., /api/subtitles)
  useEffect(() => {
    const mockSubtitles: Subtitle[] = [
      {
        subtitleId: '1',
        subtitleText: 'testing',
        languageCode: 'en-US',
      },
      {
        subtitleId: '2',
        subtitleText: 'This is an example subtitle that is also quite long. It includes more information to test the limits of the display area and the speech synthesis capabilities. We might talk about the weather, the time, or even a short story about a journey through a forest on a sunny day, with birds chirping and a gentle breeze.',
        languageCode: 'en-US',
      },
    ];
    setSubtitles(mockSubtitles);
  }, []);

  // Estimate subtitle timings based on hardcoded audio duration
  // TODO: Adjust timing logic if audio duration is fetched dynamically
  useEffect(() => {
    if (audioRef.current && subtitles.length > 0) {
      const handleMetadata = () => {
        if (audioRef.current) {
          const duration = audioRef.current.duration;
          if (!isFinite(duration)) {
            setError('Failed to load audio duration.');
            return;
          }
          const estimatedSubtitles = subtitles.map((subtitle, index) => ({
            ...subtitle,
            startTime: (index * duration) / subtitles.length,
            endTime: ((index + 1) * duration) / subtitles.length,
          }));
          setSubtitles(estimatedSubtitles);
        }
      };

      audioRef.current.onloadedmetadata = handleMetadata;
    }
  }, [subtitles]);

  // Highlight and speak subtitles during playback
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const active = subtitles.find(
        (sub) =>
          sub.startTime !== undefined &&
          sub.endTime !== undefined &&
          sub.startTime <= currentTime &&
          sub.endTime > currentTime
      );

      if (active && active.subtitleId !== lastSpokenId.current) {
        setCurrentSubtitleId(active.subtitleId);
        lastSpokenId.current = active.subtitleId;
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(active.subtitleText);
          utterance.lang = active.languageCode;
          utterance.rate = 1;
          utterance.onend = () => {
            lastSpokenId.current = null;
          };
          window.speechSynthesis.speak(utterance);
        }
      } else if (!active && lastSpokenId.current) {
        setCurrentSubtitleId(null);
        lastSpokenId.current = null;
        window.speechSynthesis.cancel();
      }
    }
  };

  // Stop speech when audio pauses or ends
  const handlePauseOrEnd = () => {
    if (audioRef.current) {
      setCurrentSubtitleId(null);
      lastSpokenId.current = null;
      window.speechSynthesis.cancel();
    }
  };

  // Handle audio errors with hardcoded fallback
  // TODO: Remove hardcoded fallback and add route to fetch fallback URL if needed
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
        Audio Player with Subtitles
      </h2>
      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
      <audio
        ref={audioRef}
        controls
        style={{ width: '100%', marginBottom: '16px' }}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePauseOrEnd}
        onEnded={handlePauseOrEnd}
        onError={handleAudioError}
      >
        <source src={audioData.fileLink} type="audio/mp3" />
        {subtitles.length > 0 && (
          <track kind="subtitles" src={generateVTT()} srcLang={audioData.languageCode} default />
        )}
        Your browser does not support the audio element.
      </audio>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
        Welcome to SDC!
      </h3>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        {subtitles.length > 0 ? (
          subtitles.map((sub) => (
            <p
              key={sub.subtitleId}
              style={{
                padding: '10px',
                margin: '5px 0',
                borderRadius: '3px',
                backgroundColor: sub.subtitleId === currentSubtitleId ? '#ffeeba' : 'transparent',
                fontWeight: sub.subtitleId === currentSubtitleId ? 'bold' : 'normal',
                whiteSpace: 'pre-wrap', // Allows text to wrap and display fully
              }}
            >
              {sub.subtitleText} ({sub.languageCode})
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