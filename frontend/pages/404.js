import { TextLink } from '@/components/lib/TextLink';

import { SimpleLayout } from '../components/layouts/SimpleLayout';

export default function FourOFour() {
  return (
    <SimpleLayout>
      Oops, there&apos;s nothing here
      <TextLink color="neutral" href="/">
        Let&apos;s go back home
      </TextLink>
    </SimpleLayout>
  );
}
