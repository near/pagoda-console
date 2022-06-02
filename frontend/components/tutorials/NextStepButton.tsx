import Link from 'next/link';

import { ButtonLink } from '../lib/Button';

export default function NextStepButton({ label, path }: { label: string; path: string }) {
  return (
    <Link passHref href={path}>
      <ButtonLink>{label}</ButtonLink>
    </Link>
  );
}
