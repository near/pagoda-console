# Drag and Drop

## File Upload Example

```tsx
import type { ChangeEvent, DragEvent } from 'react';
import { DragAndDropLabel } from '@/components/lib/DragAndDrop';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import * as Form from '@/components/lib/Form';
import { StableId } from '@/utils/stable-ids';

...

function handleUpload(e: ChangeEvent<HTMLInputElement>) {
  if (!e.target.files?.[0]) {
    return null;
  }

  upload(e.target.files[0]);
}

function handleDrop(e: DragEvent<HTMLLabelElement>) {
  if (!e.dataTransfer?.files[0]) {
    return null;
  }

  upload(e.target.files[0]);
}

...

<DragAndDropLabel
  stableId={StableId.MY_FILE_UPLOAD}
  onChange={handleDrop}
>
  <FeatherIcon color="primary" size="s" icon="upload" />
  Choose or drop a file
  <Form.Input type="file" onChange={handleUpload} file tabIndex={-1} accept="application/JSON" />
</DragAndDropLabel>
```
