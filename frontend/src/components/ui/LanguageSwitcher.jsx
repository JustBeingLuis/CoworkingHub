import { useTranslation } from 'react-i18next';
import { FlagES, FlagUS } from './SVGIcons';
import { cn } from '../../utils/utils';

export const LanguageSwitcher = ({ className }) => {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const isEs = i18n.language.startsWith('es');

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all hover:scale-105 shadow-md border",
        isEs ? "bg-amber-50/80 text-amber-900 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-700/30" 
             : "bg-blue-50/80 text-blue-900 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700/30",
        className
      )}
      title="Change Language"
    >
      <div className="h-5 w-7 overflow-hidden rounded-sm shadow-sm opacity-90 transition-opacity hover:opacity-100 ring-1 ring-black/5 dark:ring-white/10">
        {isEs ? <FlagES className="h-full w-full object-cover" /> : <FlagUS className="h-full w-full object-cover" />}
      </div>
      <span className="tracking-wide">{isEs ? 'ES' : 'EN'}</span>
    </button>
  );
};
