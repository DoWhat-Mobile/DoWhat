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
    // All available scopes for Gapi found here : https://developers.google.com/identity/protocols/oauth2/scopes#calendar
    scopes: ['https://www.googleapis.com/auth/calendar', 'profile', 'email']
}

const url = 'https://www.googleapis.com/calendar/v3/freeBusy?key=AIzaSyA98MBxh0oZKqPJC6SvGspEz60ImpEaW9Q'


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
    authenticateAndGetBusyPeriods = async () => {
        try {
            // Get Oauth2 token
            const tokenResponse = await AppAuth.authAsync(OAuthConfig);
            this.getUserEmailAndBusyPeriods(tokenResponse);
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

    //Google Calendar free/busy API call
    getBusyPeriods = async (token, userEmail) => {
        try {
            fetch(url, {
                method: 'POST',
                body: this.getData(userEmail),
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

    getUserEmailAndBusyPeriods = async (token) => {
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
                .then(data => this.getBusyPeriods(token, data.email))

        } catch (e) {
            console.log(e);
        }
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
                    onPress={() => this.authenticateAndGetBusyPeriods()} />
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