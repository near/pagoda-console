import { useFlags } from 'launchdarkly-react-client-sdk';

type Feature = string;

export default function useFeatureFlag(key: Feature) {
  const flags = useFlags();
  return flags && flags[key];
}
