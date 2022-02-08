import { ReactElement } from "react"
import SimpleLayout from "../components/SimpleLayout"
import DashboardLayout from "../components/DashboardLayout"

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
