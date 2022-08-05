import { useFlags } from 'launchdarkly-react-client-sdk';

type Feature = 'momentary-alerts-enabled' | 'some-new-flag';

export default function useFeatureFlag(key: Feature) {
  const flags = useFlags();
  return flags && flags[key];
}
