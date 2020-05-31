/**
 * Authentication page for login with Facebook, Google, or proceed without logging in
 */
import React, { Component } from "react";
import { View, Text, AsyncStorage, TouchableOpacity, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import firebase from 'firebase'
import * as AppAuth from 'expo-app-auth';

const OAuthConfig = {
  issuer: 'https://accounts.google.com',
  // From Google Dev Console credentials (Use Do what Android dev when testing on emulator, use standalone when for expo build)
  // If get Authorization Error 400: redirect_uri_mismatch -> Ensure clientId is from DoWhat Android dev clientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com',
  clientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/calendar', 'profile', 'email'],
}

class AuthScreen extends Component {
  componentDidMount() {
    this.checkIfLoggedIn();
  }

  // If user already logged in, direct user to Gcal input
  checkIfLoggedIn = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.navigation.navigate("DateSelection");
      }
    })
  }

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
      // console.log("Google User: ", googleUser);
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
                  access_token: googleUser.accessToken,
                  access_token_expiration: googleUser.accessTokenExpirationDate
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
            console.log(error);
          });

      } else {
        console.log('User already signed-in Firebase.');
      }
    });
  }

  signInToGoogle = async () => {
    try {
      // Get Oauth2 token
      const tokenResponse = await AppAuth.authAsync(OAuthConfig);
      this.getUserInfoAndSignIn(tokenResponse);
    } catch (e) {
      console.log(e);
    }
  }

  getUserInfoAndSignIn = async (token) => {
    try {
      // Get user email
      fetch('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + token.accessToken,
        {
          method: 'GET',
          headers: new Headers({
            Accept: 'application/json'
          })
        })
        .then(response => response.json())
        // Use the user's email to get the user's busy periods
        .then(data => {
          data['accessToken'] = token.accessToken; // Append additional props for use in google sign in
          data['idToken'] = token.idToken;
          data['refreshToken'] = token.refreshToken;
          data['accessTokenExpirationDate'] = token.accessTokenExpirationDate
          this.onSignIn(data); // Sign in to Google's firebase
        })

    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Login Screen</Text>
        <View style={style.icons}>

          <TouchableOpacity onPress={() => this.signInToGoogle()}>
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

export default connect(null, actions)(AuthScreen);

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