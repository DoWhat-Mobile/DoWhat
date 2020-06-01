/**
 * Authentication page for login with Facebook, Google, or proceed without logging in
 */
import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import * as actions from "../actions";
import firebase from 'firebase'
import * as AppAuth from 'expo-app-auth';
import { onSignIn, OAuthConfig } from '../reusable-functions/google_authentication_functions';

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
          onSignIn(data); // Sign in to Google's firebase
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
        <View>
          <TouchableOpacity onPress={() => firebase.auth().signOut()} >
            <Text style={{ color: 'blue' }}>Sign out of account</Text>
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