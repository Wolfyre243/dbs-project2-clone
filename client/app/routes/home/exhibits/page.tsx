import { Sparkles, QrCode, Smartphone, MapPin, Smile } from 'lucide-react';
import { AppBar } from '~/components/app-bar';

export default function ExhibitInstructionsPage() {
  return (
    <>
      <AppBar />
      <div className='w-full min-h-screen bg-gradient-to-br from-[#f7fafc] via-[#e3f6fd] to-[#f7fafc] flex flex-col items-center justify-center'>
        <div className='max-w-2xl w-full bg-white/80 rounded-3xl shadow-xl p-8 flex flex-col items-center border border-[#e0e7ef]'>
          <div className='flex items-center gap-3 mb-4'>
            <Sparkles className='h-8 w-8 text-[#e63946]' />
            <h1 className='text-3xl font-extrabold text-[#1d3557] tracking-tight'>
              Welcome to the QR Exhibit Experience!
            </h1>
          </div>
          <p className='text-lg text-[#457b9d] mb-6 text-center'>
            Discover, learn, and interact with exhibits around the centre using
            your mobile device and QR codes.
          </p>
          <div className='flex flex-col gap-8 w-full'>
            <div className='flex items-center gap-4'>
              <QrCode className='h-10 w-10 text-[#457b9d]' />
              <div>
                <div className='font-semibold text-[#1d3557]'>
                  Look for QR Codes
                </div>
                <div className='text-[#457b9d] text-sm'>
                  Find QR codes displayed at various exhibits throughout the
                  centre.
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Smartphone className='h-10 w-10 text-[#e63946]' />
              <div>
                <div className='font-semibold text-[#1d3557]'>
                  Scan with Your Phone
                </div>
                <div className='text-[#457b9d] text-sm'>
                  Use your phone's camera or a QR code scanning app to scan the
                  code.
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <MapPin className='h-10 w-10 text-[#f4a261]' />
              <div>
                <div className='font-semibold text-[#1d3557]'>
                  Instant Exhibit Info
                </div>
                <div className='text-[#457b9d] text-sm'>
                  Instantly access detailed information, audio guides, and
                  interactive content about the exhibit.
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Smile className='h-10 w-10 text-[#2a9d8f]' />
              <div>
                <div className='font-semibold text-[#1d3557]'>
                  Enjoy & Explore
                </div>
                <div className='text-[#457b9d] text-sm'>
                  Enjoy a seamless, multilingual, and accessible experience
                  designed for everyone.
                </div>
              </div>
            </div>
          </div>
          <div className='mt-10 text-center text-[#1d3557] font-medium'>
            <span className='bg-[#e3f6fd] px-4 py-2 rounded-full shadow text-[#e63946]'>
              <span className='font-bold'>Tip:</span> Singapore's vibrant
              culture is just a scan away!
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
