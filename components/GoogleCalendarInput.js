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
import { onSignIn, OAuthConfig } from '../reusable-functions/google_authentication_functions';

class GoogleCalendarInput extends React.Component {
    authenticateAndGetBusyPeriods = async () => {
        try {
            // Get Oauth2 token
            const tokenResponse = await AppAuth.authAsync(OAuthConfig);
            this.getUserEmailThenBusyPeriod(tokenResponse);
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
                    onSignIn(data); // Sign in to Google's firebase
                    this.findAndStoreBusyPeriod(token, data.email);
                })

        } catch (e) {
            console.log(e);
        }
    }

    userAlreadyLoggedIn = () => {
        var user = firebase.auth().currentUser;
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    getBusyPeriods = () => {
        this.props.navigation.navigate("FriendInput");
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

                <View style={style.body}>
                    <View style={style.calendar}>
                        <FontAwesomeIcon icon={faCalendarAlt} size={80} />
                    </View>
                    <View style={style.bodyText}>
                        <Text style={style.header}>Sync Google Calendar</Text>
                        <Text style={style.subHeader}>
                            Upload your Google calendar for automated planning
                    </Text>
                    </View>
                </View>

                <View style={style.footer}>
                    <Button title='Skip'
                        onPress={() => this.props.navigation.navigate('Timeline')} />
                    <Button title='Continue'
                        onPress={() => this.props.navigation.navigate('FriendInput')} /*this.getBusyPeriods()*/ />
                </View>

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
    },
    body: {
        flex: 8,
        marginTop: '20%',
        marginBottom: '10%',
    },
    calendar: {
        borderRadius: 50,
        borderWidth: 0.5,
        padding: 30,
        alignSelf: 'center'
    },
    bodyText: {
        marginTop: '10%',
    },
    header: {
        fontSize: 32,
        textAlign: 'center',
        fontFamily: 'serif'
    },
    subHeader: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'serif'
    },
    footer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }

});