import { AspectRatio } from './ui/aspect-ratio';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

export default function CourseDisplaySection() {
  return (
    <section className='w-full bg-gradient-to-b from-background/90 to-red-500/80 py-30 px-4'>
      <div className='max-w-5xl mx-auto'>
        <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
          Courses @ SOC
        </h2>
        <p className='text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto'>
          Take a look at the top-notch courses offered here at SP!
        </p>
      </div>
      <div className='max-w-10/12 mx-auto flex flex-row gap-4 justify-evenly'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>S30 Diploma in Applied AI & Analytics</CardTitle>
            <CardDescription className='font-semibold'>
              JAE: 3 to 9 points
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <img
              src='https://www.sp.edu.sg/images/default-source/soc/soc-daaa-students-discussing-work-with-one-student-pointing-to-monitor-v01.tmb-w400.webp?Status=Master&Culture=en&sfvrsn=4089c4dc_3'
              className='w-full h-auto object-cover rounded-xl aspect-[4/3] sm:aspect-[16/9] shadow-md'
            />
            <p className='text-sm'>
              If you aspire to use data analytics and AI to transform the way we
              live, work and communicate, the Diploma in Applied AI & Analytics
              is your best choice. Explore new fields like Generative AI, Graph
              Analytics, and Big Data Technology.
            </p>
          </CardContent>
        </Card>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>
              S54 Diploma in Cybersecurity & Digital Forensics
            </CardTitle>
            <CardDescription className='font-semibold'>
              JAE: 3 to 10 points
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <img
              src='https://www.sp.edu.sg/images/default-source/soc/soc-dcdf-students-in-red-room-v01.tmb-w400.webp?Status=Master&Culture=en&sfvrsn=2b479994_3'
              className='w-full h-auto object-cover rounded-xl aspect-[4/3] sm:aspect-[16/9] shadow-md'
            />
            <p className='text-sm'>
              If you thrive on solving complex puzzles and seek a career that
              challenges your cognitive skills, the Diploma in Cybersecurity and
              Digital Forensics is ideal for you. This course appeals to
              students who enjoy brain-teasing problems and the thrill of
              defending against cyber threats.
            </p>
          </CardContent>
        </Card>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>S69 Diploma in Computer Science</CardTitle>
            <CardDescription className='font-semibold'>
              JAE: 5 to 16 points
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <img
              src='https://www.sp.edu.sg/images/default-source/soc/soc-dit-2-students-studying-together-v01.tmb-w400.webp?Status=Master&Culture=en&sfvrsn=8ccf88c9_3'
              className='w-full h-auto object-cover rounded-xl aspect-[4/3] sm:aspect-[16/9] shadow-md'
            />
            <p className='text-sm'>
              If you're passionate about programming and thrive on logical,
              process-driven problem-solving, or interested in computer science,
              the Diploma in Computer Science is perfect for you. Your strengths
              in requirements analysis and attention to detail are ideal for
              mastering full-stack development.
            </p>
          </CardContent>
        </Card>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>S32 Common ICT Programme</CardTitle>
            <CardDescription className='font-semibold'>
              JAE: 5 to 14 points
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <img
              src='https://www.sp.edu.sg/images/default-source/soc/soc-dcitp-student-looking-at-astrobot-on-two-monitors-v01.tmb-w400.webp?Status=Master&Culture=en&sfvrsn=f694d7e0_4'
              className='w-full h-auto object-cover rounded-xl aspect-[4/3] sm:aspect-[16/9] shadow-md'
            />
            <p className='text-sm'>
              The Common ICT Programme is ideal if you want a low-risk way to
              explore diverse computing fields in SP's SoC. You'll build a
              strong foundation in programming and IT fundamentals in Year 1,
              which will guide you in choosing your specialization in Year 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
