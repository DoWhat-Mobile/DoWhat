import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { connect } from "react-redux";
import {
    addEvents, addUID, addCurrUserName,
    addProfilePicture, extractCalendarEvents
} from "../actions/auth_screen_actions";
import { setLocation } from '../actions/date_select_action';
const firebase = require('firebase');
import * as AppAuth from "expo-app-auth";
import { onSignIn } from "../reusable-functions/GoogleAuthentication";
import { OAuthConfig } from '../reusable-functions/OAuthConfig';
import Icon from "react-native-vector-icons/FontAwesome";
import { addGcalEventsToRedux } from '../reusable-functions/ExtractCalendarEvents';
import * as Location from "expo-location";

/**
 * Authentication page for login with Google, loads data to Redux state
 */
class AuthScreen extends Component {
    componentDidMount() {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== "granted") {
                console.log("denied");
                // setErrorMsg("Permission to access location was denied");
            }

            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            this.props.setLocation(location);
        })()
        this.checkIfLoggedIn();
        this.addEventsToState(); // Add events from Firebase DB to Redux state
    }


    // Add database of all events from firebase to redux state
    addEventsToState = async () => {
        firebase
            .database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                const allCategories = snapshot.val(); // obj with events of all categories
                this.props.addEvents(allCategories);
            });
    };

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.addCurrUserName(user.displayName.replace(/ /g, "_"))
                this.props.addUID(user.uid) // Add user ID to Redux state
                this.props.addProfilePicture(user.photoURL);
                this.props.navigation.navigate("Home");
                addGcalEventsToRedux(user.uid);
            }
        });
    };

    signInToGoogle = async () => {
        try {
            // Get Oauth2 token
            const tokenResponse = await AppAuth.authAsync(OAuthConfig);
            this.getUserInfoAndSignIn(tokenResponse);
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
                    this.props.navigation.navigate("Home");
                });
        } catch (e) {
            console.log(e);
        }
    };

    render() {
        return (
            <View style={style.container}>
                <View style={style.headers}>
                    <Image
                        style={{
                            width: '100%', marginBottom: "15%",
                            backgroundColor: "#F4F3EE", height: "90%",
                        }}
                        source={require("../assets/Singapore.png")}
                    />
                </View>

                <View style={style.body}>
                    <Text style={{
                        fontSize: 20, fontWeight: "800",
                        fontFamily: 'serif'
                    }}>
                        Welcome to DoWhat!
                    </Text>
                    <Text style={{ fontSize: 12, color: "grey", fontFamily: 'serif' }}>
                        An automated planner that curates your perfect day out, all at your fingertips.
                        Sign in to begin.
                    </Text>
                </View>

                <View style={style.footer}>
                    <View style={style.icons}>
                        <Icon.Button
                            name="google"
                            backgroundColor="white"
                            color="black"
                            iconStyle={{}}
                            borderRadius={5}
                            style={{ borderWidth: 1, borderColor: '#C2BDAB' }}
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
    addEvents, addUID, addCurrUserName, addProfilePicture, extractCalendarEvents,
    setLocation
};

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthScreen);

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    headers: {
        flex: 5,
    },
    body: {
        flex: 1,
        marginLeft: '8%',
        marginRight: '8%'
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
    icons: {
        flexDirection: "row",
        justifyContent: "center",
    },
});
