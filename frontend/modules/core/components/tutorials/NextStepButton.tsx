import Link from 'next/link';

import { ButtonLink } from '@/components/lib/Button';
import { StableId } from '@/utils/stable-ids';

export default function NextStepButton({ label, path }: { label: string; path: string }) {
  return (
    <Link passHref href={path}>
      <ButtonLink stableId={StableId.TUTORIAL_CONTENT_NEXT_STEP_LINK}>{label}</ButtonLink>
    </Link>
  );
}
