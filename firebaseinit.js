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
    apiKey: "AIzaSyAaq9nz-qlMq13yn_E8ku5e3dSd7jjkLEQ",
    authDomain: "myo-backend-55739.firebaseapp.com",
    databaseURL: "https://myo-backend-55739-default-rtdb.firebaseio.com/",
    projectId: "myo-backend-55739",
    storageBucket: "myo-backend-55739.appspot.com",
    messagingSenderId: "285056394352",
    appId: "1:285056394352:web:d87e09109b821bd66800b5",
    measurementId: "G-3BHYH83Q31",
  };

  firebase.initializeApp(firebaseConfig);
}

module.exports = init;
