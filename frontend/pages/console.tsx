import firebase from 'firebase';
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function Console(){
    const { data, error } = useSWR('http://localhost:3001/', fetcher)

    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    return <div><h1>Welcome {firebase.auth().currentUser?.displayName}</h1>
    <p>{data.message}</p>
    </div>
}

export default Console;