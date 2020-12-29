import * as firebase from "firebase";

function init() {
  // Optionally import the services that you want to use
  //import "firebase/auth";
  //import "firebase/database";
  //import "firebase/firestore";
  //import "firebase/functions";
  //import "firebase/storage";

  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCM2fYZ7Nrf8b5rqfjrzg2MGhK23qi8-tM",
    authDomain: "myo-backend.firebaseapp.com",
    databaseURL: "https://myo-backend.firebaseio.com",
    projectId: "myo-backend",
    storageBucket: "myo-backend.appspot.com",
    messagingSenderId: "925526893460",
    appId: "1:925526893460:web:d562a61a4defb13cfb2581",
    //measurementId: "G-measurement-id",
  };

  firebase.initializeApp(firebaseConfig);
}

module.exports = init;
