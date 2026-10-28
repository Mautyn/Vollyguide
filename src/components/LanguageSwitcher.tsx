import { LOCALES } from '../i18n/locale';
import { useLocaleStore } from '../state/localeStore';
import { strings } from '../strings';
import { Button } from './ui/button';

/** One compact button that switches to the other language (fits the phone header). */
export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const other = LOCALES.find((l) => l !== locale) ?? 'en';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="ml-auto px-2 font-semibold"
      lang={other}
      aria-label={`${strings.language}: ${strings.languages[other]}`}
      title={strings.languages[other]}
      onClick={() => setLocale(other)}
      data-testid="language-switcher"
    >
      {other.toUpperCase()}
    </Button>
  );
}
