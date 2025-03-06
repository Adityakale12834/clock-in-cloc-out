import './App.css'
import { useEffect, useState } from 'react';
import Signin from './components/authentication/Signin';
import Layout from './components/Layout';
import { app } from './utils/firebase';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);

function App() {
  const [user, setUser] = useState("");
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Hello " + JSON.stringify(user.email));
        setUser(user);
      }
      else {
        console.log("You are Logged Out!");
        setUser(null);
      }
    })
  }, []);


  if(user === null){
    return (
      <>
        <Signin/>
      </>
    )
  }
  return (
    <Layout/>
  )
}

export default App
