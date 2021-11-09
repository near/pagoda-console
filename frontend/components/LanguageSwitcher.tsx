import { useTranslation } from 'next-i18next';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { useRouter } from 'next/router'

function LanguageSwitcher() {
    const { t } = useTranslation('common');
  const router = useRouter()

  function switchLang(eventKey: string | null) {
    if (!eventKey) {
      return;
    }

    const { pathname, asPath, query } = router
    // change just the locale and maintain all other route information including href's query
    router.push({ pathname, query }, asPath, { locale: eventKey });
  }

    return <DropdownButton id="dropdown-basic-button" drop='up' title={t('language')} onSelect={switchLang}>
    <Dropdown.Item eventKey='en'>English</Dropdown.Item>
    <Dropdown.Item eventKey='es'>Spanish</Dropdown.Item>
  </DropdownButton>
}

export default LanguageSwitcher;