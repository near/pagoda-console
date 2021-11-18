import { getAuth, getIdToken } from 'firebase/auth';
import useSWR from 'swr';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function internalFetcher(url: string) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('No authenticated user')

    const headers = new Headers({
        'Authorization': `Bearer ${await getIdToken(user)}`
    });
    return fetch(url, {
        headers
    }).then((res) => res.json())
}


export function useContracts(environmentId: number) {
    const contracts = useSWR(['getContracts', environmentId, getUID()], (key:string, environmentId: number) => {
        console.log(`environment ID is ${environmentId}`);
        return internalPostFetcher('/projects/getContracts', { environmentId });
    });
    return contracts;
}

function getUID() {
    const user = getAuth().currentUser;
    if (!user) {
        throw new Error('No authenticated user found during SWR fetch');
    }
    return user.uid;
}

// function postFetcher() {

// }

async function internalPostFetcher(endpoint: string, body: Object) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('No authenticated user')

    
    const headers = new Headers({
        'Authorization': `Bearer ${await getIdToken(user)}`,
        'Content-Type': 'application/json',
    });
    return fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    }).then((res) => res.json())
}


// TODO finish reviewing this architecture for adding all fetch requests ^^^