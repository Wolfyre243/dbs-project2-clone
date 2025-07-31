import { useState } from 'react';
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
import { useNavigate } from 'react-router';
import { AssistantChatBar } from '~/components/assistant-ui';
import useApiPrivate from '~/hooks/useApiPrivate';

export default function AssistantLaunchPage() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();

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

  // const features = [
  //   {
  //     icon: <Database className='h-6 w-6' />,
  //     title: 'Data Insights',
  //     description:
  //       'Query and analyze Singapore Discovery Centre data instantly',
  //   },
  //   {
  //     icon: <TrendingUp className='h-6 w-6' />,
  //     title: 'Performance Analytics',
  //     description: 'Get real-time statistics and performance metrics',
  //   },
  //   {
  //     icon: <Users className='h-6 w-6' />,
  //     title: 'User Management',
  //     description: 'Manage staff and visitor information efficiently',
  //   },
  //   {
  //     icon: <Zap className='h-6 w-6' />,
  //     title: 'Quick Actions',
  //     description: 'Execute administrative tasks with natural language',
  //   },
  // ];

  const [message, setMessage] = useState<string>('');

  return (
    <div className='min-h-full w-full'>
      <div className='relative z-10 container mx-auto px-4 py-12'>
        {/* Header Section */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-3 mb-6 px-4 py-2 bg-gradient-to-br from-red-500/30 to-pink-600/10 rounded-full border border-red-200/50 dark:border-red-800/50'>
            <Sparkles className='h-5 w-5 text-red-500' />
            <span className='text-sm font-medium text-red-700 dark:text-red-300'>
              AI-Powered Assistant
            </span>
          </div>

          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-pink-400'>
            Good Morning!
          </h1>

          <p className='text-xl text-gray-600 dark:text-zinc-300 max-w-3xl mx-auto mb-8 leading-relaxed'>
            Omnie is your intelligent AI companion for Singapore Discovery
            Centre. <br />
            Get instant insights, manage data, and streamline administrative
            tasks with natural language conversations.
          </p>
        </div>

        {/* Features Grid */}
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-0 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-zinc-800/95 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-zinc-700"
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-zinc-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div> */}

        <div className='w-full'>
          {/* Quick action suggestions */}
          <div className='mt-3 flex flex-wrap gap-2 justify-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setMessage("Show me today's visitor statistics")}
              className='text-xs border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-zinc-300'
            >
              📊 Today's Stats
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setMessage('What are the most popular exhibits this week?')
              }
              className='text-xs border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-zinc-300'
            >
              🏆 Popular Exhibits
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setMessage('Generate a report on staff performance')
              }
              className='text-xs border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-zinc-300'
            >
              👥 Staff Report
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setMessage('Help me manage user accounts')}
              className='text-xs border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-zinc-300'
            >
              👤 User Management
            </Button>
          </div>
          <AssistantChatBar
            isLoading={isLoading}
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
