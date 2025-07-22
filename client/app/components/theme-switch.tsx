import { Sun, Moon } from 'lucide-react';
import { useTheme } from '~/context/themeProvider';

export default function ThemeSwitcher() {
  const { theme, setTheme, isDark } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      aria-label='Toggle theme'
      className={`w-12 h-6 flex items-center rounded-full px-1 transition-colors duration-200 focus:outline-none ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
      onClick={toggleTheme}
      type='button'
    >
      <span
        className={`transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0'} flex flex-row items-center`}
      >
        {isDark ? (
          <Moon size={18} className='text-blue-400' />
        ) : (
          <Sun size={18} className='text-yellow-500' />
        )}
      </span>
    </button>
  );
}
