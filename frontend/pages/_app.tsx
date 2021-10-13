import '../styles/globals.css'
import type { AppProps } from 'next/app'

// initialize Firebase
import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyCzJ0RAnGO4aQXkoZOSJH6b9psFU9DpQfE",
  authDomain: "near-dev-platform.firebaseapp.com",
  projectId: "near-dev-platform",
  storageBucket: "near-dev-platform.appspot.com",
  messagingSenderId: "1082695133360",
  appId: "1:1082695133360:web:3900d42047e8136937f375"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
