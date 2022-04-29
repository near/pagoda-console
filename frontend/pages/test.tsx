import { useSettingsStore } from '@/stores/settings';
import { dashboardLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Settings: NextPageWithLayout = () => {
  const settings = useSettingsStore();

  return (
    <>
      <h1>Test</h1>
      <button
        type="button"
        onClick={() =>
          settings.updateSettings('user123', {
            projects: {
              project123: {
                nftContract: 'calebjacob.testnet',
                selectedEnvironmentSubId: 1,
              },
              project456: {
                nftContract: 'chucknorris.testnet',
                selectedEnvironmentSubId: 2,
              },
            },
            selectedProjectSlug: 'project123',
          })
        }
      >
        Click Me
      </button>
      <button
        type="button"
        onClick={() =>
          settings.updateSettings('user123', {
            projects: {
              project123: {
                selectedEnvironmentSubId: 234234234234,
              },
            },
          })
        }
      >
        Click Me
      </button>
      <p>{settings.users['user123']?.projects['project123']?.selectedEnvironmentSubId}</p>
      <p>{JSON.stringify(settings.users)}</p>
    </>
  );
};

Settings.getLayout = dashboardLayout;

export default Settings;
