import firebase from 'firebase';

let config = {
  apiKey: "AIzaSyDe4AjNEGKakKkHprhjQV9hyLkDccqkv2M",
  authDomain: "projeto-teste-6d2ec.firebaseapp.com",
  databaseURL: "https://projeto-teste-6d2ec.firebaseio.com",
  projectId: "projeto-teste-6d2ec",
  storageBucket: "projeto-teste-6d2ec.appspot.com",
  messagingSenderId: "187316445346"
};

firebase.initializeApp(config);

export default firebase;