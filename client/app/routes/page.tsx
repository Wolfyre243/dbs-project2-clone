import { AppBar } from '~/components/app-bar';
import { Button } from '~/components/ui/button';
import {
  ArrowRight,
  Play,
  Shield,
  Users,
  Zap,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '~/services/api';
import useAuth from '~/hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router';
import { useJWTDecode } from '~/hooks/useJWTDecode';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { RainbowButton } from '~/components/magicui/rainbow-button';
import HomepageFAQSection from '~/components/faq-section';
import CourseDisplaySection from '~/components/course-display-sect';

export default function LandingPage() {
  const { setAccessToken, accessToken } = useAuth();
  const JWTDecode = useJWTDecode();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGuestLogin = async () => {
    try {
      const { data: responseData } = await api.post(
        '/auth/guest-login',
        {},
        { withCredentials: true },
      );

      setAccessToken(responseData.accessToken);
      await JWTDecode(responseData.accessToken);

      navigate('/');
    } catch (error: any) {
      let message;
      if (isAxiosError(error)) {
        message =
          error.response?.data.message ||
          'Something went wrong. Please try again later.';
      }
      toast.error(message);
    }
  };
  return (
    <div className='min-h-screen w-full flex flex-col'>
      <main className='flex-1 w-full flex flex-col'>
        <AppBar />
        {/* Hero Section */}
        <section className='relative h-full py-5 flex items-center justify-center overflow-hidden bg-red-50 dark:bg-red-950'>
          {/* Redesigned Background */}
          <div className='absolute inset-0'>
            {/* Subtle animated gradient overlay */}
            {/*  bg-gradient-to-br from-red-400 to-red-300/100 dark:to-red-300 animate-gradient-x  */}
            <div className='absolute inset-0 bg-hero' />
            {/* Glassmorphism overlay */}
            <div className='absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-[4px]' />
          </div>

          {/* Hero Content */}
          <div className='relative z-10 h-screen flex flex-col justify-center text-center px-6 max-w-6xl mx-auto'>
            {/* Welcome Badge */}
            <div className='w-fit self-center inline-flex items-center px-4 py-2 rounded-full border border-red-400 dark:border-red-500 bg-red-400/80 dark:bg-red-500/80 backdrop-blur-sm mb-8'>
              <Shield className='w-4 h-4 mr-2 text-white' />
              <span className='text-sm font-medium tracking-wide text-white'>
                {t('welcome')}
              </span>
            </div>

            {/* Main Heading */}
            <motion.h1
              className='text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight'
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {t('mainHeading1')}{' '}
              <span className='bg-gradient-to-br from-red-500 dark:from-red-500 to-red-600 dark:to-red-700 bg-clip-text text-transparent'>
                {t('mainHeading2')}
              </span>
              {/* <br />
              {t('mainHeading3')} */}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className='text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed'
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            >
              {t('subHeading')}
            </motion.p>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
              {!accessToken ? (
                <Button
                  size='lg'
                  onClick={() => handleGuestLogin()}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                >
                  {t('startJourney')}
                  <ArrowRight className='ml-2 w-5 h-5' />
                </Button>
              ) : (
                ''
              )}
            </div>
          </div>
        </section>

        {/* Audio Tour Examples Section */}
        <section className='relative w-full bg-background py-20 px-4 border-t border-border'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
              {t('audioHighlights')}
            </h2>
            <p className='text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto'>
              {t('highlightDesc')}
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {/* Example 1 */}
              <motion.div
                className='rounded-2xl bg-card shadow-lg border border-border p-6 flex flex-col items-center'
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <h3 className='text-xl font-semibold mb-2 text-foreground'>
                  Innovative Student Projects
                </h3>
                <p className='text-sm text-muted-foreground mb-4 text-center'>
                  Oculis is an innovative product created by a group of students
                  and alumni from the Diploma in Applied AI &amp; Analytics
                  (DAAA) course.
                  <br />
                  <br />
                </p>
                <audio controls className='w-full'>
                  <source src='/sample-audio-1.wav' type='audio/wav' />
                  {t('supportError')}
                </audio>
              </motion.div>
              {/* Example 2 */}
              <motion.div
                className='rounded-2xl bg-card shadow-lg border border-border p-6 flex flex-col items-center'
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <h3 className='text-xl font-semibold mb-2 text-foreground'>
                  Scholarship Opportunities
                </h3>
                <p className='text-sm text-muted-foreground mb-4 text-center'>
                  6 School of Computing (SoC) students received the prestigious
                  CSIT Diploma Scholarship at the CSIT Scholarship Award
                  Ceremony on 27 Sep 2024.
                </p>
                <audio controls className='w-full'>
                  <source src='/sample-audio-2.wav' type='audio/wav' />
                  {t('supportError')}
                </audio>
              </motion.div>
              {/* Example 3 */}
              <motion.div
                className='rounded-2xl bg-card shadow-lg border border-border p-6 flex flex-col items-center'
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <h3 className='text-xl font-semibold mb-2 text-foreground'>
                  Graduation Ceremony
                </h3>
                <p className='text-sm text-muted-foreground mb-4 text-center'>
                  On 22 January 2025, we proudly celebrate the achievements of
                  our outstanding students and alumna at the SP Scholarships
                  Award Presentation Ceremony, held at the SPCC.
                </p>
                <audio controls className='w-full'>
                  <source src='/sample-audio-3.wav' type='audio/wav' />
                  {t('supportError')}
                </audio>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Membership & Benefits Section */}
        {/* <section className='w-full bg-gradient-to-b from-background/90 to-red-500/80 py-30 px-4'>
          <div className='max-w-5xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
              {t('becomeMember')}
            </h2>
            <p className='text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto'>
              {t('joinSDCCommunity')}
            </p>
            <div className='flex flex-col md:flex-row gap-8 justify-center'>
              <div className='flex-1 rounded-2xl bg-card shadow-lg border border-border p-8 flex flex-col items-center'>
                <h3 className='text-xl font-semibold mb-2 text-foreground'>
                  {t('annualMembership')}
                </h3>
                <ul className='text-muted-foreground text-sm mb-6 space-y-2 text-center'>
                  <li>✔ {t('freeAdmission')}</li>
                  <li>✔ {t('complimentaryTours')}</li>
                  <li>✔ {t('eventsAndWorkshops')}</li>
                  <li>✔ {t('discounts')}</li>
                  <li>✔ {t('priorityBooking')}</li>
                </ul>
                <Button className='w-full max-w-xs' asChild>
                  <Link to={'/membership-plans'}>{t('joinNow')}</Link>
                </Button>
              </div>
              <div className='flex-1 rounded-2xl bg-card shadow-lg border border-border p-8 flex flex-col items-center'>
                <h3 className='text-xl font-semibold mb-2 text-foreground'>
                  {t('familyPlan')}
                </h3>
                <ul className='text-muted-foreground text-sm mb-6 space-y-2 text-center'>
                  <li>✔ {t('annualFamilyBenefits')}</li>
                  <li>✔ {t('familyPacks')}</li>
                  <li>✔ {t('familyBirthday')}</li>
                  <li>✔ {t('earlyAccess')}</li>
                </ul>
                <Button className='w-full max-w-xs' variant='outline' asChild>
                  <Link to={'/membership-plans'}>{t('learnMore')}</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className='flex flex-row w-full mt-10 justify-center'>
            <Button
              className='text-lg p-6 rounded-full hover:ring-4 ring-primary transition-all duration-200 ease-in-out hover:scale-105 shadow-xl'
              asChild
              variant={'secondary'}
            >
              <Link to={'/auth/register'}>Join as a FREE member</Link>
            </Button>
          </div>
        </section> */}
        <CourseDisplaySection />

        {/* FAQ Section */}
        {/* <section className='w-full bg-background py-20 px-4 border-t border-border'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
              {t('faqTitle')}
            </h2>
            <div className='mt-10 space-y-8'>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>
                  {t('howAccessAudioTour')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('howAccessAudioTourResponse')}
                </p>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>
                  {t('audioAvaliability')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('audioAvaliabilityResponse')}
                </p>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>
                  {t('memberToUseAudioTour')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('memberToUseAudioTourResponse')}
                </p>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>
                  {t('canIBringFamily')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('canIBringFamilyResponse')}
                </p>
              </div>
            </div>
          </div>
        </section> */}
        <HomepageFAQSection />

        {/* Address & Location Section */}
        <section className='w-full bg-red-400 dark:bg-red-400 py-16 px-4 border-t border-border'>
          <div className='max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center'>
            <div className='flex-1 space-y-4'>
              <h2 className='text-2xl font-bold mb-2'>{t('ourLocation')}</h2>
              <div className=''>
                Singapore Polytechnic
                <br />
                {t('ourLocationDesc')}
              </div>
              <h2 className='text-2xl font-bold mb-2'>{t('openingHours')}</h2>
              <div className=''>
                {t('openingHoursDesc')}
                <br />
                {/* {t('closedDates')} */}
              </div>
            </div>
            <div className='flex-1 w-full h-48 md:h-56 rounded-xl overflow-hidden shadow-lg border border-border'>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7758676394114!2d103.77497457588531!3d1.3097810617014318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1a602ff17c15%3A0xa9545dd23993859e!2sSingapore%20Polytechnic!5e0!3m2!1sen!2ssg!4v1758465770370!5m2!1sen!2ssg'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen={true}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      {/* Footer Section */}
      <footer className='w-full bg-background py-20 border-t border-border'>
        <div className='container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-4'>
          <div className='flex-1 flex flex-col gap-2 mb-6 md:mb-0'>
            <span className='font-semibold text-lg'>Singapore Polytechnic</span>
            <span className='text-xs text-muted-foreground'>
              &copy; {new Date().getFullYear()} {t('allRightsReserved')}
            </span>
            <div className='mt-4'>
              <div className='font-semibold mb-1'>{t('contact')}</div>
              <div className='text-sm text-muted-foreground'>
                {t('email')}{' '}
                <a href='mailto:qsm@sp.edu.sg' className='underline'>
                  qsm@sp.edu.sg
                </a>
                <br />
                {t('phone')}{' '}
                <a href='tel:+6567751133' className='underline'>
                  +65 6775 1133
                </a>
                <br />
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center gap-4'>
            {/* <Button className='bg-red-400 dark:bg-red-500 text-white cursor-pointer'>
              {t('subscribe')}
            </Button> */}
            <div className='flex flex-row gap-4 mt-2'>
              <a
                href='https://www.facebook.com/singaporepolytechnic'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Facebook'
                className='hover:text-blue-600 transition-colors'
              >
                <Facebook className='w-5 h-5' />
              </a>
              <a
                href='https://www.instagram.com/singaporepoly'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Instagram'
                className='hover:text-pink-500 transition-colors'
              >
                <Instagram className='w-5 h-5' />
              </a>
              <a
                href='https://www.linkedin.com/school/singapore-polytechnic/?originalSubdomain=sg'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='LinkedIn'
                className='hover:text-blue-800 transition-colors'
              >
                <Linkedin className='w-5 h-5' />
              </a>
              <a
                href='mailto:qsm@sp.edu.sg'
                aria-label='Email'
                className='hover:text-green-600 transition-colors'
              >
                <Mail className='w-5 h-5' />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
