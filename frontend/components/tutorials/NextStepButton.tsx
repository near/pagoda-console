import Link from 'next/link';
import { Button } from 'react-bootstrap';

export default function NextStepButton({ label, path }: { label: string; path: string }) {
  return (
    <Link passHref href={path}>
      <Button variant="primary">{label}</Button>
    </Link>
  );
}
