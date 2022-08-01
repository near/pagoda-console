// Based on: https://thewebdev.info/2021/03/13/how-to-compare-old-values-and-new-values-with-the-react-useeffect-hook/

import { useEffect, useRef } from 'react';

export function usePreviousValue<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
