import * as firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyB3DcUhK37rpYdmO2C8_tKoM8-ugnlInaQ",
    authDomain: "dowhat-278213.firebaseapp.com",
    databaseURL: "https://dowhat-278213.firebaseio.com",
    projectId: "dowhat-278213",
    storageBucket: "dowhat-278213.appspot.com",
    messagingSenderId: "119205196255",
    appId: "1:119205196255:web:7acc022aba4e5b9c83546a",
    measurementId: "G-5GS3THDPQK"
};

firebase.initializeApp(firebaseConfig);

export default firebase