/**
 * Page for first step of application flow: Uploading of google calendar to get free timings
 * If a user does not want to upload google calendar, the user will skip and move on to manual
 * input of free timings instead.
 */
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import * as actions from '../actions';
import firebase from 'firebase';
import * as AppAuth from 'expo-app-auth';
import * as Linking from 'expo-linking';

const OAuthConfig = {
    issuer: 'https://accounts.google.com',
    // From Google Dev Console credentials (Use Do what Android dev when testing on emulator, use standalone when for expo build)
    // If get Authorization Error 400: redirect_uri_mismatch -> Ensure clientId is from DoWhat Android dev
    clientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/calendar', 'profile', 'email'],
}

const shareWithTelegram = (url) => {
    Linking.openURL('https://t.me/share/url?url=' + url + '&text=Here is the link to input your' +
        'calendar availability!');
}

const shareWithWhatsapp = (url) => {
    Linking.openURL('whatsapp://send?' +
        'text=Here is the link to input your calendar availability!' +
        '')
}

class GoogleCalendarInput extends React.Component {
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

    authenticateAndGetBusyPeriods = async () => {
        try {
            // Get Oauth2 token
            const tokenResponse = await AppAuth.authAsync(OAuthConfig);
            this.getUserEmailThenBusyPeriod(tokenResponse);
            this.props.navigation.navigate("Genre");
        } catch (e) {
            console.log(e);
        }
    }

    // Extract free/busy timings from the selected date, and the extracted user email
    getData = userEmail => JSON.stringify({
        'timeMin': this.props.date + 'T08:00:00+08:00',
        'timeMax': this.props.date + 'T23:59:00+08:00',
        'timeZone': 'UTC+08:00',
        'items': [
            {
                'id': userEmail
            }
        ]
    })

    /**
     * Google Calendar free/busy API call, user's free/busy period will be stored into firebase as well.
     **/
    findAndStoreBusyPeriod = async (token, userEmail) => {
        try {
            var accessToken = token.accessToken;
            if (this.checkIfTokenExpired(token.accessTokenExpirationDate)) {
                // Use refresh token to generate new access token if access token has expired
                accessToken = (await AppAuth.refreshAsync(OAuthConfig, token.refreshToken)).accessToken;
            }

            fetch('https://www.googleapis.com/calendar/v3/freeBusy?key=AIzaSyA98MBxh0oZKqPJC6SvGspEz60ImpEaW9Q',
                {
                    method: 'POST',
                    body: this.getData(userEmail),
                    headers: new Headers({
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + accessToken
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // Store busy data into firebase
                    const userId = firebase.auth().currentUser.uid;
                    firebase.database().ref('users/' + userId)
                        .child('busy_periods')
                        .set(data.calendars[userEmail].busy)
                })

        } catch (e) {
            console.log(e);
        }
    }

    getUserEmailThenBusyPeriod = async (token) => {
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
                    this.onSignIn(data); // Sign in to Google's firebase
                    this.findAndStoreBusyPeriod(token, data.email);
                })

        } catch (e) {
            console.log(e);
        }
    }

    userAlreadyLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                return true;
            } else {
                return false;
            }
        })
    }

    getBusyPeriods = () => {
        if (this.userAlreadyLoggedIn()) {
            this.useFirebaseDataAndGetBusyPeriod();
        } else {
            this.authenticateAndGetBusyPeriods();
        }
    }

    useFirebaseDataAndGetBusyPeriod = async () => {
        try {
            const userId = firebase.auth().currentUser.uid;
            firebase.database().ref('users/' + userId).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val();
                    // token is object for compatibility with findAndStoreBusyPeriod input
                    const token = {
                        accessToken: userData.access_token,
                        refreshToken: userData.refresh_token,
                        accessTokenExpirationDate: userData.access_token_expiration
                    };
                    const userEmail = userData.gmail;
                    this.findAndStoreBusyPeriod(token, userEmail);
                })

        } catch (e) {
            console.log(e);
        }
    }

    checkIfTokenExpired = (accessTokenExpirationDate) => {
        return new Date(accessTokenExpirationDate) < new Date();
    }

    render() {
        return (
            <View style={style.container}>
                <View style={style.calendar}>
                    <FontAwesomeIcon icon={faCalendarAlt} size={80} />
                </View>
                <View>
                    <Text style={style.header}>Sync Google Calendar</Text>
                    <Text style={style.subHeader}>
                        Upload your Google calendar for automated planning
                    </Text>
                    <Text>{this.props.token}</Text>
                </View>
                <Button title='Skip'
                    onPress={() => this.props.navigation.navigate('Timeline')} />
                <Button title='Continue'
                    onPress={() => this.useFirebaseDataAndGetBusyPeriod()} />
                <Button title='Share with Telegram'
                    onPress={() => shareWithTelegram(Linking.makeUrl())} />
                <Button title='Share with Whatsapp'
                    onPress={() => shareWithWhatsapp(Linking.makeUrl())} />
            </View>
        );
    }
}

const formatDateToString = date => {
    const year = date.getFullYear().toString();
    var month = date.getMonth() + 1; // Offset by 1 due to Javascrip Date object format
    month = month >= 10 ? month.toString() : '0' + month.toString();
    const day = date.getDate().toString();
    const dateString = year + '-' + month.toString() + '-' + day;
    return dateString;
}

// Get previously inputted date from DateSelection for API call
const mapStateToProps = (state) => {
    const dateInString = formatDateToString(state.date_select.date);
    return {
        date: dateInString
    }
}

export default connect(mapStateToProps, actions)(GoogleCalendarInput);

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
    },
    calendar: {
        marginBottom: 50,
    },
    header: {
        fontSize: 32,
        color: '#7385d9',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: '#7385d9',
        textAlign: 'center',
    }

});