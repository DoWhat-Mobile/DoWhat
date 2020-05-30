/**
 * Login page for users to log into Google if they have not done so already.
 */
import React, { Component } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { connect } from 'react-redux'
import * as actions from '../actions';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';

const OAuthConfig = {
    issuer: 'https://accounts.google.com',
    // From Google Dev Console credentials (Use Do what Android dev when testing on emulator, use standalone when for expo build)
    clientId: '119205196255-v694sr5re0uaqrpl1t6hbpgtecmd5spp.apps.googleusercontent.com',
    // All available scopes for Gapi found here : https://developers.google.com/identity/protocols/oauth2/scopes#calendar
    scopes: ['https://www.googleapis.com/auth/calendar'],
}

// API Key must be changed accordingly. Depending whther its a standalone build or from expo.
const url = 'https://www.googleapis.com/calendar/v3/freeBusy?key=AIzaSyA98MBxh0oZKqPJC6SvGspEz60ImpEaW9Q'

const data = JSON.stringify({
    'timeMin': '2020-04-28T08:00:00+08:00',
    'timeMax': '2020-04-28T20:00:00+08:00',
    'timeZone': 'UTC+08:00',
    'items': [
        {
            'id': 'hansybastian@gmail.com'
        }
    ]
})

const getAvailableTimings = async (token) => {
    try {
        fetch(url, {
            method: 'POST',
            body: data,
            headers: new Headers({
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.accessToken
            })
        })
            .then(response => response.json())
            .then(data => console.log(data))
    } catch (e) {
        console.log(e);
    }
}

class GoogleLogin extends Component {
    isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    }

    onSignIn = (googleUser) => {
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe();
            console.log("Google User: ", googleUser);
            // Check if the user trying to sign in is the same as the currently signed in user
            if (!this.isUserEqual(googleUser, firebaseUser)) {
                // Build Firebase credential with the Google ID token.
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accessToken
                );
                // Sign in with credential from the Google user.
                firebase
                    .auth()
                    .signInWithCredential(credential)
                    .then(function (result) { // Add user information to DB
                        console.log("User is signed in")
                        if (result.additionalUserInfo.isNewUser) {
                            firebase
                                .database()
                                .ref('/users/' + result.user.uid) // Add user node to the DB with unique ID
                                .set({
                                    gmail: result.user.email,
                                    profile_picture_url: result.additionalUserInfo.profile.picture,
                                    first_name: result.additionalUserInfo.profile.given_name,
                                    last_name: result.additionalUserInfo.profile.family_name,
                                    created_at: Date.now(),
                                    refresh_token: googleUser.refreshToken,
                                    access_token: googleUser.accessToken
                                })
                                .then(function (snapshot) {
                                    // console.log('Snapshot ', snapshot);
                                });
                            console.log('Getting available timings...');
                            getAvailableTimings(googleUser.accessToken);
                        } else { // User is not a new user, just update the last logged in time
                            firebase
                                .database()
                                .ref('/users/' + result.user.uid).update({
                                    last_logged_in: Date.now()
                                })
                        }
                    })
                    .catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                        console.log(error);
                    });

            } else {
                console.log('User already signed-in Firebase.');
            }
        });
    }

    signInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
                androidClientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com', // For testing in emulator
                iosClientId: '119205196255-ofp61a7qv7g38812gmafsdo37si7l4q5.apps.googleusercontent.com',
                androidStandaloneAppClientId: '119205196255-lcv5g36f8vi054f4h1bpkk9rj0tgk9fs.apps.googleusercontent.com', // For testing in standalone app, from Google Dev Console
                scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
            });

            if (result.type === 'success') {
                this.onSignIn(result);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            return { error: true };
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Button title='Sign in with Google'
                    onPress={() => this.signInWithGoogleAsync()} />
            </View>

        );
    }
}

export default connect(null, actions)(GoogleLogin);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})