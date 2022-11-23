import type { Attributes, ComponentType } from 'react';

import { usePublicMode } from '@/hooks/public';

export const GetPublicModeWrapper = <P,>(Public: ComponentType<P>, Private: ComponentType<P>) => {
  const WrappedComponent: ComponentType<Attributes & P> = (props: Attributes & P) => {
    const { publicModeIsActive } = usePublicMode();
    if (publicModeIsActive) {
      return <Public {...props} />;
    }
    return <Private {...props} />;
  };
  WrappedComponent.displayName = `PublicModeWrapper(${Private.displayName})`;
  return WrappedComponent;
};
