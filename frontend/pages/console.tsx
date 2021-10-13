import firebase from 'firebase';
import { ComponentProps } from 'react';
import useSWR from 'swr'

interface Dapp {
    address: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function Console() {
    const { data, error } = useSWR('http://localhost:3001/dapp/getForUser', fetcher)

    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    return <div><h1>Welcome {firebase.auth().currentUser?.displayName}</h1>
        <DappList dapps={data} />
    </div>
}

interface DappListProps {
    dapps: Dapp[]
}
function DappList(props: DappListProps) {
    return <div>
        {props.dapps.map((dapp) => <DappItem key={dapp.address} dapp={dapp} />)}
    </div>
}

interface DappItemProps {
    dapp: Dapp
};
function DappItem(props: DappItemProps) {
    return <a href={`https://explorer.near.org/accounts/${props.dapp.address}`} target="_blank" rel="noopener noreferrer">{props.dapp.address}</a>
}

export default Console;