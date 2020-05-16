import * as firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyCbfxXup_hgJdTcjWSRtdL6mtEtiZSN2sU",
    authDomain: "fir-auth-7e01a.firebaseapp.com",
    databaseURL: "https://fir-auth-7e01a.firebaseio.com",
    projectId: "fir-auth-7e01a",
    storageBucket: "fir-auth-7e01a.appspot.com",
    messagingSenderId: "611165447969",
    appId: "1:611165447969:web:a3faefe6cfd805459b8060",
    measurementId: "G-Q9X8YNQCN5"
};

firebase.initializeApp(firebaseConfig);

export default firebase