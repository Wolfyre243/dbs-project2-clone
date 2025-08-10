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

import { motion, useReducedMotion } from 'framer-motion';
import {
  fadeUpContainer,
  fadeUpItem,
  marqueeCard,
} from '~/components/animations/motionVariants';

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const heroAnimationProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden', animate: 'visible' };

  return (
    <motion.main
      className='flex flex-col min-h-full w-full items-center justify-start gap-10 py-8 px-6'
      variants={fadeUpContainer}
      {...heroAnimationProps}
    >
      <motion.section
        className='w-full flex flex-col md:flex-row gap-5'
        variants={fadeUpContainer}
      >
        <div className='flex flex-col justify-between h-90 w-full md:w-2/3 p-6 rounded-xl bg-scenery-dimmed shadow-lg'>
          <motion.div
            className='flex flex-col gap-2 text-white'
            variants={fadeUpContainer}
          >
            <motion.h1 variants={fadeUpItem} className='text-5xl font-bold'>
              Welcome!
            </motion.h1>
            <motion.p variants={fadeUpItem} className='text-2xl font-semibold'>
              Take a look at your SDC journey so far!
            </motion.p>
          </motion.div>
          <motion.div className='text-white' variants={fadeUpItem}>
            <UserTopVisitedExhibit />
          </motion.div>
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
      </motion.section>

      {/* Favourites */}
      <motion.section
        className='w-full flex flex-col md:flex-row gap-5'
        variants={fadeUpContainer}
      >
        <div className='flex flex-col gap-3 w-full md:w-1/4'>
          <motion.h1 variants={fadeUpItem} className='text-2xl font-bold'>
            Your Activity
          </motion.h1>
          <motion.div variants={fadeUpItem}>
            <UserRecentActivity />
          </motion.div>
        </div>
        <div className='flex flex-col gap-3 w-full md:w-3/4'>
          <motion.h1 variants={fadeUpItem} className='text-2xl font-bold'>
            Favourite Exhibits
          </motion.h1>
          <motion.div variants={fadeUpItem}>
            <UserFavouriteExhibits />
          </motion.div>
        </div>
      </motion.section>

      {/* Latest Events */}
      {/* <section className='w-full flex flex-row gap-5'>
        <h1 className='text-2xl font-bold'>Latest Happenings</h1>
        <div></div>
      </section> */}
    </motion.main>
  );
}
