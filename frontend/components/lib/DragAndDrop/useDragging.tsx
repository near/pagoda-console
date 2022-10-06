import type { DragEvent, RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

let draggingCount = 0;
type Params = {
  elementRef: RefObject<any>;
  onChange?: (event: DragEvent<HTMLLabelElement>) => any;
};

export default function useDragging({ elementRef, onChange }: Params): boolean {
  const [dragging, setDragging] = useState(false);

  const handleDragIn = useCallback((ev: DragEvent<HTMLLabelElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    draggingCount++;
    if (ev.dataTransfer?.items && ev.dataTransfer.items.length !== 0) {
      setDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((ev: DragEvent<HTMLLabelElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    draggingCount--;
    if (draggingCount > 0) return;
    setDragging(false);
  }, []);

  const handleDrag = useCallback((ev: DragEvent<HTMLLabelElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (ev: DragEvent<HTMLLabelElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      setDragging(false);
      draggingCount = 0;

      const files = ev.dataTransfer?.files;
      if (files && files.length > 0 && onChange) {
        return onChange(ev);
      }
    },
    [onChange],
  );

  useEffect(() => {
    const ele = elementRef.current;
    ele.addEventListener('dragenter', handleDragIn);
    ele.addEventListener('dragleave', handleDragOut);
    ele.addEventListener('dragover', handleDrag);
    ele.addEventListener('drop', handleDrop);
    return () => {
      ele.removeEventListener('dragenter', handleDragIn);
      ele.removeEventListener('dragleave', handleDragOut);
      ele.removeEventListener('dragover', handleDrag);
      ele.removeEventListener('drop', handleDrop);
    };
  }, [handleDragIn, handleDragOut, handleDrag, handleDrop, elementRef]);

  return dragging;
}
