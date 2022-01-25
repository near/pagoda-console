import { ReactElement } from "react"
import SimpleLayout from "../components/SimpleLayout"
import DashboardLayout from "../components/DashboardLayout"
import TutorialLayout from "../components/TutorialLayout"

export function useSimpleLayout(page: ReactElement, footer: ReactElement | null) {
    return (
        <SimpleLayout footer={footer}>
            {page}
        </SimpleLayout>
    )
}

export function useDashboardLayout(page: ReactElement) {
    return (
        <DashboardLayout>
            {page}
        </DashboardLayout>
    )
}

export function useTutorialLayout(page: ReactElement) {
    return (
        <TutorialLayout>
            {page}
        </TutorialLayout>
    )
}