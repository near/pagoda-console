import { useState, useEffect, useCallback } from 'react';

let draggingCount = 0;
type Params = {
  labelRef: any;
  handleChange?: (arg0: any) => any;
  onDrop?: (arg0: Array<File>) => void;
};

export default function useDragging({
  labelRef,
  handleChange,
  onDrop
}: Params): boolean {
  const [dragging, setDragging] = useState(false);

  const handleDragIn = useCallback((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    // TODO: use dragging instead
    draggingCount++;
    if (ev.dataTransfer.items && ev.dataTransfer.items.length !== 0) {
      setDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    draggingCount--;
    if (draggingCount > 0) return;
    setDragging(false);
  }, []);

  const handleDrag = useCallback((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setDragging(false);
      draggingCount = 0;

      const files = ev.dataTransfer.files;
      if (files && files.length > 0 && handleChange) {
        const success = handleChange(ev);
        if (onDrop && success) onDrop(files);
      }
    },
    [handleChange]
  );

  useEffect(() => {
    const ele = labelRef.current;
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
  }, [
    handleDragIn,
    handleDragOut,
    handleDrag,
    handleDrop,
    labelRef
  ]);

  return dragging;
}
