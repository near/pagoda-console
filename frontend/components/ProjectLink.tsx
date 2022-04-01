import Link from 'next/link';
import { useRouter } from 'next/router';

import type { Project } from '@/utils/interfaces';

import TutorialBadge from './TutorialBadge';

export default function ProjectLink({ project }: { project: Project }) {
  const router = useRouter();
  // const page = router.pathname;

  let destinationPath;

  // if we are on a tutorial page and switching to a non tutorial project, go to analytics.
  // Otherwise, stay on the same page
  // TODO handle switching between different tutorials
  if (router.pathname.startsWith('/tutorials/') && !project.tutorial) {
    destinationPath = '/project-analytics';
  } else {
    destinationPath = router.pathname;
  }

  return (
    <>
      <Link href={`${destinationPath}?project=${project.slug}`}>
        <a className="hoverPrimary projectLink">
          <div>
            {project.name}
            {project.tutorial && <TutorialBadge />}
          </div>
        </a>
      </Link>
      <style jsx>{`
        .projectLink {
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
