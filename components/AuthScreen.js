/**
 * Authentication page for login with Facebook, Google, or proceed without logging in
 */
import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { addEvents } from "../actions/auth_screen_actions";
const firebase = require('firebase');
import * as AppAuth from "expo-app-auth";
import {
    onSignIn,
    OAuthConfig,
} from "../reusable-functions/GoogleAuthentication";
import Icon from "react-native-vector-icons/FontAwesome";

class AuthScreen extends Component {
    componentDidMount() {
        this.checkIfLoggedIn();
    }

    addEventsToState = () => {
        firebase.database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                const allCategories = snapshot.val(); // obj with events of all categories
                this.props.addEvents(allCategories);
            })
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.addEventsToState();
                this.props.navigation.navigate("Home");
            }
        });
    };

    signInToGoogle = async () => {
        try {
            // Get Oauth2 token
            const tokenResponse = await AppAuth.authAsync(OAuthConfig);
            await this.getUserInfoAndSignIn(tokenResponse);
            this.checkIfLoggedIn()
            //this.addEventsToState();
            //this.props.navigation.navigate("Home");
        } catch (e) {
            console.log(e);
        }
    };

    getUserInfoAndSignIn = async (token) => {
        try {
            // Get user email
            fetch(
                "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" +
                token.accessToken,
                {
                    method: "GET",
                    headers: new Headers({
                        Accept: "application/json",
                    }),
                }
            )
                .then((response) => response.json())
                // Use the user's email to get the user's busy periods
                .then((data) => {
                    data["accessToken"] = token.accessToken; // Append additional props for use in google sign in
                    data["idToken"] = token.idToken;
                    data["refreshToken"] = token.refreshToken;
                    data["accessTokenExpirationDate"] =
                        token.accessTokenExpirationDate;
                    onSignIn(data); // Sign in to Google's firebase
                });
        } catch (e) {
            console.log(e);
        }
    };

    render() {
        return (
            <View style={style.container}>
                <View style={style.headers}>
                    <Text style={{ fontSize: 20, fontWeight: "500" }}>
                        Welcome to DoWhat!
                    </Text>
                    <Text style={{ fontSize: 14, color: "grey" }}>
                        No plan? No problem.
                    </Text>
                </View>

                <View style={style.body}>
                    <Image style={style.image} source={require('../assets/Singapore.png')} />
                </View>

                <View style={style.footer}>
                    <TouchableOpacity onPress={() => firebase.auth().signOut()}>
                        <Text style={{ color: "blue" }}>
                            Sign out of account
                        </Text>
                    </TouchableOpacity>

                    <View style={style.icons}>
                        <Icon.Button
                            name="google"
                            backgroundColor="white"
                            color="grey"
                            iconStyle={{}}
                            borderRadius={10}
                            onPress={this.signInToGoogle}
                        >
                            Sign in with Google
                        </Icon.Button>
                    </View>
                </View>
            </View>
        );
    }
}

const mapDispatchToProps = {
    addEvents,
};

export default connect(null, mapDispatchToProps)(AuthScreen);

const style = StyleSheet.create({
    container: {
        flex: 1,
    },

    headers: {
        flex: 1,
        marginLeft: "10%",
        marginTop: "10%",
    },

    body: {
        flex: 5,
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
    },

    footer: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "column-reverse",
        marginBottom: "10%",
    },

    google: {
        resizeMode: "contain",
    },

    facebook: {
        width: 40,
        height: 40,
    },

    icons: {
        flexDirection: "row",
        justifyContent: "center",
    },
    image: {
        width: '90%',
        borderTopWidth: 30,
        marginBottom: '15%',
        borderRadius: 15,
        borderWidth: 0.2,
        borderColor: 'grey',
        backgroundColor: '#F4F3EE',
        height: '90%'
    }
});