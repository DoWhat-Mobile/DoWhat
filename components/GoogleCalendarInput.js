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

const OAuthConfig = {
    issuer: 'https://accounts.google.com',
    // From Google Dev Console credentials (Use Do what Android dev when testing on emulator, use standalone when for expo build)
    // If get Authorization Error 400: redirect_uri_mismatch -> Ensure clientId is from DoWhat Android dev
    clientId: '119205196255-0hi8thq9lm1759jr8k5o1ld8h239olr5.apps.googleusercontent.com',
    // All available scopes for Gapi found here : https://developers.google.com/identity/protocols/oauth2/scopes#calendar
    scopes: ['https://www.googleapis.com/auth/calendar']
}

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

const getGcalAuthorization = async () => {
    try {
        const tokenResponse = await AppAuth.authAsync(OAuthConfig);
        getAvailableTimings(tokenResponse);
    } catch (e) {
        console.log(e);
    }
}

class GoogleCalendarInput extends React.Component {
    loginToGoogle() {
        this.props.navigation.navigate('LoadingScreen');
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.props.navigation.navigate("ExtractGcalAvails");
            } else {
                this.loginToGoogle();
            }
        })
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
                    onPress={() => this.checkIfLoggedIn()} />
                <Button title='Get Authorization'
                    onPress={() => getGcalAuthorization()} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.token,
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