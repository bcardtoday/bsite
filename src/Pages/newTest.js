import "./Bcard.css";
import React, { useRef, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { initializeApp } from "firebase/app";
import { getMoralisAuth } from "@moralisweb3/client-firebase-auth-utils";
import { signInWithMoralis } from "@moralisweb3/client-firebase-evm-auth";
import { getAuth } from "@firebase/auth";

firebase.initializeApp = {
  apiKey: "AIzaSyChTduco38e0DhABMIEo1TT3qVKgIkaakk",
  authDomain: "bsite-681e1.firebaseapp.com",
  projectId: "bsite-681e1",
  storageBucket: "bsite-681e1.appspot.com",
  messagingSenderId: "573072731729",
  appId: "1:573072731729:web:5741d5f5c1865917385270",
  measurementId: "G-WL0D9R1SMB",
};

var firebaseConfig = {
  apiKey: "AIzaSyChTduco38e0DhABMIEo1TT3qVKgIkaakk",
  authDomain: "bsite-681e1.firebaseapp.com",
  projectId: "bsite-681e1",
  storageBucket: "bsite-681e1.appspot.com",
  messagingSenderId: "573072731729",
  appId: "1:573072731729:web:5741d5f5c1865917385270",
  measurementId: "G-WL0D9R1SMB",
};

const app = initializeApp(firebaseConfig);
// console.log(123);
const moralisAuth = getMoralisAuth(app);
var auth = firebase.auth();

const firestore = firebase.firestore();
console.log(firestore.collection("messages"));
const analytics = firebase.analytics();

export function Test() {
  const [user, setUser] = useState(null);

  async function login() {
    const res = await signInWithMoralis(moralisAuth);
    setUser(res.credentials.user.uid);
  }

  async function logout() {
    await auth.signOut();
    setUser(null);
  }

  function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(25);

    const [messages] = useCollectionData(query, { idField: "id" });

    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
      e.preventDefault();

      const { uid, photoURL } = auth.currentUser;

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });

      setFormValue("");
      dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <>
        <main>
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

          <span ref={dummy}></span>
        </main>

        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="say something nice"
          />

          <button type="submit" disabled={!formValue}>
            🕊️
          </button>
        </form>
      </>
    );
  }

  function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
      <>
        <div className={`message ${messageClass}`}>
          <img
            src={
              photoURL ||
              "https://api.adorable.io/avatars/23/abott@adorable.png"
            }
          />
          <p>{text}</p>
        </div>
      </>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        {logout}
      </header>

      <section>{user ? <ChatRoom /> : { login }}</section>
    </div>
  );
}

// export default App;
