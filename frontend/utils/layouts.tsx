import { ReactElement } from "react"
import SimpleLayout from "../components/SimpleLayout"

export function useSimpleLayout(page: ReactElement) {
    return (
        <SimpleLayout>
            {page}
        </SimpleLayout>
    )
}