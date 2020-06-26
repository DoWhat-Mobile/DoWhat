const firebase = require('firebase');
import { GOOGLE_ANDROID_CLIENT_ID, STANDALONE_GOOGLE_ANDROID_CLIENT_ID } from 'react-native-dotenv';
import store from "../store";
import { addUID } from "../actions/auth_screen_actions";
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

export const OAuthConfig = {
    issuer: "https://accounts.google.com",
    clientId: GOOGLE_ANDROID_CLIENT_ID, // use STANDALONE Client ID if using built expo app
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
                    // Add push token to Firebase for notification sending
                    registerForPushNotificationsAsync(result.user.uid);
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
                        registerForPushNotificationsAsync(result.user.id);
                        firebase
                            .database()
                            .ref("/users/" + result.user.uid)
                            .update({
                                last_logged_in: Date.now(),
                                refresh_token: googleUser.refreshToken,
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

// Get push token and set it in the user's Firebase node
const registerForPushNotificationsAsync = async (userId) => {
    console.log("Registering for push token with userID : ", userId)

    if (Constants.isDevice) {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        try {
            let token = await Notifications.getExpoPushTokenAsync();
            console.log("Expo notif token is: ", token);
            if (userId != undefined) {
                firebase.database().ref('users/' + userId + "/push_token")
                    .set(token);
            }

        } catch (err) {
            console.log("Error putting user's expo notif token to Firebase", err);
        }
        alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.createChannelAndroidAsync('default', {
            name: 'default',
            sound: true,
            priority: 'max',
            vibrate: [0, 250, 250, 250],
        });
    }
};