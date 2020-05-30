/**
 * Authentication page for login with Facebook, Google, or proceed without logging in
 */
import React, { Component } from "react";
import { View, Text, AsyncStorage, TouchableOpacity, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase'

class AuthScreen extends Component {//= (props) => {
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
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
      unsubscribe();

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
                  created_at: Date.now()
                })
                .then(function (snapshot) {
                  // console.log('Snapshot ', snapshot);
                });
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
            // ...
          });
      } else {
        console.log('User already signed-in Firebase.');
      }
    });
  }

  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com',
        iosClientId: '119205196255-ofp61a7qv7g38812gmafsdo37si7l4q5.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Login Screen</Text>
        <View style={style.icons}>

          <TouchableOpacity onPress={() => this.props.navigation.navigate("LoadingScreen")}>
            <Image source={require('../assets/google.png')} stlye={style.google} />
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("DateSelection")} >
            <Text style={{ color: 'blue' }}>Proceed Without Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

function mapStateToProps({ auth }) {
  return { token: auth.token };
}

export default connect(mapStateToProps, actions)(AuthScreen);

const style = StyleSheet.create({
  google: {
    resizeMode: 'contain',

  },
  facebook: {
    width: 40,
    height: 40,
  },
  icons: {
    flexDirection: "row",
    justifyContent: 'center'
  }
})