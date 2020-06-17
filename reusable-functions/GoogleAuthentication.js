const firebase = require('firebase');
import { GOOGLE_ANDROID_CLIENT_ID } from 'react-native-dotenv';
import store from "../store";
import { addUID } from "../actions/auth_screen_actions";

export const OAuthConfig = {
    issuer: "https://accounts.google.com",
    clientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/calendar", "profile", "email"],
};

const isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (
                providerData[i].providerId ===
                firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()
            ) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
};

export const onSignIn = (googleUser) => {
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
        unsubscribe();
        // Check if the user trying to sign in is the same as the currently signed in user
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken, googleUser.accessToken
            )

            // Sign in with credential from the Google user.
            firebase
                .auth()
                .signInWithCredential(credential)
                .then(function (result) {
                    // Add user ID to Redux state
                    store.dispatch(addUID(result.user.uid))

                    // Add user information to DB
                    console.log("User is signed in");
                    if (result.additionalUserInfo.isNewUser) {
                        firebase
                            .database()
                            .ref("/users/" + result.user.uid) // Add user node to the DB with unique ID
                            .set({
                                gmail: result.user.email,
                                profile_picture_url:
                                    result.additionalUserInfo.profile.picture,
                                first_name:
                                    result.additionalUserInfo.profile
                                        .given_name,
                                last_name:
                                    result.additionalUserInfo.profile
                                        .family_name,
                                created_at: Date.now(),
                                refresh_token: googleUser.refreshToken,
                                access_token: googleUser.accessToken,
                                access_token_expiration:
                                    googleUser.accessTokenExpirationDate,
                            });
                    } else {
                        // User is not a new user, just update the last logged in time
                        firebase
                            .database()
                            .ref("/users/" + result.user.uid)
                            .update({
                                last_logged_in: Date.now(),
                            });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            console.log("User already signed-in Firebase.");
        }
    });
};
