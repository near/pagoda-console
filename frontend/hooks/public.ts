import { usePublicStore } from '@/stores/public';

export function usePublicMode() {
  const publicModeIsActive = usePublicStore((store) => store.publicModeIsActive);
  const activatePublicMode = usePublicStore((store) => store.activatePublicMode);
  const deactivatePublicMode = usePublicStore((store) => store.deactivatePublicMode);

  return { activatePublicMode, deactivatePublicMode, publicModeIsActive };
}
