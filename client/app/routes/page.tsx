import { AppBar } from '~/components/app-bar';

export default function LandingPage() {
  return (
    <main className='h-screen w-full flex flex-col justify-center'>
      <AppBar />
      <section className='flex flex-col h-full w-full items-center justify-start py-8'>
        <h1>Hello World</h1>
      </section>
    </main>
  );
}
