import * as firebase from "firebase";
import "@firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBWD-QFo3m8WcE3U9cC3iReUq3qjSTexIM",
  authDomain: "apls5-da51c.firebaseapp.com",
  projectId: "apls5-da51c",
  storageBucket: "apls5-da51c.appspot.com",
  messagingSenderId: "125879910273",
  appId: "1:125879910273:web:86b5b2ea5eeaf075697280",
  measurementId: "G-MDEW36GSYM",
};
try {
  firebase.initializeApp(firebaseConfig);
} catch (e) {
  console.error("error initializing firebase");
}
export default firebase;
