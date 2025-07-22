import { AppBar } from '~/components/app-bar';
import { Button } from '~/components/ui/button';
import { ArrowRight, Play, Shield, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className='min-h-screen w-full flex flex-col'>
      <AppBar />
      {/* Hero Section */}
      <section className='relative h-screen flex items-center justify-center overflow-hidden'>
        {/* Redesigned Background */}
        <div className='absolute inset-0'>
          {/* Subtle animated gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/80 to-cyan-900/70 animate-gradient-x' />
          {/* Glassmorphism overlay */}
          <div className='absolute inset-0 bg-white/5 backdrop-blur-[2px]' />
        </div>

        {/* Hero Content */}
        <div className='relative z-10 text-center text-white px-6 max-w-6xl mx-auto'>
          {/* Welcome Badge */}
          <div className='inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8'>
            <Shield className='w-4 h-4 mr-2' />
            <span className='text-sm font-medium tracking-wide'>
              WELCOME TO
            </span>
          </div>

          {/* Main Heading */}
          <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight'>
            DISCOVER
            <br />
            <span className='bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent'>
              THE SINGAPORE
            </span>
            <br />
            STORY
          </h1>

          {/* Subheading */}
          <p className='text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed'>
            Step into an immersive journey through cutting-edge technology,
            interactive experiences, and groundbreaking discoveries that shape
            tomorrow.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
            <Button
              size='lg'
              className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
            >
              Start Your Journey
              <ArrowRight className='ml-2 w-5 h-5' />
            </Button>

            <Button
              size='lg'
              className='px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105'
            >
              <Play className='mr-2 w-5 h-5' />
              Watch Demo
            </Button>
          </div>

          {/* Stats/Features */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12'>
            <div className='text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4'>
                <Zap className='w-8 h-8 text-blue-400' />
              </div>
              <h3 className='text-2xl font-bold mb-2'>08</h3>
              <p className='text-gray-300'>Interactive Experiences</p>
            </div>

            <div className='text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4'>
                <Users className='w-8 h-8 text-cyan-400' />
              </div>
              <h3 className='text-2xl font-bold mb-2'>12</h3>
              <p className='text-gray-300'>Learning Programs</p>
            </div>

            <div className='text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4'>
                <Shield className='w-8 h-8 text-purple-400' />
              </div>
              <h3 className='text-2xl font-bold mb-2'>03</h3>
              <p className='text-gray-300'>Immersive Tours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Tour Examples Section */}
      <section className='relative w-full bg-background py-20 px-4 border-t border-border'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
            Audio Tour Highlights
          </h2>
          <p className='text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto'>
            Experience a preview of our immersive audio tours, designed to guide
            you through the stories and exhibits of the Singapore Discovery
            Centre.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Example 1 */}
            <div className='rounded-2xl bg-card shadow-lg border border-border p-6 flex flex-col items-center'>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                The Beginnings
              </h3>
              <p className='text-sm text-muted-foreground mb-4 text-center'>
                Discover the origins of Singapore and the pivotal moments that
                shaped our nation.
              </p>
              <audio controls className='w-full'>
                <source src='/audio/beginnings-sample.mp3' type='audio/mpeg' />
                Your browser does not support the audio element.
              </audio>
            </div>
            {/* Example 2 */}
            <div className='rounded-2xl bg-card shadow-lg border border-border p-6 flex flex-col items-center'>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                Defending Our Home
              </h3>
              <p className='text-sm text-muted-foreground mb-4 text-center'>
                Listen to stories of courage and innovation in Singapore's
                journey to safeguard its future.
              </p>
              <audio controls className='w-full'>
                <source src='/audio/defending-sample.mp3' type='audio/mpeg' />
                Your browser does not support the audio element.
              </audio>
            </div>
            {/* Example 3 */}
            <div className='rounded-2xl bg-card shadow-lg border border-border p-6 flex flex-col items-center'>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                Voices of the People
              </h3>
              <p className='text-sm text-muted-foreground mb-4 text-center'>
                Hear personal accounts and reflections from Singaporeans across
                generations.
              </p>
              <audio controls className='w-full'>
                <source src='/audio/voices-sample.mp3' type='audio/mpeg' />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      </section>

      {/* Membership & Benefits Section */}
      <section className='w-full bg-gradient-to-b from-background to-muted py-20 px-4 border-t border-border'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
            Become a Member
          </h2>
          <p className='text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto'>
            Join the SDC community and unlock exclusive benefits, discounts, and
            experiences for you and your family.
          </p>
          <div className='flex flex-col md:flex-row gap-8 justify-center'>
            <div className='flex-1 rounded-2xl bg-card shadow-lg border border-border p-8 flex flex-col items-center'>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                Annual Membership
              </h3>
              <ul className='text-muted-foreground text-sm mb-6 space-y-2 text-center'>
                <li>✔ Free admission to all exhibits</li>
                <li>✔ Complimentary audio tour access</li>
                <li>✔ Member-only events & workshops</li>
                <li>✔ Discounts at SDC cafe & gift shop</li>
                <li>✔ Priority booking for special events</li>
              </ul>
              <Button className='w-full max-w-xs'>Join Now</Button>
            </div>
            <div className='flex-1 rounded-2xl bg-card shadow-lg border border-border p-8 flex flex-col items-center'>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                Family Plan
              </h3>
              <ul className='text-muted-foreground text-sm mb-6 space-y-2 text-center'>
                <li>✔ All annual benefits for up to 5 family members</li>
                <li>✔ Family activity packs</li>
                <li>✔ Birthday surprises for kids</li>
                <li>✔ Early access to new exhibits</li>
              </ul>
              <Button className='w-full max-w-xs' variant='outline'>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='w-full bg-background py-20 px-4 border-t border-border'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
            Frequently Asked Questions
          </h2>
          <div className='mt-10 space-y-8'>
            <div>
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                How do I access the audio tour?
              </h3>
              <p className='text-muted-foreground'>
                You can access the audio tour using your own smartphone and
                headphones, or borrow a device at the SDC entrance. Simply scan
                the QR codes at each exhibit to listen.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                Is the audio tour available in multiple languages?
              </h3>
              <p className='text-muted-foreground'>
                Yes, the audio tour is available in English, Mandarin, Malay,
                and Tamil.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                Do I need to be a member to use the audio tour?
              </h3>
              <p className='text-muted-foreground'>
                No, all visitors can use the audio tour, but members enjoy
                complimentary access and additional features.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                Can I bring my family?
              </h3>
              <p className='text-muted-foreground'>
                Absolutely! SDC is family-friendly and offers special family
                membership plans and activities for all ages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Directions Section */}
      <section className=' w-full bg-muted py-20 px-4 border-t border-border'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
            Contact & Directions
          </h2>
          <div className='flex flex-col md:flex-row gap-10 mt-10 items-center'>
            <div className='flex-1 space-y-4'>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-1'>
                  Address
                </h3>
                <p className='text-muted-foreground'>
                  Singapore Discovery Centre
                  <br />
                  510 Upper Jurong Rd, Singapore 638365
                </p>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-1'>
                  Contact
                </h3>
                <p className='text-muted-foreground'>
                  Email:{' '}
                  <a href='mailto:info@sdc.com.sg' className='underline'>
                    info@sdc.com.sg
                  </a>
                  <br />
                  Phone:{' '}
                  <a href='tel:+6567996100' className='underline'>
                    +65 6799 6100
                  </a>
                </p>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-1'>
                  Opening Hours
                </h3>
                <p className='text-muted-foreground'>
                  Tue–Sun: 10:00am – 6:00pm
                  <br />
                  Closed on Mondays (except public holidays)
                </p>
              </div>
            </div>
            <div className='flex-1 w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg border border-border'>
              <iframe
                title='SDC Location'
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.024818572769!2d103.6767545!3d1.3326904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da0f7edafeb3ab%3A0xf41100151646f9a1!2sSingapore%20Discovery%20Centre!5e0!3m2!1sen!2ssg!4v1653648000000!5m2!1sen!2ssg'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen={true}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
