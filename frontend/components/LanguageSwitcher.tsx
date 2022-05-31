export function LanguageSwitcher() {
  return null;
}

export default LanguageSwitcher;

/*

TODO: When this component is needed, refactor using new library dropdown primitives

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const router = useRouter();

  function switchLang(eventKey: string | null) {
    if (!eventKey) {
      return;
    }

    const { pathname, asPath, query } = router;
    // change just the locale and maintain all other route information including href's query
    router.push({ pathname, query }, asPath, { locale: eventKey });
  }

  return (
    <DropdownButton id="dropdown-basic-button" drop="up" title={t('language')} onSelect={switchLang}>
      <Dropdown.Item eventKey="en">English</Dropdown.Item>
      <Dropdown.Item eventKey="es">Spanish</Dropdown.Item>
    </DropdownButton>
  );
}

export default LanguageSwitcher;
*/
