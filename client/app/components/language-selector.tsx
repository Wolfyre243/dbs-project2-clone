import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';

const languages = [
  { code: 'en-GB', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ms-MY', label: 'Malay' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'es-ES', label: 'Español' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'ru-RU', label: 'Русский' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('i18nextLng', value);
  };

  return (
    <Select onValueChange={handleChange} defaultValue={i18n.language}>
      <SelectTrigger className='w-[130px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
