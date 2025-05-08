// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0CGg31QDhSxKFS-ydDJ1WYMbUQ5j8B9Q",
  authDomain: "spottedapp-f356f.firebaseapp.com",
  projectId: "spottedapp-f356f",
  storageBucket: "spottedapp-f356f.appspot.com",
  messagingSenderId: "62494972983",
  appId: "1:62494972983:web:c9393390ec1b98e88eb3b2",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };