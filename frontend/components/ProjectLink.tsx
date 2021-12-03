import { Project } from "../utils/interfaces";
import Link from 'next/link';
import { useRouter } from "next/router";

export default function ProjectLink({ project }: { project: Project }) {
    const router = useRouter();
    // const page = router.pathname;

    return (
        <>
            <Link href={`${router.pathname}?project=${project.slug}`}>
                <a className='hoverPrimary projectLink'><div>{project.name}</div></a>
            </Link>
            <style jsx>{`
            .projectLink {
                text-decoration: none;
            }
        `}</style>
        </>
    );
}