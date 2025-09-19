import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export default function HomepageFAQSection() {
  return (
    <section className='w-full bg-background py-20 px-4 border-t border-border'>
      <h1 className='text-3xl md:text-4xl font-bold text-center mb-4 text-foreground'>
        FAQ
      </h1>
      <Accordion type='single' collapsible className='max-w-4xl mx-auto'>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='text-lg font-semibold text-foreground mb-2'>
            How may I fast-track my education?
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            If you're preparing for university and want to make the most of your
            diploma time, an SP diploma can let you fast-track your education by
            0.5-2 years!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger className='text-lg font-semibold text-foreground mb-2'>
            What industry exposure do I get in SOC?
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            In Year 3, students in SOC can choose between a year-long
            internship, university pathway, or industry project. SP offers
            internships at leading organisations, including{' '}
            <span className='font-semibold'>
              Accenture, A*Star Research Institute, Foodpanda, Bank of
              Singapore, GovTech and Synapxe
            </span>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-3'>
          <AccordionTrigger className='text-lg font-semibold text-foreground mb-2'>
            What opportunities are there for applied AI and analytics in
            Singapore and the region?
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            Through applied AI and analytics, you will understand how smart
            systems transform industries. You'll learn to build interactive
            dashboards, develop chatbots with natural language processing, and
            enhance road inspection with computer vision.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-4'>
          <AccordionTrigger className='text-lg font-semibold text-foreground mb-2'>
            What are the scholarships available for SOC students and graduates?
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            SP offers many scholarships to recognise talent and service, from
            Year 0 to after graduation. These scholarships provide tuition fee
            waivers and chances to represent SP. They are awarded for academic
            excellence, contributions to arts or sports, and community service.
            Edusave awards and external sponsorships are also available.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-5'>
          <AccordionTrigger className='text-lg font-semibold text-foreground mb-2'>
            What facilities does SP have to prepare me for the future in
            cybersecurity and digital forensics?
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            At SP, the Cyber Wargame Centre lets you take on roles as attackers
            and defenders in simulated cyber scenarios. You'll also work on real
            client projects in the Security Operations Centre and gain hands-on
            experience in the Industry Now Curriculum Studio, ensuring you're
            fully prepared with practical experience to start your cybersecurity
            career confidently.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
