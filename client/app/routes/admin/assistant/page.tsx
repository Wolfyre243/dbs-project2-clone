import { useEffect, useState } from 'react';
import {
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  Database,
  Zap,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useNavigate, useOutletContext } from 'react-router';
import { AssistantChatBar } from '~/components/assistant-ui';
import useApiPrivate from '~/hooks/useApiPrivate';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '~/hooks/use-mobile';

export default function AssistantLaunchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();
  const isMobile = useIsMobile();
  const { handleTitle } = useOutletContext<any>();

  useEffect(() => {
    handleTitle('');
  }, [handleTitle]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      const { data: responseData } = await apiPrivate.post(`/assistant/chat`, {
        content: message,
      });

      // Clear message after sending
      setMessage('');
      navigate(
        `/admin/assistant/conversation/${responseData.conversation.conversationId}`,
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  };

  const quickActions = [
    {
      text: "Show me today's visitor statistics",
      emoji: '📊',
      label: "Today's Stats",
    },
    {
      text: 'What are the most popular exhibits this week?',
      emoji: '🏆',
      label: 'Popular Exhibits',
    },
    {
      text: 'Generate a report on the audio engagement of users for exhibits',
      emoji: '🔊',
      label: 'Audio Engagement',
    },
    {
      text: 'Summarise recent audits by admins',
      emoji: '📃',
      label: 'Summarise Logs',
    },
  ];

  return (
    <motion.div
      className='min-h-full w-full overflow-hidden'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-3xl'
          animate={{
            y: [-10, 10, -10],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl'
          animate={{
            y: [-10, 10, -10],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
      </div>

      <div className='relative z-10 container mx-auto w-full px-4 py-12'>
        {/* Header Section */}
        <motion.div className='text-center mb-16' variants={itemVariants}>
          <motion.div
            className='inline-flex items-center gap-3 mb-6 px-4 py-2 bg-gradient-to-br from-red-500/30 to-pink-600/10 rounded-full border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className='h-5 w-5 text-red-500' />
            </motion.div>
            <span className='text-sm font-medium text-red-700 dark:text-red-300'>
              AI-Powered Assistant
            </span>
          </motion.div>

          <motion.h1
            className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent dark:from-red-200 dark:via-red-400 dark:to-pink-400'
            style={{ backgroundSize: '200% 200%' }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12)
                return (
                  <p>
                    Good Morning! <br /> How can I help you today?
                  </p>
                );
              if (hour < 18)
                return (
                  <p>
                    Good Afternoon! <br /> How can I help you today?
                  </p>
                );
              return (
                <p>
                  Good Evening, <br /> how can I help you today?
                </p>
              );
            })()}
          </motion.h1>

          <motion.p
            className='text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Omnie is your intelligent AI companion for Singapore Discovery
            Centre. <br />
            {!isMobile && (
              <p>
                Get instant insights, manage data, and streamline administrative
                tasks with natural language conversations.
              </p>
            )}
          </motion.p>
        </motion.div>

        <motion.div className='flex flex-col min-w-ful' variants={itemVariants}>
          {/* Quick action suggestions */}
          <motion.div
            className='mt-3 flex flex-wrap gap-2 justify-center mb-8'
            initial='hidden'
            whileInView='visible'
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.8 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    },
                  },
                }}
              >
                <motion.div
                  variants={buttonVariants}
                  initial='initial'
                  whileHover='hover'
                  whileTap='tap'
                >
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setMessage(action.text)}
                    className='text-xs border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-zinc-300 backdrop-blur-sm'
                  >
                    <motion.span
                      className='mr-2'
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {action.emoji}
                    </motion.span>
                    {action.label}
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='w-full md:w-4xl flex flex-col self-center'
          >
            <AssistantChatBar
              isLoading={isLoading}
              message={message}
              setMessage={setMessage}
              handleSubmit={handleSubmit}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
