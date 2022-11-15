import type { RpcStats } from '@pc/common/types/rpcstats';

export const timeRanges: { value: RpcStats.TimeRangeValue; label: string }[] = [
  {
    label: '15 Minutes',
    value: '15_MINS',
  },
  {
    label: '1 Hour',
    value: '1_HRS',
  },
  {
    label: '24 Hours',
    value: '24_HRS',
  },
  {
    label: '7 Days',
    value: '7_DAYS',
  },
  {
    label: '30 Days',
    value: '30_DAYS',
  },
];
