import { useIsMobile } from '~/hooks/use-mobile';
import { useState } from 'react';
import { QRScanner } from '~/components/qr-code-scanner';
import { CameraOff } from 'lucide-react';

export default function QRCodeScannerPage() {
  const isMobile = useIsMobile();
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (err: any, result: any) => {
    if (result) {
      window.location.href = result;
    } else {
      setError('Invalid QR Code');
    }
  };

  if (!isMobile) {
    return (
      <div className='flex flex-col min-h-full w-full items-center justify-start gap-10 py-8 px-6'>
        <h1 className='text-2xl font-bold'>SDC QR Scanner</h1>
        <CameraOff className='size-10' />
        <h1 className='text-2xl font-bold'>
          Please use your mobile device instead!
        </h1>
        <p>
          Scan QR Codes around the Exhibits Gallery Tour to learn more about
          Singapore's history!
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-full w-full items-center justify-start gap-10 py-8 px-6'>
      <h1 className='text-2xl font-bold'>SDC QR Scanner</h1>

      <QRScanner />

      <h1 className='text-lg font-semibold'>
        Scan QR Codes around the Exhibits Gallery Tour to learn more about
        Singapore's history!
      </h1>
      <p>Require assistance? Approach our friendly staff!</p>
    </div>
  );
}
