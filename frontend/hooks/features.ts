import { useFlags } from 'launchdarkly-react-client-sdk';

type Feature = 'frontend-deploys-module';

export default function useFeatureFlag(key: Feature) {
  const flags = useFlags();
  return flags && flags[key];
}
