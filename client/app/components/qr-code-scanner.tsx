import { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

export function QRScanner() {
  const videoElementRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video: HTMLVideoElement | null = videoElementRef.current;
    if (!video) {
      console.error('Video element not found');
      return;
    }

    const qrScanner = new QrScanner(
      video,
      (result: { data: string }) => {
        console.log('decoded qr code:', result);
        window.location.href = result.data;
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    );
    qrScanner.start();

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
  }, []);

  return (
    <div className='relative flex flex-row justify-center w-80 h-80 overflow-hidden rounded-xl shadow-md'>
      <video
        className='flex w-full h-full object-cover aspect-square'
        ref={videoElementRef}
      />
    </div>
  );
}
