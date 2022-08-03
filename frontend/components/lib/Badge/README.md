# Badge

## Example

```tsx
import { Badge } from '@/components/lib/Badge';
...
<Badge color="primary" size="s">My Badge</Badge>
```

## Clickable

Sometimes it makes sense to use a `Badge` as a clickable button. You can do so by using the `as` and `clickable` props:

```tsx
<Badge as="button" type="button" size="s" clickable onClick={() => alert('Hi!')}>
  My Badge
</Badge>
```
