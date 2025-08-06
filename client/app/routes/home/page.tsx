import {
  UserAudioCompletionRate,
  UserAudioPlayCount,
  UserExhibitProgress,
  UserExhibitsDiscovered,
  UserFavouriteExhibits,
  UserQRCodeScanCount,
  UserRecentActivity,
  UserTopVisitedExhibit,
} from '~/components/user-statistics';

export default function HomePage() {
  return (
    <main className='flex flex-col min-h-full w-full items-center justify-start gap-10 py-8 px-6'>
      <section className='w-full flex flex-col md:flex-row gap-5'>
        <div className='flex flex-col justify-between h-90 w-full md:w-2/3 p-6 rounded-xl bg-scenery-dimmed'>
          <div className='flex flex-col gap-2 text-white'>
            <h1 className='text-5xl font-bold'>Hello!</h1>
            <p className='text-2xl font-semibold'>
              Take a look at your SDC journey so far!
            </p>
          </div>
          <div className='text-white'>
            <UserTopVisitedExhibit />
          </div>
        </div>

        <div className='flex flex-col w-full md:w-1/3 gap-5 justify-between'>
          <div className='flex flex-col text-white h-full shadow-lg bg-red-400 rounded-xl p-4'>
            <h1 className='text-xl font-bold'>Exhibits Visited</h1>
            <div className='flex flex-row h-full gap-1 items-center'>
              <UserQRCodeScanCount />
              <UserExhibitsDiscovered />
            </div>
            <UserExhibitProgress />
          </div>

          <div className='flex flex-col h-full bg-accent shadow-lg rounded-xl p-4'>
            <h1 className='text-xl font-bold'>Audio Playback</h1>
            <div className='flex flex-row h-full gap-1 items-center'>
              <UserAudioCompletionRate />
              <UserAudioPlayCount />
            </div>
          </div>
        </div>
      </section>

      {/* Favourites */}
      <section className='w-full flex flex-col md:flex-row gap-5'>
        <div className='flex flex-col gap-3 w-full md:w-1/4'>
          <h1 className='text-2xl font-bold'>Your Activity</h1>
          <UserRecentActivity />
        </div>
        <div className='flex flex-col gap-3 w-full md:w-3/4'>
          <h1 className='text-2xl font-bold'>Favourite Exhibits</h1>
          <UserFavouriteExhibits />
        </div>
      </section>

      {/* Latest Events */}
      <section className='w-full flex flex-row gap-5'>
        <h1 className='text-2xl font-bold'>Latest Happenings</h1>
        <div></div>
      </section>
    </main>
  );
}

// Minimal stat card component
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className='flex flex-col items-center bg-[#ffe5e9] rounded-lg px-4 py-3 border border-[#f7cad0] min-w-[90px]'>
      <div>{icon}</div>
      <div className='font-bold text-[#e63946] text-lg'>{value}</div>
      <div className='text-xs text-[#1d3557]'>{label}</div>
    </div>
  );
}
